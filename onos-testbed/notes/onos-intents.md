# ONOS Intent Framework
[reference](https://wiki.onosproject.org/display/ONOS13/Intent+Framework#IntentFramework-Intents)                  
## Benefits compared to manual flows add
1. Adapt to topology changes (future growth, modification, link failure)
2. Complexity abstraction (Hide complex configurations by using intents)
3. Conflict Resolution

**No built-in global optimization for intent framework therefore, may end up with overlapping paths, uneven link load, suboptimal global resource usage with many intents**


That's why [**IMR** ](/onos-testbed/notes/imr.md) comes in.

