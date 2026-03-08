# Deployment Guide: AI Todo Chatbot - Phase V

## Overview

This guide covers the deployment of the AI Todo Chatbot with advanced features using the local production-ready containerization architecture. The system supports three deployment targets:

1. **Docker Compose**: Full-stack local deployment
2. **Minikube**: Kubernetes testing environment
3. **Vercel**: Frontend-only global hosting

## Prerequisites

### For All Deployments
- Git
- Docker & Docker Compose
- Node.js 18+ and npm
- Python 3.11+

### For Minikube Deployment
- Minikube
- kubectl
- Dapr CLI
- Helm

### For Vercel Deployment
- Vercel account
- GitHub account (for deployment integration)

## Deployment Targets

### 1. Docker Compose Deployment (Recommended)

#### Quick Start
```bash
# Clone the repository
git clone https://github.com/asadshabir/ai-todo-chatbot.git
cd ai-todo-chatbot

# Create environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit environment variables
# - Set your OpenAI API key (and optional Hugging Face key)
# - Configure database connection

# Start all services
docker-compose up -d

# Verify deployment
docker-compose ps

# Check service logs
docker-compose logs backend
docker-compose logs frontend
```

#### Access Services
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Swagger UI**: http://localhost:8000/docs
- **Jaeger (Tracing)**: http://localhost:16686
- **Prometheus (Metrics)**: http://localhost:9000
- **Grafana (Dashboards)**: http://localhost:3001 (admin/admin)

#### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean start)
docker-compose down -v
```

### 2. Minikube Deployment

#### Setup
```bash
# Start Minikube cluster
minikube start --memory=8192 --cpus=4

# Verify cluster
kubectl cluster-info

# Enable ingress addon
minikube addons enable ingress
```

#### Install Dapr
```bash
# Install Dapr CLI (if not already installed)
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Initialize Dapr on Minikube
dapr init -k

# Verify Dapr installation
kubectl get pods -n dapr-system
```

#### Deploy Kafka via Strimzi
```bash
# Apply Strimzi operator
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka

# Create namespace for Kafka
kubectl create namespace kafka

# Apply operator to kafka namespace
kubectl create -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka

# Deploy Kafka cluster
kubectl apply -f deploy/kafka/kafka-cluster.yaml

# Verify Kafka cluster
kubectl get pods -n kafka
kubectl wait kafka/my-cluster --for=condition=Ready --timeout=300s -n kafka
```

#### Deploy Application
```bash
# Create application namespace
kubectl create namespace todo-app

# Deploy application with Dapr annotations
kubectl apply -f deploy/minikube/ -n todo-app

# Verify deployments
kubectl get pods,svc,deployments -n todo-app

# Check service status
kubectl get pods -n todo-app -w
```

#### Access Services
```bash
# Port forward to access services locally
kubectl port-forward svc/frontend 3000:3000 -n todo-app
kubectl port-forward svc/backend 8000:8000 -n todo-app

# Or use Minikube tunnel (in separate terminal)
minikube tunnel
```

### 3. Vercel Frontend Deployment

#### Preparation
1. Create a fork of the repository on GitHub
2. Sign up for Vercel account at https://vercel.com
3. Prepare your backend deployment (Docker Compose, Minikube, or cloud-hosted)

#### Deployment Steps
1. Go to Vercel Dashboard
2. Click "New Project" → "Import Git Repository"
3. Select your forked repository
4. Configure deployment:
   ```
   Framework: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   ```

5. Set environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.com
   NEXT_PUBLIC_DAPR_HTTP_PORT=3500
   NEXT_PUBLIC_WEBSOCKET_URL=wss://your-backend-url.com/ws
   ```

6. Deploy and note the generated URL

## Configuration Files

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/todoapp
NEON_DATABASE_URL=your_neon_connection_string

# AI Providers
OPENAI_API_KEY=your_openai_key
HF_API_KEY=your_hf_key_optional
HF_MODEL_NAME=microsoft/DialoGPT-medium
HF_API_URL=https://api-inference.huggingface.co/models/

# Authentication
JWT_SECRET=your_secure_jwt_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://your-frontend-url.vercel.app

# Dapr Configuration
DAPR_HTTP_PORT=3500
DAPR_GRPC_PORT=50001

