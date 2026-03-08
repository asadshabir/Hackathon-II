# skills/DaprSecretsSkill
## Purpose
Load secrets securely (API keys, DO tokens, Kafka creds) from Kubernetes secrets / DigitalOcean Secrets.

## Key Features
- get_secret(secret_name: str, key: str) → str
- Supports secret stores (Kubernetes, HashiCorp Vault, etc.)

## Reusability Bonus
Prevents hard-coded creds; used in deployment blueprints.

## Implementation Notes
Dapr secrets API + Kubernetes secret store component.