# Unified Customer Engagement Platform

## 📖 Tổng quan

Hệ thống chăm sóc khách hàng all-in-one, tích hợp 3 module: **CRM**, **Live Chat**, và **Help Desk**. Cung cấp cái nhìn 360 độ về khách hàng với lịch sử tương tác đầy đủ.

---

## 🏗️ Tech Stack

### Backend

- **NestJS** (Node.js framework)
- **TypeScript**
- **PostgreSQL** (Database)
- **Prisma** (ORM)
- **Redis** (Cache & Pub/Sub)
- **Socket.io** (WebSocket real-time)

### Frontend

- **React** + **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS**
- **Socket.io-client**
- **React Query**

---

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
# Khởi động PostgreSQL và Redis
docker-compose up -d

# Kiểm tra containers đang chạy
docker ps
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
npx prisma migrate dev --name init
npx prisma generate

# Start server
npm run start:dev
```

Server chạy tại: `http://localhost:3000`

### 4. Setup Frontend (Coming soon)

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Development Progress

### ✅ Phase 1: Foundation & Setup (COMPLETED)

- [x] Docker setup (PostgreSQL + Redis)
- [x] NestJS project structure
- [x] Prisma schema & migrations
- [x] Global validation & error handling

### ✅ Phase 2: CRM Module (COMPLETED)

- [x] Customer CRUD APIs
- [x] Email lookup (for Live Chat integration)
- [x] Pagination support
- [x] Input validation với class-validator
- [x] Comprehensive error handling

### ✅ Phase 3: Live Chat Module (COMPLETED)

- [x] WebSocket setup with Socket.io
- [x] Chat session management
- [x] Real-time messaging (customer ↔ agent)
- [x] Auto CRM integration (lookup/create customer)
- [x] Chat history persistence
- [x] Agent assignment to sessions
- [x] Typing indicators
- [x] Room-based communication
- [x] REST APIs for session management

### 📋 Phase 4: Help Desk Module (COMPLETED)

- [x] Ticket CRUD operations
- [x] Convert chat to ticket (1-click)
- [x] Ticket assignment & status workflow
- [x] Comments & internal notes
- [x] Priority management

### 🔗 Phase 5: Integration (PLANNED)

- [ ] Connect all modules seamlessly
- [ ] Customer activity timeline
- [ ] Unified notification system

### 🎨 Phase 6: 360° Customer View (PLANNED)

- [ ] Customer detail page with full history
- [ ] Timeline visualization
- [ ] Related data aggregation
- [ ] Analytics dashboard

### 🚀 Phase 7: Production Ready (PLANNED)

- [ ] Authentication & Authorization (JWT)
- [ ] Role-based access control
- [ ] Rate limiting
- [ ] Logging & Monitoring
- [ ] Docker production setup
- [ ] CI/CD pipeline

---

## 📡 API Documentation

### 🔹 CRM Module APIs

| Method | Endpoint                      | Description                           |
| ------ | ----------------------------- | ------------------------------------- |
| POST   | `/api/customers`              | Tạo khách hàng mới                    |
| GET    | `/api/customers`              | Lấy danh sách khách hàng (phân trang) |
| GET    | `/api/customers/:id`          | Lấy chi tiết khách hàng theo ID       |
| GET    | `/api/customers/email/:email` | Tìm khách hàng theo email             |
| PUT    | `/api/customers/:id`          | Cập nhật thông tin khách hàng         |
| DELETE | `/api/customers/:id`          | Xóa khách hàng                        |

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

#### Example Response

```json
{
  "success": true,
  "message": "Tạo khách hàng thành công",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "0123456789",
    "company": "ABC Corp",
    "createdAt": "2025-10-04T12:00:00.000Z",
    "updatedAt": "2025-10-04T12:00:00.000Z"
  }
}
```

---

### 🔹 Live Chat Module APIs

#### REST APIs

