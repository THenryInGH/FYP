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
```less
          s1 (root)
         /   \
       s2     s3
      /  \   /  \
    h1   h2 h3  h4
```

Or a mesh:
```less
   h1    h2
    \    /
     s1---s2
      |   |
     s3---s4
    /       \
   h3        h4
```
