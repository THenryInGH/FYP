from mininet.topo import Topo

class HybridMeshTreeTopo(Topo):
    def build(self, num_switches=4, hosts_per_edge=2):
        # Create switches
        switches = []
        for i in range(1, num_switches + 1):
            sw = self.addSwitch(f's{i}')
            switches.append(sw)
        
        # Create hosts and attach to first and last switch
        host_id = 1
        for sw in [switches[0], switches[-1]]:
            for _ in range(hosts_per_edge):
                ip = f'10.0.0.{host_id}/24'
                host = self.addHost(f'h{host_id}', ip=ip)
                self.addLink(host, sw)
                host_id += 1

        # Add links between switches to form mesh/tree hybrid topology
        for i in range(num_switches):
            for j in range(i + 1, num_switches):
                if i != j:
                    self.addLink(switches[i], switches[j])

topos = {
    'hybrid_mesh_tree_topo': (lambda: HybridMeshTreeTopo())
}