# TebX Dashboard – Production Deployment Guide

## 🚀 Deployment Overview
The TebX Dashboard system is composed of three tiers—frontend (static dashboard UI), backend API (NestJS), and data services (MongoDB, Redis, Keycloak).  Traffic terminates at an edge CDN or load-balancer (NGINX/ALB) before being routed to autoscaled API containers running in Docker Swarm / ECS / Kubernetes.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Frontend CDN   │    │   Monitoring    │
│   (NGINX/ALB)   │    │  (Cloudflare)    │    │ (DataDog/NewR)  │
└─────────┬───────┘    └─────────┬────────┘    └─────────────────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ TebX API (ECS)  │    │  Dashboard UI    │    │  Log Aggreg     │
│  (NestJS)       │◄───│ (Static S3/CF)   │    │   (ELK/S3)      │
└─────────┬───────┘    └──────────────────┘    └─────────────────┘
          │                                           
          ▼                                           
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  MongoDB RS     │    │   Redis Cluster  │    │   Keycloak      │
│ (3 nodes)       │    │  (Cache)         │    │   (Auth)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Infrastructure Requirements
| Component | Minimum | Recommended (HA / autoscale) |
|-----------|---------|------------------------------|
| API nodes | 4 vCPU / 8 GB | 8 vCPU / 16 GB × 2–6 |
| MongoDB   | 4 vCPU / 16 GB (Primary+2) | 8 vCPU / 32 GB (Primary+2 secondary) |
| Redis     | 2 vCPU / 4 GB | 4 vCPU / 8 GB (Cluster) |
| Load-balancer | 2 vCPU / 4 GB | 4 vCPU / 8 GB (multi-AZ) |
| Monitoring/Logging | 2 vCPU / 8 GB | 4 vCPU / 16 GB |

---

## 🏗️ Infrastructure Setup

### 1  Cloud Provider (AWS example)

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=tebx-prod}]'
# Public & private subnets
# …
# Security groups
aws ec2 create-security-group --group-name tebx-api --description "TebX API SG"
aws ec2 create-security-group --group-name tebx-db  --description "TebX DB SG"
```

Sample SG rules (JSON snippet):

```json
{
  "api-sg": {
    "inbound": [
      {"protocol":"tcp","port":443,"source":"0.0.0.0/0"},
      {"protocol":"tcp","port":80,"source":"0.0.0.0/0"},
      {"protocol":"tcp","port":22,"source":"admin-ips"}
    ],
    "outbound":[{"protocol":"-1","port":"all","destination":"0.0.0.0/0"}]
  },
  "db-sg": {
    "inbound": [
      {"protocol":"tcp","port":27017,"source":"api-sg"},
      {"protocol":"tcp","port":6379,"source":"api-sg"}
    ]
  }
}
```

### 2  MongoDB Replica-Set

Install & init:

```bash
# On each node
sudo apt-get update && sudo apt-get install -y mongodb-org
sudo systemctl enable --now mongod

# Initialize replica set on primary
mongosh --eval 'rs.initiate({
  _id:"tebx-rs",
  members:[
    {_id:0,host:"mongo-primary:27017",priority:2},
    {_id:1,host:"mongo-secondary1:27017",priority:1},
    {_id:2,host:"mongo-secondary2:27017",priority:1}
]})'
```

Create production DB users:

```javascript
use admin
db.createUser({user:"admin",pwd:"STRONG",roles:["root"]})
use tebx
db.createUser({user:"tebx_api",pwd:"API_PASS",roles:[{role:"readWrite",db:"tebx"}]})
```

### 3  Redis

`/etc/redis/redis.conf` essentials:

```
bind 0.0.0.0
requirepass STRONG_REDIS_PASS
maxmemory 4gb
maxmemory-policy allkeys-lru
```

Cluster (optional):

```bash
redis-cli --cluster create node1:6379 node2:6379 node3:6379 --cluster-replicas 0
```

---

## 🔧 Application Deployment

### 1  Environment variables (`.env.production`)
```
NODE_ENV=production
PORT=3333
DATABASE_URL=mongodb://tebx_api:API_PASS@mongo-primary:27017,mongo-secondary1:27017,mongo-secondary2:27017/tebx?replicaSet=tebx-rs&authSource=tebx
REDIS_URL=redis://:STRONG_REDIS_PASS@redis-cluster:6379
KEYCLOAK_URL=https://auth.tebx.com
KEYCLOAK_REALM=tebx-production
KEYCLOAK_CLIENT_ID=tebx-api
KEYCLOAK_CLIENT_SECRET=KC_SECRET
MAIL_FROM_ADDRESS=noreply@tebx.com
JWT_SECRET=ULTRA_SECURE
```

### 2  Docker Build & Compose

Dockerfile (multi-stage) and `docker-compose.prod.yml` already provided earlier—supports 3 × API replicas, MongoDB, Redis, NGINX.

Deploy:

```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### 3  NGINX Reverse-Proxy