| Method | Endpoint                          | Description                             |
| ------ | --------------------------------- | --------------------------------------- |
| GET    | `/api/chat/sessions/active`       | Lấy danh sách chat sessions đang active |
| GET    | `/api/chat/sessions/:id`          | Lấy thông tin chi tiết session          |
| GET    | `/api/chat/sessions/:id/messages` | Lấy lịch sử chat                        |
| POST   | `/api/chat/sessions/:id/close`    | Đóng chat session                       |
| POST   | `/api/chat/sessions/:id/assign`   | Gán agent vào session                   |

#### WebSocket Events

**Endpoint:** `ws://localhost:3000/chat`

| Event         | Direction       | Description                 | Payload                                                    |
| ------------- | --------------- | --------------------------- | ---------------------------------------------------------- |
| `startChat`   | Client → Server | Bắt đầu chat session        | `{ customerEmail, customerName }`                          |
| `chatStarted` | Server → Client | Xác nhận chat đã bắt đầu    | `{ sessionId, customer, isNewCustomer }`                   |
| `sendMessage` | Client → Server | Gửi tin nhắn                | `{ sessionId, content, senderType, senderId, senderName }` |
| `newMessage`  | Server → Client | Nhận tin nhắn mới           | `{ id, sessionId, senderType, content, sentAt }`           |
| `joinSession` | Client → Server | Agent tham gia session      | `{ sessionId, agentId, agentName }`                        |
| `agentJoined` | Server → Client | Thông báo agent đã tham gia | `{ agentId, agentName, message }`                          |
| `closeChat`   | Client → Server | Đóng chat session           | `{ sessionId }`                                            |
| `chatClosed`  | Server → Client | Thông báo chat đã đóng      | `{ sessionId, message }`                                   |
| `typing`      | Client → Server | Thông báo đang gõ           | `{ sessionId, isTyping, userName }`                        |
| `userTyping`  | Server → Client | Hiển thị trạng thái typing  | `{ userName, isTyping }`                                   |

---

## 🧪 Testing Guide

### 1. Test CRM APIs với Postman

1. Import [File JSON](postman.json)
2. Đảm bảo server đang chạy: `npm run start:dev`
3. Test các endpoints theo thứ tự trong collection

### 2. Test Live Chat Real-time

#### 🎯 Quick Start Guide

**Bước 1: Khởi động server**

```bash
cd backend
npm run start:dev
```

**Bước 2: Test Customer Chat**

1. Mở [File Html](test/chat-test.html) trong browser
2. Nhập email: `customer@example.com`
3. Nhập tên: `Customer Test`
4. Click **"Bắt đầu Chat"**
5. ✅ Đợi status bar hiện: **"Chat đã bắt đầu - Session: xxxxx..."**
6. 📋 **Copy Session ID** (hiển thị trong status bar)
7. Gửi tin nhắn: "Xin chào, tôi cần hỗ trợ"

**Bước 3: Test Agent Support**

1. Mở [File Html](test/agent-test.html) trong tab/browser mới
2. Agent ID: `agent-001` (mặc định)
3. Agent Name: `Support Agent` (mặc định)
4. **Paste Session ID** đã copy từ customer chat
5. Click **"Join Session"**
6. ✅ Sẽ thấy chat history của customer
7. Gửi tin nhắn: "Xin chào! Tôi có thể giúp gì?"
8. 🎉 Tin nhắn xuất hiện real-time ở cả 2 tabs!

#### 🔍 Kiểm tra Database

```bash
npx prisma studio
```

Truy cập `http://localhost:5555` và kiểm tra:

- `customers`: Có customer mới
- `chat_sessions`: Có session với status "active"
- `chat_messages`: Có tin nhắn đã gửi
- `customer_activities`: Có log activity

---

## 🗄️ Database Schema

### Customers

