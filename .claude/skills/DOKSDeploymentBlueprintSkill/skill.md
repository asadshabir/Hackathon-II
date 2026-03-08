# skills/DOKSDeploymentBlueprintSkill
## Purpose
Generate / validate Helm values.yaml, Kubernetes manifests, and deployment instructions for DOKS.

## Key Features
- generate_helm_values(env: str = "prod") → dict
- validate_manifests(files: list[str]) → bool + issues
- Includes HPA, Ingress, secrets refs, Dapr annotations

## Reusability Bonus
Core for **Blueprints** bonus — reusable across projects.
Produces markdown + YAML artifacts for demo video.

## Implementation Notes
Uses Jinja2 templating or pure dict manipulation.
Follows DigitalOcean DOKS + Helm best practices (replicas >1, namespaces, etc.).