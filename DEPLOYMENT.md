# Production Deployment Guide

## 🚀 Docker Production Deployment

### Prerequisites
- Docker & Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)

### 1. Environment Setup

Create a `.env.production` file with your production values:

```bash
# Database
DATABASE_URL=postgresql://username:password@postgres:5432/customer_platform
DB_NAME=customer_platform
DB_USER=postgres
DB_PASSWORD=your-secure-database-password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-redis-password

# JWT Secrets (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
API_URL=https://api.your-domain.com
```

### 2. Deploy with Docker Compose

```bash
# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service health
docker-compose -f docker-compose.prod.yml ps
```

### 3. Database Migration

```bash
# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
```

### 4. SSL/HTTPS Setup (Nginx Reverse Proxy)

Create `nginx.conf`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. Monitoring & Logs

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# Check container health
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:3000/api/health
```

### 6. Backup & Maintenance

```bash
# Database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres customer_platform > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres customer_platform < backup.sql

# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Kubernetes Deployment (Alternative)

### 1. Create Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: customer-platform
```

### 2. Deploy PostgreSQL
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  namespace: customer-platform
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        env:
        - name: POSTGRES_DB
          value: customer_platform
        - name: POSTGRES_USER
          value: postgres
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-storage
        persistentVolumeClaim:
          claimName: postgres-pvc
```

### 3. Deploy Backend
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: customer-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: your-registry/customer-platform-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: REDIS_HOST
          value: redis
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 📊 Performance Optimization

### 1. Database Optimization
```sql
-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_chat_sessions_customer_id ON chat_sessions(customer_id);
CREATE INDEX idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
```

### 2. Redis Configuration
```bash
# Redis memory optimization
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### 3. Application Scaling
```bash
# Scale backend services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale with load balancer
docker-compose -f docker-compose.prod.yml up -d --scale backend=5
```

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Regular security updates
- [ ] Database encryption at rest
- [ ] Backup encryption
- [ ] Monitor failed login attempts
- [ ] Rate limiting enabled
- [ ] CORS properly configured

## 📈 Monitoring

### Health Checks
- Backend: `GET /api/health`
- Frontend: `GET /health`
- Database: Connection health
- Redis: Connection health

### Log Monitoring
```bash
# Monitor error logs
tail -f logs/error-$(date +%Y-%m-%d).log

# Monitor all logs
tail -f logs/combined-$(date +%Y-%m-%d).log
```

### Performance Metrics
- Response times
- Database query performance
- Memory usage
- CPU usage
- Disk I/O

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml exec postgres pg_isready
   
   # Check connection string
   echo $DATABASE_URL
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis status
   docker-compose -f docker-compose.prod.yml exec redis redis-cli ping
   ```

3. **Application Crashes**
   ```bash
   # Check application logs
   docker-compose -f docker-compose.prod.yml logs backend
   
   # Restart application
   docker-compose -f docker-compose.prod.yml restart backend
   ```

4. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Clean up unused containers
   docker system prune -a
   ```

## 🔄 Updates & Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
```

### Database Maintenance
```bash
# Backup before updates
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres customer_platform > backup-$(date +%Y%m%d).sql

# Vacuum database
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -d customer_platform -c "VACUUM ANALYZE;"
```

### Log Rotation
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/customer-platform

# Log rotation configuration
/var/log/customer-platform/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 root root
}
```
