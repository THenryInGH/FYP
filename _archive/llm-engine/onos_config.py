import requests

config_history = []  # simple list to store configuration history

ONOS_API_URL = "http://localhost:8181/onos/v1/intents"
ONOS_AUTH = ('onos', 'rocks')

def push_configuration(config_json):
    response = requests.post(ONOS_API_URL, json=config_json, auth=ONOS_AUTH)
    if response.status_code == 201:
        config_history.append(config_json)
        return response.json()
    else:
        raise Exception(f"Failed to push configuration: {response.status_code}, {response.text}")
    
def get_configuration_history():
    return config_history

def recall_configuration(index):
    if 0 <= index < len(config_history):
        return config_history[index]
    else:
        raise IndexError("Configuration index out of range")
    
def recall_last_configuration():
    if config_history:
        response = requests.post(ONOS_API_URL, json=config_history[-1], auth=ONOS_AUTH)
    else:
        return None