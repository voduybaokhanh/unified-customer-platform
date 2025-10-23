# Unified Customer Platform - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (for production)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/voduybaokhanh/unified-customer-platform.git
   cd unified-customer-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment file
   cp .env.example .env
   
   # Update .env with your database credentials
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Start development server
   npm run start:dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Start development server
   npm run dev
   ```

### Production Setup with Docker

1. **Environment Configuration**
   ```bash
   # Copy and configure environment
   cp .env.example .env.production
   
   # Update with production values:
   # - Strong database passwords
   # - Secure JWT secrets
   # Production URLs
   ```

2. **Deploy with Docker Compose**
   ```bash
   # Start all services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Check logs
   docker-compose -f docker-compose.prod.yml logs -f
   
   # Stop services
   docker-compose -f docker-compose.prod.yml down
   ```

## 🔧 Environment Variables

### Required Variables
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database
DB_NAME=customer_platform
DB_USER=postgres
DB_PASSWORD=your-secure-password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com
```

## 🏗️ Architecture

### Backend (NestJS)
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (ADMIN, AGENT, CUSTOMER)
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis for sessions and rate limiting
- **Logging**: Winston with daily rotation
- **Security**: Helmet, CORS, Rate limiting
- **Real-time**: Socket.io for chat and notifications

### Frontend (React + Vite)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Real-time**: Socket.io client
- **Build**: Vite for fast development and optimized builds

### Database Schema
- **Users**: Authentication and authorization
- **Customers**: CRM data
- **Chat Sessions**: Live chat functionality
- **Tickets**: Support ticket system
- **Activities**: Timeline and audit logs

## 🔐 Security Features

### Authentication & Authorization
- JWT access tokens (1 hour expiry)
- Refresh tokens (7 days expiry)
- Password hashing with bcrypt (12 rounds)
- Role-based access control
- Protected routes with guards

### Rate Limiting
- Global: 100 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes
- Chat messages: 60 per minute
- Configurable per endpoint

### Security Headers
- Helmet for HTTP security headers
- CORS configuration
- Content Security Policy
- XSS protection
- CSRF protection

## 📊 Monitoring & Logging

### Logging Levels
- **Error**: Critical errors with stack traces
- **Warn**: Warning messages
- **Info**: General information
- **HTTP**: Request/response logging
- **Debug**: Development debugging

### Log Files (Production)
- `logs/error-YYYY-MM-DD.log`: Error logs
- `logs/combined-YYYY-MM-DD.log`: All logs
- `logs/http-YYYY-MM-DD.log`: HTTP requests

### Health Checks
- **Backend**: `GET /api/health`
- **Frontend**: `GET /health`
- **Database**: Connection health
- **Redis**: Connection health

## 🚀 Deployment

### Docker Production
```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f backend

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### CI/CD Pipeline
- **Trigger**: Push to main/develop branches
- **Tests**: Backend + Frontend unit tests
- **Security**: Trivy vulnerability scanning
- **Build**: Multi-stage Docker builds
- **Deploy**: Automatic deployment to staging/production

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm run test          # Unit tests
npm run test:e2e      # End-to-end tests
npm run test:cov      # Coverage report
```

### Frontend Tests
```bash
cd frontend
npm run test          # Unit tests
npm run test:coverage # Coverage report
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### CRM Endpoints
- `GET /api/crm/customers` - List customers
- `POST /api/crm/customers` - Create customer
- `GET /api/crm/customers/:id` - Get customer
- `PUT /api/crm/customers/:id` - Update customer
- `DELETE /api/crm/customers/:id` - Delete customer

### Chat Endpoints
- `GET /api/chat/sessions` - List chat sessions
- `POST /api/chat/sessions` - Start chat session
- `GET /api/chat/sessions/:id/messages` - Get messages
- `POST /api/chat/sessions/:id/messages` - Send message

### Ticket Endpoints
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment

## 🔧 Development

### Code Quality
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking
- **Husky**: Git hooks for quality checks

### Database Management
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration-name

# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check PostgreSQL is running
   pg_isready -h localhost -p 5432
   
   # Check connection string
   echo $DATABASE_URL
   ```

2. **Redis Connection**
   ```bash
   # Check Redis is running
   redis-cli ping
   
   # Check Redis configuration
   redis-cli config get "*"
   ```

3. **Port Conflicts**
   ```bash
   # Check port usage
   lsof -i :3000
   lsof -i :5173
   ```

4. **Docker Issues**
   ```bash
   # Clean up Docker
   docker system prune -a
   
   # Rebuild images
   docker-compose -f docker-compose.prod.yml build --no-cache
   ```

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the logs for error details

## 🔄 Updates

To update the application:
1. Pull latest changes: `git pull origin main`
2. Update dependencies: `npm update`
3. Run migrations: `npx prisma migrate deploy`
4. Restart services: `docker-compose restart`
