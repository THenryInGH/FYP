from mininet.net import Mininet
from mininet.node import RemoteController, OVSSwitch
from mininet.topo import Topo
from mininet.cli import CLI

class ThreeSwitchTopo( Topo ):
    def build( self ):
        # Add three hosts
        h1 = self.addHost('h1', ip='10.0.0.1/24')
        h2 = self.addHost('h2', ip='10.0.0.2/24')
        h3 = self.addHost('h3', ip='10.0.0.3/24')

        # Add three Open vSwitch switches
        s1 = self.addSwitch('s1')
        s2 = self.addSwitch('s2')
        s3 = self.addSwitch('s3')

        # Connect each host to its switch
        self.addLink(h1, s1)
        self.addLink(h2, s2)
        self.addLink(h3, s3)

        # Interconnect the switches in a line
        self.addLink(s1, s2)
        self.addLink(s2, s3)

if __name__ == '__main__':
    net = Mininet(
        topo=ThreeSwitchTopo(),
        switch=OVSSwitch,
        controller=lambda name: RemoteController(name, ip='10.0.0.10', port=6653)
    )
    net.start()
    net.pingAll()
    CLI( net )
    net.stop()
