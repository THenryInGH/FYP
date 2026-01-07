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

json_escape() {
  # Minimal JSON escaping for stdout/stderr content
  sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\r//g' -e ':a;N;$!ba;s/\n/\\n/g'
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

  *)
    die_json "unknown command: $cmd"
    ;;
esac




