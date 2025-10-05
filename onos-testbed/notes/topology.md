# Topology selection
## FYP does:
- Translate plain word intents to ONOS intent framework
- Optimize bandwidth, routing, load balancing
- Provide monitoring + visualization   

## Tology need to have:
- multiple paths between host (for routing optimization)
- enough hosts to generate competing traffic (for bandwidth allocation)
- some redundant links (for load balancing)

**Tree** or **Small Mesh** are the best fits
I’d suggest:

Final Testbed Topology:

3–4 switches (small tree or triangle mesh).

4–6 hosts (namespaces).

All switches controlled by ONOS.

For example, a tree:
### Tree Topology
Tree topology in networking means the graph of nodes follows a **hierarchical tree structure**
- the core is to provide **scalability** to network grow

Often used in:
- large network
- corporate offices, campuses and data centers

Features:
- One root, branches, leaves 
- Each child has exactly one parent
- No loop 
- IP assign in same subnet first

```less
          s1 (root)
         /   \
       s2     s3
      /  \   /  \
    h1   h2 h3  h4
```

Or a mesh:
### Mesh Topology
In graph theory term, a mesh topology means every node is directly connected to one or more other nodes.
- the core is to provide **redundant paths** between endpoints for high fault tolerance

Often used in:
- WANs, data centers and wireless network

Features:
- Switch-to-switch links are expected
- No mesh formed between hosts
- At least 2 redundant path between hosts

Types:
- **Full Mesh**: All switches are interconnected (expensive)
- **Partial Mesh**: Each switch connects to at least 2 others(cheap, often used)
```less
   h1        h2
    \       /
     s1---s2
      |   |
     s3---s4
    /       \
   h3        h4
```

> **PURE Tree or Mesh topology are rarely exists anymore, mostly hybrid.**

### Other common topologies

1. Star Topology
    - All hosts connect to a central switch/hub.
    - Simple, common in small LANs, Wi-Fi home networks.
    - Failure of central node = whole network down.

2. Bus Topology
    - Legacy Ethernet (10Base2, coaxial cable).
    - One backbone cable, all hosts share it.
    - Cheap but single point of failure, collisions. → obsolete.

3. Ring Topology
    - Nodes form a closed loop, each node connected to exactly two others.
    - Seen in SONET/SDH WANs, token ring LANs (legacy).
    - Good for predictable traffic, but break in one link = loop broken (unless dual-ring).

4. Hybrid Topology
    - Combination of tree, star, mesh, ring, etc.
    - Almost all modern networks fall here (for balance between cost, reliability, scalability).

5. Clos / Fat-Tree Topology
    - Data centers: variation of tree, but multi-rooted with equal-cost multipath.
    - Provides scalability and redundancy (tree + mesh hybrid).

6. Spine–Leaf Topology
    - Two-layer network: leaf switches connect to servers, spine switches connect only to leafs.
    - Every leaf connects to every spine (no leaf-to-leaf or spine-to-spine links).
    - Seen in modern data centers and cloud networks.
    - Guarantees predictable 2-hop latency and provides high scalability + redundancy.