`nginx.conf` key points:
- SSL (Let’s Encrypt or ACM certs)
- HTTP→HTTPS redirect
- Rate-limit zones (`api`, `dashboard`)
- Upstream keep-alive
- Static cache headers for `/` (dashboard UI)
- Health endpoint `/health`

---

## 🔐 Security Hardening

1. **TLS**: force TLS 1.2+, HSTS, secure ciphers.  
2. **Firewall**: allow 80/443/22; deny 27017/6379 externally; allow intra-VPC.  
3. **CORS & Rate-limiting**: enabled in NestJS.  
4. **Headers**: CSP, X-Frame-Options, X-Content-Type-Options, XSS-Protection.  
5. **Secrets**: store in AWS SSM / Secrets Manager; inject at runtime.  
6. **Dependency scanning**: Snyk / GitHub dependabot alerts.

---

## 📊 Monitoring & Logging

- **Health Checks**: `/health` endpoint via `@nestjs/terminus`.
- **Metrics Middleware**: capture latency & status; push to DataDog/NewRelic.
- **Winston** logger → stdout + file; file path mapped to host volume → Filebeat→ELK.
- **Alerts**: CPU > 70 %, mem > 80 %, 5XX rate > 1 %, Mongo primary down.

Example Prometheus alert rule:

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.01
  for: 5m
  labels: {severity: warning}
  annotations:
    summary: "High 5xx rate on TebX API"
```

---

## 🔄 Backup & DR

- **MongoDB**: `mongodump` every 2 h → S3, retain 30 days; oplog tail for PITR.  
- **Files (uploads)**: stored in Azure Blob / S3 with versioning + lifecycle policy.  
- **Redis**: snapshot hourly to EBS + daily S3 sync.  
- **RTO / RPO**: 30 min / 1 h.

---

## 🚀 Deployment Process

### Pre-deployment
- Infrastructure ready & security tested  
- DB replica set healthy  
- `.env.production` populated in Secrets Manager  
- CI pipeline green (unit, integration, e2e)  
- Container image scanned (Trivy)  

### Deploy
```bash
# 1. Tag & push image
docker build -t registry/tebx-api:1.0.0 .
docker push registry/tebx-api:1.0.0

# 2. Update compose stack / ECS task definition
docker-compose -f docker-compose.prod.yml pull tebx-api
docker-compose -f docker-compose.prod.yml up -d --no-deps --scale tebx-api=3 tebx-api

# 3. Verify health
curl -f https://api.tebx.com/health
```

### Post-deployment
- Check dashboards (latency, error rate)  
- Run smoke tests on critical endpoints  
- Validate frontend ⟷ API flow (dashboard UI loads live data)  
- Confirm logs & metrics shipping  

---

## 📈 Scaling & Performance

- **Horizontal scaling**: increase replicas in compose/ECS; LB least-conn algorithm.  
- **DB read replicas**: route heavy report queries to secondaries.  
- **Redis cluster**: shard keys by patient ID.  
- **CDN**: cache static dashboard assets at edge (Cloudflare).  
- **Auto-scaling** triggers: CPU > 60 % for 5 min OR requests > 200 RPS.  

---

## 🗓️ Maintenance Checklist

| Frequency | Task |
|-----------|------|
| Daily | Review monitoring alerts, verify backups |
| Weekly | Rotate API logs, audit security groups |
| Monthly| Patch OS & deps, review DB indexes |
| Quarterly | DR restore drill, penetration test |

---

## 🆘 Troubleshooting Quick-Refs

### API 5xx spikes
1. `docker logs tebx-api` – look for stack traces  
2. Check `redis-cli ping` & Mongo `rs.status()`  
3. If out-of-memory – scale replicas / increase memory  

### Dashboard blank
1. Inspect browser console (network errors CORS 4xx?)  
2. `curl -I https://api.tebx.com/dashboard/clinic/...` – verify 200  
3. Check NGINX logs `/var/log/nginx/error.log`

---

## ✅ Final Production Checklist

- [ ] SSL certs valid (SSLLabs A rating)  
- [ ] Health checks return 200  
- [ ] Autoscaling policies enabled  
- [ ] Alerts routed to on-call (PagerDuty)  
- [ ] Backups verified  
- [ ] Documentation updated & shared  

---

**Contacts**  
• DevOps (on-call): devops@tebx.com – +1-xxx-xxx-xxxx  
• Escalation (Tech Lead): lead@tebx.com  

---

*Deploy with confidence—TebX Dashboard keeps critical healthcare operations running smoothly, securely, and at scale.*  
