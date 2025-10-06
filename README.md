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
- **React + TypeScript**
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
git clone https://github.com/voduybaokhanh/unified-customer-platform.git
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

**Server chạy tại:** http://localhost:3000

### 4. Setup Frontend (Coming soon)

```bash
cd frontend
npm install
npm run dev
```

---

## 📊 Development Progress

### ✅ Phase 1: Foundation & Setup (COMPLETED)
- ✅ Docker setup (PostgreSQL + Redis)
- ✅ NestJS project structure
- ✅ Prisma schema & migrations
- ✅ Global validation & error handling

### ✅ Phase 2: CRM Module (COMPLETED)
- ✅ Customer CRUD APIs
- ✅ Email lookup (for Live Chat integration)
- ✅ Pagination support
- ✅ Input validation với class-validator
- ✅ Comprehensive error handling

### ✅ Phase 3: Live Chat Module (COMPLETED)
- ✅ WebSocket setup with Socket.io
- ✅ Chat session management
- ✅ Real-time messaging (customer ↔ agent)
- ✅ Auto CRM integration (lookup/create customer)
- ✅ Chat history persistence
- ✅ Agent assignment to sessions
- ✅ Typing indicators
- ✅ Room-based communication
- ✅ REST APIs for session management

### ✅ Phase 4: Help Desk Module (COMPLETED)
- ✅ Ticket CRUD operations
- ✅ Convert chat to ticket (1-click)
- ✅ Ticket assignment & status workflow
- ✅ Comments & internal notes
- ✅ Priority management (low, medium, high, urgent)
- ✅ Ticket number auto-generation (TK-00001, TK-00002...)

### ✅ Phase 5: Integration (COMPLETED)
- ✅ Connect all modules seamlessly
- ✅ Customer activity timeline
- ✅ Unified notification system (WebSocket)
- ✅ Customer statistics & analytics
- ✅ Recent activity dashboard

### 🎨 Phase 6: 360° Customer View (PLANNED)
- ⬜ Customer detail page with full history
- ⬜ Timeline visualization
- ⬜ Related data aggregation
- ⬜ Analytics dashboard

### 🚀 Phase 7: Production Ready (PLANNED)
- ⬜ Authentication & Authorization (JWT)
- ⬜ Role-based access control
- ⬜ Rate limiting
- ⬜ Logging & Monitoring
- ⬜ Docker production setup
- ⬜ CI/CD pipeline

---

## 📡 API Documentation

### 🔹 CRM Module APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/customers` | Tạo khách hàng mới |
| GET | `/api/customers` | Lấy danh sách khách hàng (phân trang) |
| GET | `/api/customers/:id` | Lấy chi tiết khách hàng theo ID |
| GET | `/api/customers/email/:email` | Tìm khách hàng theo email |
| PUT | `/api/customers/:id` | Cập nhật thông tin khách hàng |
| DELETE | `/api/customers/:id` | Xóa khách hàng |

### 🔹 Live Chat Module APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/sessions/active` | Lấy danh sách chat sessions đang active |
| GET | `/api/chat/sessions/:id` | Lấy thông tin chi tiết session |
| GET | `/api/chat/sessions/:id/messages` | Lấy lịch sử chat |
| POST | `/api/chat/sessions/:id/close` | Đóng chat session |
| POST | `/api/chat/sessions/:id/assign` | Gán agent vào session |

**WebSocket Endpoint:** `ws://localhost:3000/chat`

### 🔹 Tickets Module APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tickets` | Tạo ticket mới |
| POST | `/api/tickets/convert-from-chat/:sessionId` | Convert chat thành ticket |
| GET | `/api/tickets` | Lấy danh sách tickets (có filter) |
| GET | `/api/tickets/:id` | Lấy chi tiết ticket |
| GET | `/api/tickets/number/:ticketNumber` | Tìm ticket theo số (TK-00001) |
| GET | `/api/tickets/customer/:customerId` | Lấy tất cả tickets của customer |
| PUT | `/api/tickets/:id` | Cập nhật ticket (status, priority) |
| POST | `/api/tickets/:id/comments` | Thêm comment vào ticket |
| GET | `/api/tickets/:id/comments` | Lấy danh sách comments |
| DELETE | `/api/tickets/:id` | Đóng ticket (soft delete) |

### 🔹 Integration Module APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/timeline/customer/:customerId` | Lấy timeline 360° của customer |
| GET | `/api/timeline/customer/:customerId/stats` | Thống kê tổng quan customer |
| GET | `/api/timeline/recent?limit=20` | Timeline gần đây (dashboard) |
| GET | `/api/timeline/event/:eventId?type=chat` | Chi tiết một event trong timeline |

**Notification WebSocket:** `ws://localhost:3000/notifications`

---

## 🧪 Testing Guide

### 1. Test CRM & Tickets APIs với Postman
- Import collection: `postman-collection.json`
- Đảm bảo server đang chạy: `npm run start:dev`
- Test các endpoints theo thứ tự trong collection

