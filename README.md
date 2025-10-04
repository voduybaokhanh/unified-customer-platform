# Unified Customer Engagement Platform

## 📖 Tổng quan

Hệ thống chăm sóc khách hàng all-in-one, tích hợp 3 module: CRM, Live Chat, Help Desk.

## 🏗️ Tech Stack

### Backend

- **NestJS** (Node.js framework)
- **TypeScript**
- **PostgreSQL** (Database)
- **Prisma** (ORM)
- **Redis** (Cache & Pub/Sub)
- **Socket.io** (Real-time communication)

### Frontend

- **React** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS**
- **Socket.io-client**
- **React Query**

## 🚀 Setup & Installation

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- npm hoặc yarn

### 1. Clone Repository

```bash
git clone <repo-url>
cd unified-customer-platform
```

### 2. Setup Database (Docker)

```bash
docker-compose up -d
```

### 3. Setup Backend

```bash
cd backend
npm install

# Tạo file .env
DATABASE_URL="postgresql://admin:admin123@localhost:5432/customer_platform"
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000

# Run migrations
npx prisma migrate dev
npx prisma generate

# Start server
npm run start:dev
```

Server sẽ chạy tại: `http://localhost:3000`

### 4. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📊 Development Progress

### ✅ Phase 1: Foundation & Setup (COMPLETED)

- [x] Docker setup (PostgreSQL + Redis)
- [x] NestJS project structure
- [x] Prisma schema & migrations
- [x] React + Vite setup

### ✅ Phase 2: CRM Module (COMPLETED)

- [x] Customer CRUD APIs
- [x] Email lookup (for Live Chat integration)
- [x] Pagination support
- [x] Input validation
- [x] Error handling

### ✅ Phase 3: Live Chat Module (COMPLETED)

- [x] WebSocket setup with Socket.io
- [x] Chat session management
- [x] Real-time messaging (customer ↔ agent)
- [x] CRM integration (auto lookup/create customer)
- [x] Chat history persistence
- [x] Agent assignment
- [x] Typing indicators
- [x] Room-based communication

### 📋 Phase 4: Help Desk Module (PLANNED)

- [ ] Ticket CRUD
- [ ] Convert chat to ticket
- [ ] Ticket assignment
- [ ] Comments & internal notes

### 🔗 Phase 5: Integration (PLANNED)

- [ ] Connect all modules
- [ ] Customer activity tracking
- [ ] Timeline generation

### 🎨 Phase 6: 360° Customer View (PLANNED)

- [ ] Customer detail page
- [ ] Activity timeline
- [ ] Related data aggregation

### 🚀 Phase 7: Production Ready (PLANNED)

- [ ] Authentication & Authorization
- [ ] Rate limiting
- [ ] Logging & Monitoring
- [ ] Docker production setup

## 📡 API Endpoints

### CRM Module

| Method | Endpoint                      | Description                              |
| ------ | ----------------------------- | ---------------------------------------- |
| POST   | `/api/customers`              | Tạo khách hàng mới                       |
| GET    | `/api/customers`              | Lấy danh sách khách hàng (có phân trang) |
| GET    | `/api/customers/:id`          | Lấy chi tiết khách hàng                  |
| GET    | `/api/customers/email/:email` | Tìm khách hàng theo email                |
| PUT    | `/api/customers/:id`          | Cập nhật thông tin khách hàng            |
| DELETE | `/api/customers/:id`          | Xóa khách hàng                           |

#### Example: Create Customer

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "0123456789",
    "company": "ABC Corp"
  }'
```

#### Example: Get Customers (Paginated)

```bash
curl http://localhost:3000/api/customers?page=1&limit=10
```

## 🗄️ Database Schema

### Customers Table

```sql
- id: UUID (PK)
- email: VARCHAR (UNIQUE)
- name: VARCHAR
- phone: VARCHAR (nullable)
- company: VARCHAR (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Project Structure

```
backend/
├── src/
│   ├── modules/
│   │   └── crm/
│   │       ├── dto/
│   │       │   ├── create-customer.dto.ts
│   │       │   └── update-customer.dto.ts
│   │       ├── crm.controller.ts
│   │       ├── crm.service.ts
│   │       └── crm.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   └── schema.prisma
└── package.json
```

## 📄 License

MIT License
