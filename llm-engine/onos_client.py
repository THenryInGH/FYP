# functions for ONOS API
import requests

ONOS_API_URL = "http://10.100.10.122:8181/onos/v1/"

def get_network_info():
    return {
        "devices": get_network_devices(),
        "links": get_network_links(),
        "hosts": get_network_hosts(),
        "intents": get_network_intents(),
        "flows": get_network_flows()
        }


def get_network_devices():
    response = requests.get(ONOS_API_URL + "devices", auth=('onos', 'rocks'))
    return response.json()

def get_network_links():
    response = requests.get(ONOS_API_URL + "links", auth=('onos', 'rocks'))
    return response.json()

def get_network_hosts():
    response = requests.get(ONOS_API_URL + "hosts", auth=('onos', 'rocks'))
    return response.json()

def get_network_intents():
    response = requests.get(ONOS_API_URL + "intents", auth=('onos', 'rocks'))
    return response.json()

def get_network_flows():
    response = requests.get(ONOS_API_URL + "flows", auth=('onos', 'rocks'))
    return response.json()

if __name__ == "__main__":
    print(get_network_info())
