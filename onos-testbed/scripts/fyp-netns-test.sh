#!/usr/bin/env bash
set -euo pipefail

# fyp-netns-test.sh
# -----------------
# Allowlisted helper for running safe network tests inside Linux namespaces.
# Intended to be called via sudo from the backend, NOT directly by users.
#
# Commands:
#   list
#   ping <src_ns> <dst_ip> [count] [timeout_seconds]
#   iperf <src_ns> <dst_ns> <dst_ip> <tcp|udp> [port] [duration_seconds] [udp_mbps] [tos_hex]
#
# Output: JSON to stdout.

die_json() {
  local msg="$1"
  echo "{\"ok\":false,\"error\":\"${msg//\"/\\\"}\"}"
  exit 1
}

is_valid_ns() {
  [[ "$1" =~ ^h[0-9]+$ ]]
}

is_valid_ipv4() {
  local ip="$1"
  [[ "$ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || return 1
  IFS='.' read -r a b c d <<<"$ip"
  for part in "$a" "$b" "$c" "$d"; do
    (( part >= 0 && part <= 255 )) || return 1
  done
  return 0
}

is_valid_proto() {
  [[ "$1" == "tcp" || "$1" == "udp" ]]
}

is_valid_tos() {
  # iperf3 expects an 8-bit TOS byte (often written as hex)
  # Example: 0xb8 (DSCP EF 46 << 2)
  [[ -z "${1:-}" ]] && return 0
  [[ "$1" =~ ^0x[0-9a-fA-F]{1,2}$ ]]
}

json_escape() {
  # Minimal JSON escaping for stdout/stderr content
  # Note: JSON strings cannot contain literal tab/newline characters.
  # iperf3 emits pretty JSON with tabs/newlines; we must escape both.
  # IMPORTANT: We must first slurp the entire input into pattern space (so escaping applies to *all* lines),
  # then escape characters on the whole blob.
  sed -e ':a;N;$!ba' \
      -e 's/\\/\\\\/g' \
      -e 's/"/\\"/g' \
      -e 's/	/\\t/g' \
      -e 's/\r//g' \
      -e 's/\n/\\n/g'
}

cmd="${1:-}"
shift || true

case "$cmd" in
  list)
    # Output: {"ok":true,"namespaces":[{"name":"h1","ips":["10.0.0.1"]},...]}
    mapfile -t nss < <(ip netns list | awk '{print $1}' | sort)
    out='{"ok":true,"namespaces":['
    first=1
    for ns in "${nss[@]}"; do
      [[ -n "$ns" ]] || continue
      if ! is_valid_ns "$ns"; then
        continue
      fi
      # Grab global IPv4 addresses in that namespace (best-effort)
      # IMPORTANT: escape `$4` so bash doesn't treat it as a positional parameter (set -u).
      # We want awk to see `$4` literally, so we pass `\$4` through bash.
      ips=$(ip netns exec "$ns" sh -c "ip -4 -o addr show scope global 2>/dev/null | awk '{print \$4}' | cut -d/ -f1" || true)
      ip_json='['
      ip_first=1
      while read -r ip; do
        [[ -n "$ip" ]] || continue
        if ! is_valid_ipv4 "$ip"; then
          continue
        fi
        if [[ $ip_first -eq 0 ]]; then ip_json+=','; fi
        ip_json+="\"$ip\""
        ip_first=0
      done <<<"$ips"
      ip_json+=']'

      if [[ $first -eq 0 ]]; then out+=','; fi
      out+="{\"name\":\"$ns\",\"ips\":$ip_json}"
      first=0
    done
    out+=']}'
    echo "$out"
    ;;

  ping)
    src_ns="${1:-}"; dst_ip="${2:-}"
    count="${3:-3}"; timeout_s="${4:-6}"

    [[ -n "$src_ns" ]] || die_json "src_ns required"
    [[ -n "$dst_ip" ]] || die_json "dst_ip required"
    is_valid_ns "$src_ns" || die_json "invalid namespace: $src_ns"
    is_valid_ipv4 "$dst_ip" || die_json "invalid ipv4: $dst_ip"

    # Validate numeric args
    [[ "$count" =~ ^[0-9]+$ ]] || die_json "count must be integer"
    [[ "$timeout_s" =~ ^[0-9]+$ ]] || die_json "timeout_seconds must be integer"
    (( count >= 1 && count <= 10 )) || die_json "count out of range (1-10)"
    (( timeout_s >= 1 && timeout_s <= 20 )) || die_json "timeout out of range (1-20)"

    # Run ping with timeout to avoid hanging.
    # -w sets overall deadline, -c sets packet count
    cmdline=(ip netns exec "$src_ns" ping -n -c "$count" -w "$timeout_s" "$dst_ip")
    set +e
    stdout="$("${cmdline[@]}" 2>&1)"
    exit_code=$?
    set -e

    # Parse basic metrics (best-effort)
    loss_pct=""
    rtt_avg_ms=""
    summary_line=$(echo "$stdout" | grep -E "packet loss" | tail -n 1)
    if [[ -n "$summary_line" ]]; then
      loss_pct=$(echo "$summary_line" | awk -F',' '{for(i=1;i<=NF;i++){if($i~/% packet loss/){gsub(/^[ \t]+|[ \t]+$/,"",$i); print $i}}}' | awk '{print $1}' | tr -d '%')
    fi
    rtt_line=$(echo "$stdout" | grep -E "^rtt |^round-trip " | tail -n 1)
    if [[ -n "$rtt_line" ]]; then
      # rtt min/avg/max/mdev = 0.026/0.030/0.034/0.003 ms
      rtt_avg_ms=$(echo "$rtt_line" | awk -F'=' '{print $2}' | awk '{print $1}' | cut -d/ -f2)
    fi

    esc_out=$(echo "$stdout" | json_escape)
    ok="false"
    if [[ $exit_code -eq 0 ]]; then ok="true"; fi
    echo "{\"ok\":$ok,\"type\":\"ping\",\"src_ns\":\"$src_ns\",\"dst_ip\":\"$dst_ip\",\"count\":$count,\"timeout_seconds\":$timeout_s,\"exit_code\":$exit_code,\"loss_pct\":${loss_pct:-null},\"rtt_avg_ms\":${rtt_avg_ms:-null},\"raw\":\"$esc_out\"}"
    ;;

  iperf)
    src_ns="${1:-}"; dst_ns="${2:-}"; dst_ip="${3:-}"; proto="${4:-}"
    port="${5:-5201}"; duration_s="${6:-5}"; udp_mbps="${7:-10}"; tos_hex="${8:-}"

    [[ -n "$src_ns" ]] || die_json "src_ns required"
    [[ -n "$dst_ns" ]] || die_json "dst_ns required"
    [[ -n "$dst_ip" ]] || die_json "dst_ip required"
    [[ -n "$proto" ]] || die_json "protocol required (tcp|udp)"

    is_valid_ns "$src_ns" || die_json "invalid namespace: $src_ns"
    is_valid_ns "$dst_ns" || die_json "invalid namespace: $dst_ns"
    is_valid_ipv4 "$dst_ip" || die_json "invalid ipv4: $dst_ip"
    is_valid_proto "$proto" || die_json "invalid protocol: $proto"
    is_valid_tos "$tos_hex" || die_json "invalid tos (expected 0x.. byte): $tos_hex"

    command -v iperf3 >/dev/null 2>&1 || die_json "iperf3 is not installed"
    command -v timeout >/dev/null 2>&1 || die_json "timeout is not installed"

    [[ "$port" =~ ^[0-9]+$ ]] || die_json "port must be integer"
    [[ "$duration_s" =~ ^[0-9]+$ ]] || die_json "duration_seconds must be integer"
    (( port >= 1 && port <= 65535 )) || die_json "port out of range (1-65535)"
    (( duration_s >= 1 && duration_s <= 60 )) || die_json "duration out of range (1-60)"

    if [[ "$proto" == "udp" ]]; then
      [[ "$udp_mbps" =~ ^[0-9]+$ ]] || die_json "udp_mbps must be integer"
      (( udp_mbps >= 1 && udp_mbps <= 10000 )) || die_json "udp_mbps out of range (1-10000)"
    fi

    tmp_server="$(mktemp)"
    tmp_client="$(mktemp)"
    cleanup() {
      rm -f "$tmp_server" "$tmp_client"
    }
    trap cleanup EXIT

    # Start iperf3 server in destination namespace (one test then exit)
    # Use a short startup delay to ensure server is listening.
    set +e
    ip netns exec "$dst_ns" timeout 12 iperf3 -s -1 -p "$port" --json >"$tmp_server" 2>&1 &
    server_pid=$!
    set -e
    sleep 0.3

    # Run client in source namespace
    client_cmd=(ip netns exec "$src_ns" timeout $((duration_s + 8)) iperf3 -c "$dst_ip" -p "$port" -t "$duration_s" --json)
    if [[ "$proto" == "udp" ]]; then
      client_cmd+=( -u -b "${udp_mbps}M" )
    fi
    if [[ -n "$tos_hex" ]]; then
      client_cmd+=( -S "$tos_hex" )
    fi

    set +e
    "${client_cmd[@]}" >"$tmp_client" 2>&1
    client_exit=$?
    set -e

    # Ensure server exits; kill if it's still around.
    set +e
    wait "$server_pid" 2>/dev/null
    wait_exit=$?
    if kill -0 "$server_pid" 2>/dev/null; then
      kill "$server_pid" 2>/dev/null || true
    fi
    set -e

    server_out="$(cat "$tmp_server" || true)"
    client_out="$(cat "$tmp_client" || true)"
    esc_server="$(echo "$server_out" | json_escape)"
    esc_client="$(echo "$client_out" | json_escape)"

    ok="false"
    if [[ $client_exit -eq 0 ]]; then ok="true"; fi

    udp_mbps_json="null"
    if [[ "$proto" == "udp" ]]; then udp_mbps_json="$udp_mbps"; fi
    tos_json="null"
    if [[ -n "$tos_hex" ]]; then tos_json="\"$tos_hex\""; fi

    echo "{\"ok\":$ok,\"type\":\"iperf\",\"protocol\":\"$proto\",\"src_ns\":\"$src_ns\",\"dst_ns\":\"$dst_ns\",\"dst_ip\":\"$dst_ip\",\"port\":$port,\"duration_seconds\":$duration_s,\"udp_mbps\":$udp_mbps_json,\"tos\":$tos_json,\"exit_code\":$client_exit,\"server_exit_code\":$wait_exit,\"client_raw\":\"$esc_client\",\"server_raw\":\"$esc_server\"}"
    ;;

  *)
    die_json "unknown command: $cmd"
    ;;
esac




