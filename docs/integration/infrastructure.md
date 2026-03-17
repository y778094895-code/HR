# Infrastructure & Deployment

## Kubernetes
The system is orchestrated using Kubernetes. Manifests are located in `infrastructure/kubernetes`.

### Namespaces
- `smart-hr`: Main application namespace.

### Services
- `api-gateway`: LoadBalancer service exposing the application.
- `smart-hr-server`: Backend API services (Employee, Fairness, Intervention).
- `ml-service`: Python-based AI service.
- `rabbitmq`: Message broker.

## Docker
Build images:
```bash
docker build -t smart-hr/api-gateway ./infrastructure/api-gateway
docker build -t smart-hr/server ./server
docker build -t smart-hr/ml-service ./ml-service
```

## CI/CD
GitHub Actions workflow (TODO) builds images on push to `main` and deploys to staging cluster.

## Monitoring
- Prometheus scrapes metrics from `/metrics` endpoint on all services.
- Grafana dashboards visualize request rate, latency, and errors.
