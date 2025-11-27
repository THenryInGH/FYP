## Differences between HostToHostIntent vs FlowObjectiveIntent/FlowIntent
| Feature                  | **HostToHostIntent**                                                         | **FlowObjective / FlowIntent**                                                                       |
| ------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Purpose**              | Connects two hosts (endpoints) across the network. Higher-level abstraction. | Lower-level, per-switch flow rules abstraction; allows more detailed control over matches & actions. |
| **Scope**                | Path computed by ONOS automatically; spans multiple switches                 | Targeted flow rules per device; more granular per-switch control                                     |
| **Selector / Treatment** | Yes, you can match IP, TCP/UDP, ports, etc.; treatment is optional           | Yes, full match/action control (like OpenFlow). Can include `set_queue`, `meter`, `output`, etc.     |
| **Priority handling**    | Yes, at the intent level                                                     | Yes, at the flow rule level (more fine-grained)                                                      |
| **Abstraction level**    | High — suitable for host-to-host connectivity or intent-based apps           | Low — closer to the actual OpenFlow rules; more flexible, closer to SDN hardware features            |
| **Use case**             | “I want host A ↔ host B to communicate”                                      | “I want this flow with selector X and treatment Y installed on these switches”                       |