```sql
- id: UUID (PK)
- email: VARCHAR (UNIQUE)
- name: VARCHAR
- phone: VARCHAR (nullable)
- company: VARCHAR (nullable)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### ChatSessions

```sql
- id: UUID (PK)
- customer_id: UUID (FK → customers)
- agent_id: UUID (nullable)
- status: VARCHAR ('active', 'closed')
- started_at: TIMESTAMP
- ended_at: TIMESTAMP (nullable)
```

### ChatMessages

```sql
- id: UUID (PK)
- session_id: UUID (FK → chat_sessions)
- sender_type: VARCHAR ('customer', 'agent')
- sender_id: UUID
- content: TEXT
- sent_at: TIMESTAMP
```

### CustomerActivities

```sql
- id: UUID (PK)
- customer_id: UUID (FK → customers)
- activity_type: VARCHAR ('chat', 'ticket_created', etc.)
- reference_id: UUID
- description: TEXT
- created_at: TIMESTAMP
```

### Tickets (Coming soon)

```sql
- id: UUID (PK)
- ticket_number: VARCHAR (UNIQUE)
- customer_id: UUID (FK → customers)
- chat_session_id: UUID (FK → chat_sessions, nullable)
- subject: VARCHAR
- description: TEXT
- status: VARCHAR ('open', 'in_progress', 'resolved', 'closed')
- priority: VARCHAR ('low', 'medium', 'high', 'urgent')
- assigned_to: UUID (nullable)
- created_at: TIMESTAMP
- resolved_at: TIMESTAMP (nullable)
```

---

## 📝 Project Structure

```
unified-customer-platform/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── crm/
│   │   │   │   ├── dto/
│   │   │   │   │   ├── create-customer.dto.ts
│   │   │   │   │   └── update-customer.dto.ts
│   │   │   │   ├── crm.controller.ts
│   │   │   │   ├── crm.service.ts
│   │   │   │   └── crm.module.ts
│   │   │   └── chat/
│   │   │       ├── dto/
│   │   │       │   ├── start-chat.dto.ts
│   │   │       │   ├── send-message.dto.ts
│   │   │       │   ├── chat-session.dto.ts
│   │   │       │   └── chat-message.dto.ts
│   │   │       ├── chat.gateway.ts
│   │   │       ├── chat.service.ts
│   │   │       ├── chat.controller.ts
│   │   │       └── chat.module.ts
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   └── package.json
├── frontend/ (Coming soon)
├── docker-compose.yml
├── chat-test.html (Customer test client)
├── agent-test.html (Agent test client)
├── CRM-LiveChat-API-Collection.postman_collection.json
└── README.md
```

---

## 🔧 Useful Commands

### Docker

```bash
# Khởi động containers
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng containers
docker-compose down

# Xóa containers + data
docker-compose down -v
```

### Prisma

```bash
# Tạo migration mới
npx prisma migrate dev --name <migration_name>

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Mở Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### NestJS

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm run test
npm run test:e2e
npm run test:cov
```

---

## 🐛 Troubleshooting

### Lỗi: "Can't reach database server"

```bash
# Kiểm tra Docker containers
docker ps

# Nếu không thấy containers, khởi động lại
docker-compose up -d
```

### Lỗi: "Port 5432 already in use"

```bash
# Tắt PostgreSQL local hoặc đổi port trong docker-compose.yml
ports:
  - "5433:5432"

# Update DATABASE_URL trong .env
DATABASE_URL="postgresql://admin:admin123@localhost:5433/customer_platform"
```

### WebSocket không kết nối được

- Kiểm tra server đã bật CORS: Xem `main.ts`
- Mở Console (F12) trong browser để xem lỗi chi tiết
- Đảm bảo đang dùng đúng port: `http://localhost:3000/chat`

---

## 📚 Next Steps

1. **Phase 4:** Implement Help Desk Ticket System
2. **Phase 5:** Connect chat → ticket conversion
3. **Phase 6:** Build customer 360° view dashboard
4. **Phase 7:** Add authentication & production deployment

---

## 🤝 Contributing

1. Fork repository
2. Tạo branch: `git checkout -b feature/ten-tinh-nang`
3. Commit: `git commit -m "Add: mô tả thay đổi"`
4. Push: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## 📄 License

MIT License

---

## 👥 Team

Developed with ❤️ by VoDuyBaoKhanh

**Questions?** Open an issue or contact: khanhvo908@gmail.com
