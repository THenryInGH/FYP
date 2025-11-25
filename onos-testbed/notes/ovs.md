# [**Open vSwitch**](https://www.openvswitch.org/)
- open source multilayer switch
- it behave like a L2 switch by default
- need configuration or enable ONOS application to route across network

---
## 🛠️ OVS “User Manual” (FYP-oriented)

---

### 1. Key OVS Components & Commands

| Component / Tool | Purpose                                                   | Typical Use in FYP                              |
| ---------------- | --------------------------------------------------------- | ----------------------------------------------- |
| **ovs-vsctl**    | Configure OVS via OVSDB (add bridges, ports, controllers) | Create bridges, add ports, set controller       |
| **ovs-ofctl**    | Manage OpenFlow rules on a bridge                         | Add / dump / delete flow rules                  |
| **ovs-vswitchd** | The data plane daemon (packet forwarding)                 | Under the hood — ensure it's running            |
| **ovsdb-server** | The database server storing OVS config                    | You rarely call directly, but OVS depends on it |
| **ovs-appctl**   | Control / query running OVS daemons (via control socket)  | E.g. ask current flow stats, debug info         |

---

## 2. Common Commands & Patterns

Here’s a “command cheat sheet” distilled from official docs + man pages for your main uses.

### 2.1 Bridge & Port Setup (via `ovs-vsctl`)

```bash
# Create a new OVS bridge named br0
sudo ovs-vsctl add-br br0

# Delete a bridge
sudo ovs-vsctl del-br br0

# Add interface (e.g. veth or physical NIC) to a bridge
sudo ovs-vsctl add-port br0 veth1

# Remove interface from bridge
sudo ovs-vsctl del-port br0 veth1

# Set controller for the bridge (ONOS controller at IP:port)
sudo ovs-vsctl set-controller br0 tcp:127.0.0.1:6653

# Show all OVS configuration (bridges, controllers, ports)
sudo ovs-vsctl show

# List all bridges
sudo ovs-vsctl list-br

# List all interfaces known to OVS
sudo ovs-vsctl list interface
```

**Tips:**

* Always use `sudo` (or be in correct group) when touching OVSDB.
* After `add-port`, you may need to `ip link set up` on the interface if it’s down.

---

### 2.2 Flow Rules (via `ovs-ofctl`)

```bash
# List all flows in br0
sudo ovs-ofctl dump-flows br0

# Add a new flow (match + action)
sudo ovs-ofctl add-flow br0 "in_port=1,ip,nw_dst=10.0.0.2,actions=output:2"
sudo ovs-ofctl add-flow s1 "priority=XXX,<match fields>,actions=<actions>"


# Delete flows (e.g. all flows)
sudo ovs-ofctl del-flows br0

# Dump flow stats / more verbose
sudo ovs-ofctl dump-flows br0 -O OpenFlow13
```

**Notes:**

* You might need to specify OpenFlow version (e.g. `-O OpenFlow13`) depending on what your controller expects.
* Flows are matched by fields (in\_port, ip, vlan, dl\_type, etc.) and you specify actions (output\:N, drop, set\_field, etc.).

---

### 2.3 Query / Control OVS Daemons (via `ovs-appctl`)

```bash
# Version of running ovs-vswitchd
sudo ovs-appctl version

# Show manager or daemon info
sudo ovs-appctl dpctl/show

# Dump database (OVSDB) info / connections
sudo ovs-appctl db/show

# Show OpenFlow connections for a bridge
sudo ovs-appctl monitor br0
```

These are useful for debugging or introspection.

---

## 3. Typical Workflow in Testbed

Putting it all together, here’s how you’ll likely proceed:

1. **Clean environment** (remove old bridges, netns, veth)
2. **Create namespaces and veth pairs**

   ```bash
   sudo ip netns add h1
   sudo ip netns add h2
   sudo ip link add v1 type veth peer name v2
   sudo ip link set v1 netns h1
   sudo ip link set v2 netns h2
   # assign IPs, bring up links
   ```
3. **Create OVS bridge(s)**

   ```bash
   sudo ovs-vsctl add-br br0
   ```
4. **Attach veth ends (from netns) to bridges**

   ```bash
   sudo ovs-vsctl add-port br0 v1
   sudo ovs-vsctl add-port br0 v2
   ```
5. **Set controller on OVS bridge**

   ```bash
   sudo ovs-vsctl set-controller br0 tcp:127.0.0.1:6653
   ```
6. **Start ONOS (or ensure it’s running)**
   ONOS should connect via OpenFlow & optionally OVSDB to the bridge.
7. **Check connectivity and flows**

   * From namespace: `ip netns exec h1 ping 10.0.0.x`
   * From host: `sudo ovs-ofctl dump-flows br0`
   * Use `ovs-appctl` to inspect runtime status

---

## 4. Important Concepts from Official Docs (Simplified)

From the man pages list on the Open vSwitch site ([Open vSwitch][1]), some documents worth knowing:

* **ovsdb(5)** — schema of database (bridges, ports, controllers)
* **ovs-actions(7)** — actions you can apply in flow rules (output, set\_field, drop, etc.)
* **ovs-dpctl(8)** — low-level datapath control (especially when using kernel datapath)
* **ovs-vswitchd.conf.db(5)** — config file for vswitchd
* **ovs-ofctl(8)** — command-line interface for OpenFlow operations
* **ovs-appctl(8)** — interface to control/query the OVS daemons

You can read those if you need advanced features (e.g. tunnels, QoS, meter tables).

---


[1]: https://www.openvswitch.org/support/dist-docs/ "Open vSwitch 3.6.0 Documentation"
