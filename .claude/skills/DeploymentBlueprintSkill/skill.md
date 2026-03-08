# DeploymentBlueprintSkill

## Purpose
Generate deployment artifacts for three target platforms: Docker Compose (local full stack), Minikube (local Kubernetes with Dapr and Kafka), and Vercel (frontend hosting). This skill enables the local production-ready containerization mandate by creating platform-specific deployment configurations from a unified specification.

## Key Features
- **Multi-Target Generation**: Creates artifacts for Docker Compose, Minikube, and Vercel from single input
- **Dapr Integration**: Generates Dapr component configurations for each platform
- **Platform-Specific Optimization**: Adapts configurations for each target's constraints and capabilities
- **Consistent Topology**: Ensures identical service behavior across all platforms
- **Observability Ready**: Includes monitoring stack configurations for local environments

## API Contract
```python
def generate_deployment_artifacts(
    target_platform: str,  # "compose" | "minikube" | "vercel"
    service_spec: dict,    # Service definitions and dependencies
    environment: str,      # "development" | "staging" | "production"
    output_dir: str        # Target directory for artifacts
) -> Dict[str, str]:
    """
    Generate platform-specific deployment artifacts

    Returns: Dictionary mapping file paths to content
    """
```

## Implementation Notes
- Validates service specifications against platform constraints
- Generates appropriate resource limits and health checks for each platform
- Creates Dapr component configurations tailored to each environment
- Ensures consistent environment variable mappings across platforms
- Includes platform-specific networking and service discovery configurations

## Examples

### Docker Compose Generation
```python
artifacts = deployment_blueprint_skill.generate_deployment_artifacts(
    target_platform="compose",
    service_spec={
        "backend": {"image": "todo-backend", "port": 8000},
        "frontend": {"image": "todo-frontend", "port": 3000},
        "kafka": {"image": "confluentinc/cp-kafka", "port": 9092}
    },
    environment="development",
    output_dir="./deploy/docker-compose/"
)
# Creates: docker-compose.yml with all services, networks, volumes
```

### Minikube Generation
```python
artifacts = deployment_blueprint_skill.generate_deployment_artifacts(
    target_platform="minikube",
    service_spec={
        "backend": {"image": "todo-backend", "replicas": 2},
        "frontend": {"image": "todo-frontend", "replicas": 2}
    },
    environment="production",
    output_dir="./deploy/minikube/app-manifests/"
)
# Creates: K8s Deployments, Services, and Dapr annotations
```

### Vercel Generation
```python
artifacts = deployment_blueprint_skill.generate_deployment_artifacts(
    target_platform="vercel",
    service_spec={"frontend": {"build_command": "npm run build"}},
    environment="production",
    output_dir="./deploy/vercel/frontend-config/"
)
# Creates: vercel.json and build configurations
```

## Platform-Specific Considerations

### Docker Compose
- All services in single composition
- Direct networking between services
- Health checks for service readiness
- Volume mounts for persistent data
- Resource limits for local development

### Minikube
- Kubernetes-native deployments
- Dapr sidecar injection via annotations
- Service mesh configuration
- Horizontal Pod Autoscaler definitions
- Namespace isolation

### Vercel
- Static site generation configurations
- Environment variable mappings
- Build optimization settings
- CDN distribution configurations
- Domain and SSL setup

## Validation Requirements
- Generated artifacts must pass platform-specific validation (docker-compose config, kubectl apply dry-run, vercel build)
- Service dependencies must be properly ordered in all platforms
- Environment variables must map consistently across platforms
- Security contexts must be appropriate for each platform
- Resource constraints must be reasonable for target platform