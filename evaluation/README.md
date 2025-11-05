# LLM Performance Evaluation
| Metric                          | Description                      | Method                     | Example result |
| ------------------------------- | -------------------------------- | -------------------------- | -------------- |
| JSON Validity (%)               | Well-formed and accepted by ONOS | HTTP status + schema check | 97%            |
| Intent Installation (%)         | ONOS state = INSTALLED           | `/intents` query           | 93%            |
| Intent Fulfillment Accuracy (%) | Matches gold config or meets SLA | field match + iperf test   | 88%            |
| User Satisfaction (1–5)         | Human subjective rating          | survey                     | 4.2 / 5        |
