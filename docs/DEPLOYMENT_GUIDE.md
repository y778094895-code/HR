# 🚀 Smart HR System - Comprehensive Deployment Guide

## 📋 جدول المحتويات
1. [نظرة عامة على النشر](#نظرة-عامة-على-النشر)
2. [متطلبات النظام](#متطلبات-النظام)
3. [النشر المحلي (Development)](#النشر-المحلي-development)
4. [النشر على Staging](#النشر-على-staging)
5. [النشر على Production](#النشر-على-production)
6. [النشر على Kubernetes](#النشر-على-kubernetes)
7. [النشر على السحابة](#النشر-على-السحابة)
8. [الترقية والصيانة](#الترقية-والصيانة)
9. [النسخ الاحتياطي والاستعادة](#النسخ-الاحتياطي-والاستعادة)
10. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🎯 نظرة عامة على النشر

### بيئات النشر الموصى بها
| البيئة | الغرض | الموقع | المستخدمون | الأداء المطلوب |
|--------|-------|--------|-----------|---------------|
| **Development** | تطوير واختبار الميزات | محلي | المطورون فقط | منخفض |
| **Staging** | اختبار قبول المستخدم | داخلي | فريق QA | متوسط |
| **Production** | الاستخدام الفعلي | سحابي/خادم | جميع المستخدمين | عالي |

### مخطط سير العمل
```

تطوير الميزات → اختبار محلي → Staging → Production ← مراقبة وصيانة
↑                ↑         ↑          ↑               ↑
Git PR         Docker Compose  K8s Deploy  Cloud Deploy  Monitoring

```

---

## 💻 متطلبات النظام

### متطلبات العتاد
```yaml
Development:
  - RAM: 8GB minimum, 16GB recommended
  - CPU: 4 cores minimum, 8 cores recommended
  - Storage: 50GB SSD
  - OS: Linux/macOS/Windows (WSL2)

Staging:
  - RAM: 16GB
  - CPU: 8 cores
  - Storage: 100GB SSD
  - OS: Ubuntu 22.04 LTS / CentOS 8

Production (Small):
  - RAM: 32GB
  - CPU: 16 cores
  - Storage: 200GB SSD
  - OS: Ubuntu 22.04 LTS

Production (Large):
  - RAM: 64GB+ 
  - CPU: 32 cores+
  - Storage: 500GB+ SSD
  - OS: Ubuntu 22.04 LTS / RHEL 8
```

متطلبات البرمجيات

```bash
# Development Environment
- Docker: 24.0+
- Docker Compose: 2.20+
- Git: 2.40+
- Node.js: 20.x
- Python: 3.11+
- PostgreSQL Client: 16+
- Redis Client: 7+

# Production Environment
- Kubernetes: 1.28+
- Helm: 3.12+
- Nginx: 1.24+
- Certbot/LetsEncrypt
- Prometheus Stack
- Backup Tools (pg_dump, rsync)
```

---

🏠 النشر المحلي (Development)

الخطوة 1: إعداد البيئة

```bash
# 1. Clone المشروع
git clone https://github.com/your-org/smart-hr-system.git
cd smart-hr-system

# 2. إعداد متغيرات البيئة
cp .env.example .env

# 3. تحرير ملف .env (المتغيرات الأساسية)
nano .env

# المتغيرات الأساسية المطلوبة:
DB_USER=smart_hr_user
DB_PASSWORD=your_strong_password_here
JWT_SECRET=your_secure_jwt_secret_key_here
ERPNEXT_API_KEY=your_erpnext_api_key
ERPNEXT_API_SECRET=your_erpnext_api_secret
```

الخطوة 2: بناء وتشغيل الخدمات

```bash
# استخدام Makefile (الموصى به)
make setup    # إعداد أولي
make build    # بناء الصور
make start    # تشغيل الخدمات

# أو استخدام Docker Compose مباشرة
docker-compose up -d --build

# التحقق من حالة الخدمات
docker-compose ps

# عرض الـ Logs
docker-compose logs -f
```

الخطوة 3: تهيئة قاعدة البيانات

```bash
# تشغيل الـ Migrations
make migrate

# إضافة بيانات تجريبية (اختياري)
make seed

# التحقق من اتصال قاعدة البيانات
docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db -c "\dt"
```

الخطوة 4: التحقق من التثبيت

```bash
# اختبار الـ API
curl http://localhost:3000/health
# Expected: {"status":"healthy","timestamp":"..."}

# اختبار ML Service
curl http://localhost:8000/health
# Expected: {"status":"healthy","service":"smart-hr-ml-service"}

# اختبار Frontend
curl -I http://localhost:3001
# Expected: HTTP/1.1 200 OK

# اختبار Authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smart-hr.com","password":"Admin@123"}'
```

الخطوة 5: التطوير المستمر

```bash
# Hot Reload للـ Backend
cd server && npm run start:dev

# Hot Reload للـ Frontend  
cd client && npm start

# Hot Reload للـ ML Service
cd ml-service && uvicorn main:app --reload

# تشغيل الاختبارات
make test

# تشغيل Linting
make lint
```

---

🧪 النشر على Staging

إعداد خادم Staging

```bash
# 1. Connect to server
ssh ubuntu@staging.yourdomain.com

# 2. Install prerequisites
sudo apt update
sudo apt install -y docker.io docker-compose git nginx certbot python3-certbot-nginx

# 3. Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 4. Clone the repository
git clone https://github.com/your-org/smart-hr-system.git
cd smart-hr-system

# 5. Create production .env
cat > .env << EOF
# Production Environment
NODE_ENV=production

# Database
DB_USER=smart_hr_user
DB_PASSWORD=$(openssl rand -base64 32)
DB_NAME=smart_hr_db
DB_HOST=postgres
DB_PORT=5432

# Security
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=12

# ERPNext Integration
ERPNEXT_URL=https://erpnext.yourcompany.com
ERPNEXT_API_KEY=your_staging_api_key
ERPNEXT_API_SECRET=your_staging_api_secret

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# URLs
FRONTEND_URL=https://staging-hr.yourdomain.com
BACKEND_URL=https://api-staging-hr.yourdomain.com
ML_SERVICE_URL=https://ml-staging-hr.yourdomain.com
EOF
```

بناء وتشغيل على Staging

```bash
# 1. Build with production settings
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# 2. Start services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# 3. Run database migrations
docker-compose exec backend npm run migrate:up

# 4. Check services
docker-compose ps
docker-compose logs --tail=50
```

إعداد NGINX و SSL

```nginx
# /etc/nginx/sites-available/staging-hr
server {
    listen 80;
    server_name staging-hr.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name staging-hr.yourdomain.com;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/staging-hr.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/staging-hr.yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # ML Service
    location /ml-api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
    
    # Health checks
    location /health {
        proxy_pass http://localhost:3000/health;
        access_log off;
    }
}
```

الحصول على شهادات SSL

```bash
# Get SSL certificates
sudo certbot --nginx -d staging-hr.yourdomain.com

# Test SSL configuration
sudo nginx -t
sudo systemctl reload nginx

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

🏭 النشر على Production

إعداد خادم Production

```bash
#!/bin/bash
# production-setup.sh

set -e  # Exit on error

echo "🚀 Starting Production Setup..."

# 1. System Updates
apt-get update && apt-get upgrade -y

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker $USER

# 3. Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. Install NGINX
apt-get install -y nginx certbot python3-certbot-nginx

# 5. Create application directory
mkdir -p /opt/smart-hr/{data,logs,backups,ssl}
chown -R $USER:$USER /opt/smart-hr

# 6. Clone repository
cd /opt/smart-hr
git clone https://github.com/your-org/smart-hr-system.git app
cd app

# 7. Generate secure passwords
generate_password() {
    openssl rand -base64 32 | tr -d '/+=\n'
}

# 8. Create production .env
cat > .env << EOF
# ========================
# PRODUCTION ENVIRONMENT
# ========================

# Application
NODE_ENV=production
APP_NAME=Smart HR System
APP_VERSION=1.0.0
APP_URL=https://hr.yourcompany.com
API_URL=https://api-hr.yourcompany.com

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=smart_hr_user
DB_PASSWORD=$(generate_password)
DB_NAME=smart_hr_db
DB_POOL_MAX=50
DB_POOL_MIN=10
DB_SSL=true

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=$(generate_password)
REDIS_TTL=300

# Security
JWT_SECRET=$(generate_password)
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=$(generate_password)
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# ERPNext Integration
ERPNEXT_URL=https://erpnext.yourcompany.com
ERPNEXT_API_KEY=your_production_api_key
ERPNEXT_API_SECRET=your_production_api_secret
ERPNEXT_COMPANY_NAME=Your Company Ltd
ERPNEXT_SYNC_INTERVAL=3600

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@yourcompany.com
SMTP_PASSWORD=your_email_password
SMTP_FROM=noreply@yourcompany.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/opt/smart-hr/data/uploads

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3002
LOKI_PORT=3100

# Performance
API_RATE_LIMIT=100
API_RATE_WINDOW=15
CACHE_TTL=300
EOF

# 9. Set proper permissions
chmod 600 .env
chown $USER:$USER .env

echo "✅ Production setup completed!"
```

إعداد Docker Compose للإنتاج

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: smart_hr_postgres_prod
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C --data-checksums"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./postgres/production/backup:/backups
      - ./postgres/production/scripts:/docker-entrypoint-initdb.d
    networks:
      - smart_hr_network_prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s
    command: >
      postgres 
      -c max_connections=200
      -c shared_buffers=2GB
      -c effective_cache_size=6GB
      -c maintenance_work_mem=512MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
      -c random_page_cost=1.1
      -c effective_io_concurrency=200
      -c work_mem=10485kB
      -c min_wal_size=1GB
      -c max_wal_size=4GB

  backend:
    build:
      context: ./server
      dockerfile: ../infrastructure/docker/Dockerfile.backend.prod
      args:
        NODE_ENV: production
    image: smart-hr-backend:production
    container_name: smart_hr_backend_prod
    restart: always
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: ${JWT_EXPIRES_IN}
      APP_URL: ${APP_URL}
      API_URL: ${API_URL}
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./logs/backend:/app/logs
      - ./uploads:/app/uploads
    networks:
      - smart_hr_network_prod
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # Similar configurations for other services...

networks:
  smart_hr_network_prod:
    driver: bridge
    ipam:
      config:
        - subnet: 172.30.0.0/16

volumes:
  postgres_data_prod:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/smart-hr/data/postgres
  redis_data_prod:
    driver: local
  ml_models_prod:
    driver: local
```

إعداد نسخ احتياطي تلقائي

```bash
#!/bin/bash
# /opt/smart-hr/scripts/backup.sh

BACKUP_DIR="/opt/smart-hr/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "Starting backup on $(date)"

# 1. Backup PostgreSQL
echo "Backing up PostgreSQL..."
docker-compose -f /opt/smart-hr/app/docker-compose.yml \
               -f /opt/smart-hr/app/docker-compose.prod.yml \
               exec -T postgres pg_dump -U smart_hr_user smart_hr_db \
               > "$BACKUP_DIR/db_backup_$DATE.sql"

# 2. Backup ML models
echo "Backing up ML models..."
tar -czf "$BACKUP_DIR/models_backup_$DATE.tar.gz" \
    -C /var/lib/docker/volumes/smart_hr_ml_models_prod/_data .

# 3. Backup configuration
echo "Backing up configuration..."
cp /opt/smart-hr/app/.env "$BACKUP_DIR/env_backup_$DATE"
cp /opt/smart-hr/app/docker-compose.yml "$BACKUP_DIR/compose_backup_$DATE.yml"
cp /opt/smart-hr/app/docker-compose.prod.yml "$BACKUP_DIR/compose_prod_backup_$DATE.yml"

# 4. Compress backups
echo "Compressing backups..."
gzip "$BACKUP_DIR/db_backup_$DATE.sql"

# 5. Clean old backups
echo "Cleaning old backups..."
find "$BACKUP_DIR" -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*_backup_*" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully!"
```

إعداد Monitoring للإنتاج

```yaml
# infrastructure/monitoring/docker-compose.monitoring.yml
version: '3.9'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: always
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    ports:
      - "9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: always
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_ADMIN_PASSWORD}
      GF_INSTALL_PLUGINS: grafana-piechart-panel,grafana-worldmap-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    ports:
      - "3002:3000"
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    restart: always
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    ports:
      - "9093:9093"
    networks:
      - monitoring

  loki:
    image: grafana/loki:latest
    container_name: loki
    restart: always
    volumes:
      - loki_data:/loki
      - ./loki/loki-config.yml:/etc/loki/local-config.yaml
    ports:
      - "3100:3100"
    networks:
      - monitoring

  promtail:
    image: grafana/promtail:latest
    container_name: promtail
    restart: always
    volumes:
      - /var/log:/var/log
      - ./promtail/promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
  loki_data:
```

---

☸️ النشر على Kubernetes

إعداد Kubernetes Cluster

```bash
# Using Minikube for local development
minikube start --cpus=4 --memory=8192 --disk-size=50g

# Using k3d for local development
k3d cluster create smart-hr-cluster \
  --api-port 6550 \
  --port "80:80@loadbalancer" \
  --port "443:443@loadbalancer" \
  --servers 1 \
  --agents 3

# Using managed Kubernetes (AWS EKS)
eksctl create cluster \
  --name smart-hr-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.large \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 5 \
  --managed
```

Helm Charts للنشر

```yaml
# Chart.yaml
apiVersion: v2
name: smart-hr-system
description: A Helm chart for Smart HR System
type: application
version: 1.0.0
appVersion: "1.0.0"

# values.yaml
global:
  environment: production
  domain: hr.yourcompany.com
  
  # Database
  postgresql:
    enabled: true
    auth:
      username: smart_hr_user
      password: ""
      database: smart_hr_db
    persistence:
      enabled: true
      size: 100Gi
    resources:
      requests:
        memory: 2Gi
        cpu: 1000m
      limits:
        memory: 4Gi
        cpu: 2000m

  # Redis
  redis:
    enabled: true
    auth:
      password: ""
    architecture: standalone
    master:
      persistence:
        enabled: true
        size: 20Gi

backend:
  replicaCount: 3
  image:
    repository: your-registry/smart-hr-backend
    tag: latest
    pullPolicy: Always
  service:
    type: ClusterIP
    port: 3000
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: api-hr.yourcompany.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: smart-hr-tls
        hosts:
          - api-hr.yourcompany.com
  resources:
    requests:
      memory: 512Mi
      cpu: 500m
    limits:
      memory: 1Gi
      cpu: 1000m
  autoscaling:
    enabled: true
    minReplicas: 2
    maxReplicas: 10
    targetCPUUtilizationPercentage: 80
    targetMemoryUtilizationPercentage: 80

frontend:
  replicaCount: 2
  image:
    repository: your-registry/smart-hr-frontend
    tag: latest
    pullPolicy: Always
  service:
    type: ClusterIP
    port: 3000
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: hr.yourcompany.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: smart-hr-tls
        hosts:
          - hr.yourcompany.com
  resources:
    requests:
      memory: 256Mi
      cpu: 250m
    limits:
      memory: 512Mi
      cpu: 500m

mlService:
  replicaCount: 2
  image:
    repository: your-registry/smart-hr-ml-service
    tag: latest
    pullPolicy: Always
  service:
    type: ClusterIP
    port: 8000
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: ml-hr.yourcompany.com
        paths:
          - path: /
            pathType: Prefix
  resources:
    requests:
      memory: 1Gi
      cpu: 1000m
    limits:
      memory: 2Gi
      cpu: 2000m
```

نشر التطبيق على Kubernetes

```bash
# 1. Create namespace
kubectl create namespace smart-hr

# 2. Create secrets
kubectl create secret generic smart-hr-secrets \
  --namespace smart-hr \
  --from-literal=db-password='your-db-password' \
  --from-literal=jwt-secret='your-jwt-secret' \
  --from-literal=redis-password='your-redis-password'

# 3. Deploy with Helm
helm install smart-hr-system ./charts/smart-hr-system \
  --namespace smart-hr \
  --values ./charts/smart-hr-system/values-production.yaml

# 4. Check deployment status
kubectl get all -n smart-hr

# 5. View logs
kubectl logs -n smart-hr deployment/smart-hr-backend -f

# 6. Port forwarding for local access
kubectl port-forward -n smart-hr service/smart-hr-frontend 3001:3000
```

إعداد Ingress Controller

```yaml
# infrastructure/kubernetes/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: smart-hr-ingress
  namespace: smart-hr
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "20m"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "60"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "60"
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "Content-Type, Authorization, X-Requested-With"
spec:
  tls:
    - hosts:
        - hr.yourcompany.com
        - api-hr.yourcompany.com
        - ml-hr.yourcompany.com
      secretName: smart-hr-tls
  rules:
    - host: hr.yourcompany.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: smart-hr-frontend
                port:
                  number: 3000
    - host: api-hr.yourcompany.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: smart-hr-backend
                port:
                  number: 3000
    - host: ml-hr.yourcompany.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: smart-hr-ml-service
                port:
                  number: 8000
```

---

☁️ النشر على السحابة

النشر على AWS

```bash
#!/bin/bash
# deploy-aws.sh

# 1. Configure AWS CLI
aws configure

# 2. Create ECR repositories
aws ecr create-repository --repository-name smart-hr-backend
aws ecr create-repository --repository-name smart-hr-frontend
aws ecr create-repository --repository-name smart-hr-ml-service

# 3. Build and push images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker build -t smart-hr-backend:latest ./server
docker tag smart-hr-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/smart-hr-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/smart-hr-backend:latest

# 4. Deploy using ECS
aws ecs create-cluster --cluster-name smart-hr-cluster
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json
aws ecs create-service --cluster smart-hr-cluster --service-name smart-hr-service --task-definition smart-hr-task --desired-count 3

# 5. Set up ALB
aws elbv2 create-load-balancer --name smart-hr-alb --subnets subnet-xxx subnet-yyy --security-groups sg-xxx
aws elbv2 create-target-group --name smart-hr-tg --protocol HTTP --port 80 --vpc-id vpc-xxx
aws elbv2 create-listener --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:xxx:loadbalancer/app/smart-hr-alb/xxx --protocol HTTPS --port 443 --ssl-policy ELBSecurityPolicy-2016-08 --certificates CertificateArn=arn:aws:acm:us-east-1:xxx:certificate/xxx --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/smart-hr-tg/xxx
```

النشر على Google Cloud

```bash
#!/bin/bash
# deploy-gcp.sh

# 1. Set up Google Cloud SDK
gcloud init
gcloud config set project YOUR_PROJECT_ID

# 2. Create GKE cluster
gcloud container clusters create smart-hr-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-standard-4 \
  --disk-size 100 \
  --enable-autoscaling \
  --min-nodes 1 \
  --max-nodes 10

# 3. Configure kubectl
gcloud container clusters get-credentials smart-hr-cluster --zone us-central1-a

# 4. Build and push to GCR
gcloud auth configure-docker
docker build -t gcr.io/YOUR_PROJECT_ID/smart-hr-backend:latest ./server
docker push gcr.io/YOUR_PROJECT_ID/smart-hr-backend:latest

# 5. Deploy to GKE
kubectl apply -f kubernetes/

# 6. Set up Cloud SQL
gcloud sql instances create smart-hr-db \
  --database-version POSTGRES_16 \
  --tier db-custom-4-15360 \
  --region us-central1 \
  --storage-size 100GB \
  --storage-type SSD

gcloud sql databases create smart_hr_db --instance=smart-hr-db
gcloud sql users create smart_hr_user --instance=smart-hr-db --password=YOUR_PASSWORD

# 7. Set up Memorystore (Redis)
gcloud redis instances create smart-hr-redis \
  --size=5 \
  --region=us-central1 \
  --redis-version=redis_7_0 \
  --tier=standard
```

النشر على Azure

```bash
#!/bin/bash
# deploy-azure.sh

# 1. Login to Azure
az login

# 2. Create resource group
az group create --name smart-hr-rg --location eastus

# 3. Create AKS cluster
az aks create \
  --resource-group smart-hr-rg \
  --name smart-hr-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# 4. Get credentials
az aks get-credentials --resource-group smart-hr-rg --name smart-hr-aks

# 5. Create Azure Container Registry
az acr create --resource-group smart-hr-rg \
  --name smarthracr \
  --sku Basic \
  --admin-enabled true

# 6. Build and push images
az acr build --registry smarthracr --image smart-hr-backend:latest ./server
az acr build --registry smarthracr --image smart-hr-frontend:latest ./client
az acr build --registry smarthracr --image smart-hr-ml-service:latest ./ml-service

# 7. Create Azure Database for PostgreSQL
az postgres server create \
  --resource-group smart-hr-rg \
  --name smart-hr-postgres \
  --location eastus \
  --admin-user smart_hr_user \
  --admin-password YOUR_PASSWORD \
  --sku-name GP_Gen5_4 \
  --version 16 \
  --storage-size 102400

# 8. Configure firewall rules
az postgres server firewall-rule create \
  --resource-group smart-hr-rg \
  --server smart-hr-postgres \
  --name AllowAllAzureIPs \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

---

🔄 الترقية والصيانة

استراتيجية الترقية

```bash
# Blue-Green Deployment
#!/bin/bash
# blue-green-deploy.sh

CURRENT_COLOR=$(kubectl get svc smart-hr-frontend -o=jsonpath='{.spec.selector.color}')
if [ "$CURRENT_COLOR" = "blue" ]; then
    NEW_COLOR="green"
else
    NEW_COLOR="blue"
fi

echo "Deploying to $NEW_COLOR environment..."

# 1. Deploy new version
kubectl set image deployment/smart-hr-frontend-$NEW_COLOR \
  smart-hr-frontend=your-registry/smart-hr-frontend:NEW_VERSION

# 2. Wait for deployment to be ready
kubectl rollout status deployment/smart-hr-frontend-$NEW_COLOR --timeout=300s

# 3. Switch traffic
kubectl patch service smart-hr-frontend \
  -p "{\"spec\":{\"selector\":{\"color\":\"$NEW_COLOR\"}}}"

# 4. Keep old deployment for rollback
echo "Previous ($CURRENT_COLOR) deployment kept for rollback"
```

الصيانة الدورية

```bash
#!/bin/bash
# maintenance-tasks.sh

# Daily tasks
echo "Running daily maintenance tasks..."

# 1. Clean up old logs
find /var/log/smart-hr -name "*.log" -mtime +7 -delete

# 2. Optimize database
docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db -c "VACUUM ANALYZE;"

# 3. Clear old cache
docker-compose exec redis redis-cli --pass $REDIS_PASSWORD FLUSHDB

# 4. Check disk space
df -h /opt/smart-hr

# Weekly tasks (run every Sunday)
if [ $(date +%u) -eq 7 ]; then
    echo "Running weekly maintenance tasks..."
    
    # 1. Reindex database
    docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db -c "REINDEX DATABASE smart_hr_db;"
    
    # 2. Update statistics
    docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db -c "ANALYZE;"
    
    # 3. Clean up old backups
    find /opt/smart-hr/backups -name "*.gz" -mtime +30 -delete
fi

# Monthly tasks (run first day of month)
if [ $(date +%d) -eq 1 ]; then
    echo "Running monthly maintenance tasks..."
    
    # 1. Archive old data
    docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db -c "
        INSERT INTO attendance_archive 
        SELECT * FROM attendance_snapshots 
        WHERE attendance_date < NOW() - INTERVAL '6 months';
        
        DELETE FROM attendance_snapshots 
        WHERE attendance_date < NOW() - INTERVAL '6 months';
    "
    
    # 2. Update ML models
    docker-compose exec ml-service python /app/scripts/retrain_models.py
    
    # 3. Security audit
    docker-compose exec backend npm run security-audit
fi
```

مراقبة الأداء

```bash
#!/bin/bash
# performance-monitoring.sh

# Check system resources
echo "=== System Resources ==="
free -h
top -bn1 | head -20

# Check Docker resources
echo -e "\n=== Docker Resources ==="
docker stats --no-stream

# Check database performance
echo -e "\n=== Database Performance ==="
docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db -c "
    SELECT 
        schemaname,
        relname,
        seq_scan,
        seq_tup_read,
        idx_scan,
        idx_tup_fetch,
        n_tup_ins,
        n_tup_upd,
        n_tup_del,
        n_live_tup,
        n_dead_tup
    FROM pg_stat_user_tables 
    ORDER BY n_dead_tup DESC 
    LIMIT 10;
"

# Check API response times
echo -e "\n=== API Response Times ==="
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s http://localhost:3000/health

# Check service health
echo -e "\n=== Service Health ==="
docker-compose ps

# Check logs for errors
echo -e "\n=== Recent Errors ==="
docker-compose logs --tail=100 | grep -i error | tail -20
```

---

💾 النسخ الاحتياطي والاستعادة

استراتيجية النسخ الاحتياطي

```yaml
# backup-strategy.yaml
backup:
  frequency:
    database: hourly
    files: daily
    configuration: weekly
    full_system: monthly
  
  retention:
    hourly: 24 hours
    daily: 30 days
    weekly: 12 weeks
    monthly: 12 months
  
  storage:
    local: /opt/smart-hr/backups
    cloud: AWS S3 / Google Cloud Storage
    encrypted: true
  
  verification:
    automated: daily
    manual: monthly
    test_restore: quarterly
```

سكربت النسخ الاحتياطي الكامل

```bash
#!/bin/bash
# full-backup.sh

set -e

BACKUP_DIR="/opt/smart-hr/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="smart_hr_full_backup_$DATE"
TEMP_DIR="/tmp/$BACKUP_NAME"

# Create temporary directory
mkdir -p $TEMP_DIR

echo "Starting full backup of Smart HR System..."

# 1. Backup database
echo "Backing up database..."
docker-compose exec -T postgres pg_dump -U smart_hr_user -F c -b -v smart_hr_db > $TEMP_DIR/database.dump

# 2. Backup ML models
echo "Backing up ML models..."
tar -czf $TEMP_DIR/ml_models.tar.gz -C /var/lib/docker/volumes/smart_hr_ml_models_prod/_data .

# 3. Backup configuration
echo "Backing up configuration..."
cp /opt/smart-hr/app/.env $TEMP_DIR/
cp /opt/smart-hr/app/docker-compose*.yml $TEMP_DIR/
cp -r /opt/smart-hr/app/infrastructure $TEMP_DIR/

# 4. Backup logs (optional)
echo "Backing up logs..."
tar -czf $TEMP_DIR/logs.tar.gz -C /opt/smart-hr/logs .

# 5. Backup uploads
echo "Backing up uploads..."
tar -czf $TEMP_DIR/uploads.tar.gz -C /opt/smart-hr/data/uploads .

# 6. Create metadata file
cat > $TEMP_DIR/backup_metadata.json << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -Iseconds)",
  "system_version": "$(cat /opt/smart-hr/app/package.json | jq -r .version)",
  "database_size": "$(du -sh $TEMP_DIR/database.dump | cut -f1)",
  "total_size": "$(du -sh $TEMP_DIR | cut -f1)",
  "services": [
    {
      "name": "postgres",
      "version": "$(docker-compose exec postgres psql --version)"
    },
    {
      "name": "backend",
      "version": "$(cat /opt/smart-hr/app/server/package.json | jq -r .version)"
    },
    {
      "name": "ml-service",
      "version": "$(cat /opt/smart-hr/app/ml-service/requirements.txt | grep fastapi | cut -d= -f3)"
    }
  ]
}
EOF

# 7. Create archive
echo "Creating archive..."
tar -czf $BACKUP_DIR/$BACKUP_NAME.tar.gz -C /tmp $BACKUP_NAME

# 8. Encrypt backup (optional)
if [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
    echo "Encrypting backup..."
    openssl enc -aes-256-cbc -salt -in $BACKUP_DIR/$BACKUP_NAME.tar.gz \
        -out $BACKUP_DIR/$BACKUP_NAME.tar.gz.enc -pass pass:$BACKUP_ENCRYPTION_KEY
    rm $BACKUP_DIR/$BACKUP_NAME.tar.gz
fi

# 9. Upload to cloud (AWS S3 example)
if [ -n "$AWS_ACCESS_KEY_ID" ]; then
    echo "Uploading to S3..."
    aws s3 cp $BACKUP_DIR/$BACKUP_NAME.tar.gz* s3://your-backup-bucket/smart-hr/
fi

# 10. Clean up
echo "Cleaning up..."
rm -rf $TEMP_DIR

# 11. Remove old backups
echo "Removing old backups..."
find $BACKUP_DIR -name "smart_hr_full_backup_*" -mtime +30 -delete

echo "Backup completed successfully: $BACKUP_DIR/$BACKUP_NAME.tar.gz*"
```

سكربت الاستعادة

```bash
#!/bin/bash
# restore-backup.sh

set -e

BACKUP_FILE=$1
RESTORE_DIR="/tmp/restore_$(date +%Y%m%d_%H%M%S)"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Starting restore from: $BACKUP_FILE"

# Stop services
echo "Stopping services..."
docker-compose down

# Create restore directory
mkdir -p $RESTORE_DIR

# Decrypt if needed
if [[ "$BACKUP_FILE" == *.enc ]]; then
    echo "Decrypting backup..."
    DECRYPTED_FILE="${BACKUP_FILE%.enc}"
    openssl enc -aes-256-cbc -d -in $BACKUP_FILE \
        -out $DECRYPTED_FILE -pass pass:$BACKUP_ENCRYPTION_KEY
    BACKUP_FILE=$DECRYPTED_FILE
fi

# Extract backup
echo "Extracting backup..."
tar -xzf $BACKUP_FILE -C $RESTORE_DIR

# Read metadata
METADATA=$(cat $RESTORE_DIR/*/backup_metadata.json)
echo "Restoring backup created at: $(echo $METADATA | jq -r .timestamp)"

# 1. Restore database
echo "Restoring database..."
docker-compose up -d postgres
sleep 30  # Wait for PostgreSQL to start

docker-compose exec -T postgres psql -U smart_hr_user -d postgres -c "DROP DATABASE IF EXISTS smart_hr_db;"
docker-compose exec -T postgres psql -U smart_hr_user -d postgres -c "CREATE DATABASE smart_hr_db;"
docker-compose exec -T postgres pg_restore -U smart_hr_user -d smart_hr_db -v $RESTORE_DIR/*/database.dump

# 2. Restore ML models
echo "Restoring ML models..."
rm -rf /var/lib/docker/volumes/smart_hr_ml_models_prod/_data/*
tar -xzf $RESTORE_DIR/*/ml_models.tar.gz -C /var/lib/docker/volumes/smart_hr_ml_models_prod/_data

# 3. Restore configuration
echo "Restoring configuration..."
cp $RESTORE_DIR/*/.env /opt/smart-hr/app/
cp $RESTORE_DIR/*/docker-compose*.yml /opt/smart-hr/app/

# 4. Restart services
echo "Restarting services..."
docker-compose up -d

# 5. Verify restore
echo "Verifying restore..."
sleep 30
curl -f http://localhost:3000/health || echo "Health check failed"
docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db -c "SELECT COUNT(*) FROM users;" || echo "Database verification failed"

# Clean up
rm -rf $RESTORE_DIR
if [[ "$BACKUP_FILE" != "$1" ]]; then
    rm -f $BACKUP_FILE
fi

echo "Restore completed successfully!"
```

---

🔧 استكشاف الأخطاء

مشاكل شائعة وحلولها

1. مشاكل قاعدة البيانات

```bash
# Database connection refused
ERROR: connection to server at "postgres" (172.20.0.2), port 5432 failed: Connection refused

# الحل:
# 1. تحقق من أن PostgreSQL يعمل
docker-compose ps postgres

# 2. تحقق من الـ logs
docker-compose logs postgres

# 3. أعد تشغيل الخدمة
docker-compose restart postgres

# 4. تحقق من متغيرات البيئة
echo $DB_PASSWORD

# 5. اختبر الاتصال يدويًا
docker-compose exec postgres psql -U $DB_USER -d $DB_NAME
```

2. مشاكل الذاكرة

```bash
# Out of memory errors
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory

# الحل:
# 1. زيادة ذاكرة Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# 2. تحسين استعلامات قاعدة البيانات
# أضف indexes للاستعلامات البطيئة

# 3. تقليل حجم الـ logs
docker-compose exec backend npm run prune-logs

# 4. مراقبة استخدام الذاكرة
docker stats
```

3. مشاكل الشبكة

```bash
# Network timeout errors
ETIMEDOUT: connect ETIMEDOUT 172.20.0.3:3000

# الحل:
# 1. تحقق من الشبكة الداخلية
docker network ls
docker network inspect smart_hr_network

# 2. أعد بناء الشبكة
docker-compose down
docker network prune
docker-compose up -d

# 3. تحقق من جدار الحماية
sudo ufw status
sudo ufw allow 3000:8000/tcp

# 4. اختبر الاتصال بين الحاويات
docker-compose exec backend ping ml-service
```

4. مشاكل الـ SSL/TLS

```bash
# SSL certificate errors
SSL_ERROR_SYSCALL in connection to api-hr.yourcompany.com:443

# الحل:
# 1. تحقق من صلاحية الشهادة
openssl x509 -in /etc/nginx/ssl/cert.pem -noout -dates

# 2. تجديد الشهادة
sudo certbot renew --dry-run

# 3. تحقق من تكوين NGINX
sudo nginx -t

# 4. أعد تحميل NGINX
sudo systemctl reload nginx
```

5. مشاكل التحديث

```bash
# Migration errors
ERROR: relation "users" already exists

# الحل:
# 1. ارجع إلى migration سابقة
npm run migrate:down

# 2. تحقق من حالة الـ migrations
npm run migrate:status

# 3. أعد تشغيل migration محددة
npm run migrate:up -- --name=20240101000000_create_users_table

# 4. استخدم force إذا لزم الأمر (بحذر)
npm run migrate:force
```

أدوات التشخيص

```bash
#!/bin/bash
# diagnostics.sh

echo "=== Smart HR System Diagnostics ==="
echo "Run at: $(date)"
echo ""

# 1. System information
echo "1. System Information:"
echo "Hostname: $(hostname)"
echo "Uptime: $(uptime -p)"
echo "Load: $(uptime | awk -F'load average:' '{print $2}')"
echo ""

# 2. Docker information
echo "2. Docker Information:"
docker --version
docker-compose --version
echo ""

# 3. Service status
echo "3. Service Status:"
docker-compose ps
echo ""

# 4. Resource usage
echo "4. Resource Usage:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"
echo ""

# 5. Network connectivity
echo "5. Network Connectivity:"
echo "Testing internal connectivity..."
docker-compose exec backend curl -s http://ml-service:8000/health > /dev/null && echo "Backend → ML Service: ✓" || echo "Backend → ML Service: ✗"
docker-compose exec frontend curl -s http://backend:3000/health > /dev/null && echo "Frontend → Backend: ✓" || echo "Frontend → Backend: ✗"
echo ""

# 6. Database health
echo "6. Database Health:"
docker-compose exec postgres psql -U smart_hr_user -d smart_hr_db -c "
    SELECT 
        current_database() as database,
        pg_size_pretty(pg_database_size(current_database())) as size,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*) FROM pg_stat_activity) as total_connections;
" 2>/dev/null || echo "Database connection failed"
echo ""

# 7. Log analysis
echo "7. Recent Errors:"
docker-compose logs --tail=100 2>&1 | grep -i error | tail -10 || echo "No recent errors found"
echo ""

# 8. Disk space
echo "8. Disk Space:"
df -h /opt/smart-hr
echo ""

# 9. Backup status
echo "9. Backup Status:"
ls -la /opt/smart-hr/backups/*.gz 2>/dev/null | tail -5 || echo "No backups found"
echo ""

# 10. Recommendations
echo "10. Recommendations:"
if [ $(docker-compose ps | grep -c "Up") -lt 5 ]; then
    echo "⚠️  Some services are not running"
fi

if [ $(df /opt/smart-hr | awk 'NR==2 {print $5}' | sed 's/%//') -gt 80 ]; then
    echo "⚠️  Disk space is above 80%"
fi

echo ""
echo "Diagnostics completed."
```

---

📞 الدعم والاتصال

فريق الدعم

```yaml
Level 1 Support (24/7):
  - Email: support@yourcompany.com
  - Phone: +1234567890
  - Slack: #smart-hr-support

Level 2 Support (Business Hours):
  - Technical Lead: tech-lead@yourcompany.com
  - DevOps Engineer: devops@yourcompany.com
  - Database Admin: dba@yourcompany.com

Emergency Support (Critical Issues):
  - PagerDuty: Smart HR On-Call
  - Escalation Path: Support → DevOps → Engineering Manager
```

سياسة الاستجابة

```yaml
Response Time SLAs:
  - Critical (Service Down): 15 minutes
  - High (Major Feature Broken): 1 hour
  - Medium (Minor Issue): 4 hours
  - Low (Enhancement Request): 2 business days

Resolution Time SLAs:
  - Critical: 2 hours
  - High: 8 hours
  - Medium: 3 business days
  - Low: 2 weeks
```

---

آخر تحديث: 2025-01-13
الإصدار: 2.0.0
كاتب الدليل: فريق DevOps
المراجعة: فريق الهندسة
الموافقة: مدير النظام

```