# Kafka Configuration
KAFKA_BROKERS=localhost:9092
```

#### Frontend (.env.local for local dev, Vercel env for production)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_DAPR_HTTP_PORT=3500
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws
```

## Health Checks

### Docker Compose
```bash
# Check service status
docker-compose ps

# Check logs for issues
docker-compose logs --tail=50 backend
docker-compose logs --tail=50 frontend

# Health check individual services
curl http://localhost:8000/health
curl http://localhost:3000/api/health
```

### Minikube
```bash
# Check pod status
kubectl get pods -n todo-app

# Check service endpoints
kubectl get endpoints -n todo-app

# View logs
kubectl logs deployment/backend -n todo-app
kubectl logs deployment/frontend -n todo-app

# Port forward for health check
kubectl port-forward svc/backend 8000:8000 -n todo-app
curl http://localhost:8000/health
```

## Troubleshooting

### Common Issues

#### 1. Dapr Sidecar Not Starting
- Check Dapr placement service is running
- Verify Dapr components are properly configured
- Ensure ports 3500, 50001, and 50005 are available

#### 2. Kafka Connection Issues
- Verify Kafka broker is running and accessible
- Check that ZK is healthy
- Confirm KAFKA_BROKERS environment variable format

#### 3. Database Connection Problems
- Ensure PostgreSQL is running and healthy
- Check DATABASE_URL format
- Verify network connectivity between services

#### 4. AI Provider Unavailable
- Check OPENAI_API_KEY environment variable
- If using fallback, verify HF_API_KEY
- Confirm network connectivity to AI provider

### Diagnostic Commands

#### Docker Compose
```bash
# Detailed logs
docker-compose logs backend | grep -i error
docker-compose logs kafka | grep -i error

# Network inspection
docker network ls
docker inspect todo-network

# Resource usage
docker stats
```

#### Minikube
```bash
# Detailed pod status
kubectl describe pod <pod-name> -n todo-app

# Events in namespace
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Service connectivity
kubectl exec -it <pod-name> -n todo-app -- nslookup backend.todo-app.svc.cluster.local
```

## Scaling Configuration

### Horizontal Pod Autoscaling (Minikube)
```bash
# Check current HPA status
kubectl get hpa -n todo-app

# Describe HPA for details
kubectl describe hpa backend -n todo-app

# Set custom scaling rules if needed
kubectl patch hpa backend -n todo-app -p '{"spec":{"minReplicas":2,"maxReplicas":10}}'
```

### Resource Limits
```yaml
# Example deployment with resource limits
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

## Backup and Recovery

### Database Backup
```bash
# Docker Compose backup
docker exec todo-postgres pg_dump -U postgres todoapp > backup.sql

# Restore backup
docker exec -i todo-postgres psql -U postgres -d todoapp < backup.sql
```

### Configuration Backup
- Keep copies of environment files in secure location
- Version control infrastructure files (except secrets)
- Document deployment procedures and configurations

## Security Considerations

1. Never commit secrets to version control
2. Use environment variables for sensitive data
3. Implement proper CORS configuration
4. Enable authentication for all services
5. Regularly update base images and dependencies
6. Monitor logs for suspicious activity

## Monitoring and Observability

### Distributed Tracing
- Jaeger UI: http://localhost:16686 (Docker) or port-forwarded (Minikube)
- Search traces by service name (backend, frontend)
- Analyze trace latencies and error rates

### Metrics
- Prometheus: http://localhost:9090 (Docker) or port-forwarded (Minikube)
- Key metrics: request rates, error rates, latency percentiles
- Business metrics: task creation/completion rates

### Logging
- Structured JSON logs for easy parsing
- Correlation IDs for request tracing
- Centralized logging when available

## Updating and Maintenance

### Rolling Updates (Kubernetes)
```bash
# Update deployment image
kubectl set image deployment/backend backend=your-registry/backend:v2 -n todo-app

# Monitor rollout
kubectl rollout status deployment/backend -n todo-app

# Rollback if needed
kubectl rollout undo deployment/backend -n todo-app
```

### Docker Compose Updates
```bash
# Pull latest images
docker-compose pull

# Redeploy with new images
docker-compose up -d --force-recreate
```

## Conclusion

This deployment architecture provides a robust, scalable foundation for the AI Todo Chatbot with advanced features. The three-target approach allows for flexible deployment strategies from local development to production-grade systems.

For support, refer to the project documentation or reach out to the development team.