### 2. Test Live Chat Real-time

#### Bước 1: Khởi động server
```bash
cd backend
npm run start:dev
```

#### Bước 2: Test Customer Chat
1. Mở file `chat-test.html` trong browser
2. Nhập email: `customer@example.com`
3. Nhập tên: `Customer Test`
4. Click "Bắt đầu Chat"
5. Copy Session ID từ status bar
6. Gửi tin nhắn: "Xin chào, tôi cần hỗ trợ"

#### Bước 3: Test Agent Support
1. Mở file `agent-test.html` trong tab/browser mới
2. Agent ID: `agent-001` (mặc định)
3. Agent Name: `Support Agent` (mặc định)
4. Paste Session ID đã copy
5. Click "Join Session"
6. Gửi tin nhắn: "Xin chào! Tôi có thể giúp gì?"
7. Tin nhắn xuất hiện real-time ở cả 2 tabs

### 3. Test Notifications Real-time

#### Bước 1: Mở Notification Dashboard
1. Mở file `notification-test.html` trong browser
2. Agent ID: `agent-001`
3. Click "Subscribe to Notifications"
4. Status hiển thị: "Đã đăng ký thành công"

#### Bước 2: Trigger Notifications
- Tạo chat mới (dùng `chat-test.html`) → Agent nhận notification
- Convert chat → ticket → Agent nhận notification
- Update ticket status → Liên quan nhận notification

### 4. Test Timeline & 360° View

Dùng Postman:
1. Chạy request "29. Get Customer Timeline"
2. Xem toàn bộ activities: chat, tickets, status changes
3. Chạy request "30. Get Customer Stats"
4. Xem thống kê: tổng chat, tổng tickets, breakdown by status

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

### Tickets
```sql
- id: UUID (PK)
- ticket_number: VARCHAR (UNIQUE)
- customer_id: UUID (FK → customers)
- chat_session_id: UUID (FK → chat_sessions, nullable)
- subject: VARCHAR
- description: TEXT
- status: VARCHAR ('open', 'in_progress', 'resolved', 'closed')
- priority: VARCHAR ('low', 'medium', 'high', 'urgent')
- assigned_to: VARCHAR (nullable)
- created_at: TIMESTAMP
- resolved_at: TIMESTAMP (nullable)
```

### TicketComments
```sql
- id: UUID (PK)
- ticket_id: UUID (FK → tickets)
- user_id: VARCHAR
- comment: TEXT
- is_internal: BOOLEAN
- created_at: TIMESTAMP
```

### CustomerActivities
```sql
- id: UUID (PK)
- customer_id: UUID (FK → customers)
- activity_type: VARCHAR ('chat', 'ticket_created', 'ticket_updated', 'ticket_closed')
- reference_id: UUID
- description: TEXT
- created_at: TIMESTAMP
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
│   │   │   │   ├── crm.controller.ts
│   │   │   │   ├── crm.service.ts
│   │   │   │   └── crm.module.ts
│   │   │   ├── chat/
│   │   │   │   ├── dto/
│   │   │   │   ├── chat.gateway.ts
│   │   │   │   ├── chat.service.ts
│   │   │   │   ├── chat.controller.ts
│   │   │   │   └── chat.module.ts
│   │   │   ├── tickets/
│   │   │   │   ├── dto/
│   │   │   │   ├── tickets.controller.ts
│   │   │   │   ├── tickets.service.ts
│   │   │   │   └── tickets.module.ts
│   │   │   └── timeline/
│   │   │       ├── timeline.controller.ts
│   │   │       ├── timeline.service.ts
│   │   │       ├── notifications.gateway.ts
│   │   │       └── timeline.module.ts
│   │   ├── prisma/
│   │   │   ├── prisma.service.ts
│   │   │   └── prisma.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── package.json
├── frontend/ (Coming soon)
├── docker-compose.yml
├── chat-test.html (Customer test client)
├── agent-test.html (Agent test client)
├── notification-test.html (Notification dashboard)
├── postman-collection.json
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
```

---

## 🐛 Troubleshooting

### Lỗi: "Can't reach database server"

```bash
docker ps                    # Kiểm tra containers
docker-compose up -d         # Khởi động lại
```

### Lỗi: "Port 5432 already in use"

```bash
# Đổi port trong docker-compose.yml
ports:
  - "5433:5432"

# Update .env
DATABASE_URL="postgresql://admin:admin123@localhost:5433/customer_platform"
```

### WebSocket không kết nối

- Kiểm tra CORS trong `main.ts`
- Mở Console (F12) để xem lỗi chi tiết
- Đảm bảo server đang chạy tại http://localhost:3000

---

## 📚 Next Steps

1. **Phase 6:** Build 360° customer view dashboard với React
2. **Phase 7:** Add authentication, authorization & production deployment

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

**Developed with ❤️ by VoDuyBaoKhanh**

📧 Questions? Open an issue or contact: khanhvo908@gmail.com
