-- CUSTOMERS (CRM Core)
customers (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR,
  phone VARCHAR,
  company VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- LIVE CHAT SESSIONS
chat_sessions (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  agent_id UUID REFERENCES users(id),
  status ENUM('active', 'closed'),
  started_at TIMESTAMP,
  ended_at TIMESTAMP
)

-- CHAT MESSAGES
chat_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id),
  sender_type ENUM('customer', 'agent'),
  sender_id UUID,
  content TEXT,
  sent_at TIMESTAMP
)

-- TICKETS (Help Desk)
tickets (
  id UUID PRIMARY KEY,
  ticket_number VARCHAR UNIQUE, -- TK-001, TK-002
  customer_id UUID REFERENCES customers(id),
  chat_session_id UUID REFERENCES chat_sessions(id), -- nullable
  subject VARCHAR,
  description TEXT,
  status ENUM('open', 'in_progress', 'resolved', 'closed'),
  priority ENUM('low', 'medium', 'high', 'urgent'),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP,
  resolved_at TIMESTAMP
)

-- TICKET COMMENTS (internal notes + customer replies)
ticket_comments (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id),
  user_id UUID REFERENCES users(id),
  comment TEXT,
  is_internal BOOLEAN, -- true = ghi chú nội bộ
  created_at TIMESTAMP
)

-- CUSTOMER ACTIVITY TIMELINE
customer_activities (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  activity_type ENUM('chat', 'ticket_created', 'ticket_updated', 'ticket_closed'),
  reference_id UUID, -- ID của chat_session hoặc ticket
  description TEXT,
  created_at TIMESTAMP
)

-- USERS/AGENTS
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  name VARCHAR,
  role ENUM('agent', 'admin'),
  department VARCHAR,
  created_at TIMESTAMP
)