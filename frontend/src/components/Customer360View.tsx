// frontend/src/components/Customer360View.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerApi, timelineApi, ticketApi } from '../lib/api';
import { useRealtimeNotifications } from '../hooks/useRealtime';
import '../styles/customer-360.css';

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  createdAt: string;
}

interface Stats {
  totalChats: number;
  totalTickets: number;
  ticketsByStatus: Record<string, number>;
  lastActivity?: string;
}

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  metadata?: any;
}

export default function Customer360View() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useRealtimeNotifications('dashboard-viewer');

  useEffect(() => {
    if (!customerId) return;

    const fetchData = async () => {
      try {
        const [customerRes, statsRes, timelineRes, ticketsRes] = await Promise.all([
          customerApi.getById(customerId),
          timelineApi.getCustomerStats(customerId),
          timelineApi.getCustomerTimeline(customerId),
          ticketApi.getCustomerTickets(customerId),
        ]);

        setCustomer(customerRes.data.data);
        setStats(statsRes.data.data);
        setTimeline(timelineRes.data.data);
        setTickets(ticketsRes.data.data);
      } catch (error) {
        console.error('Error fetching customer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  useEffect(() => {
    if (notifications.length > 0 && customerId) {
      timelineApi.getCustomerTimeline(customerId).then(res => {
        setTimeline(res.data.data);
      });
    }
  }, [notifications, customerId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '16px', color: '#65676b' }}>Loading customer data...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="loading-container">
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😞</div>
          <h2>Customer Not Found</h2>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-360-container">
      {/* Navigation */}
      <div className="customer-360-nav">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Customer 360° View</h1>
      </div>

      {/* Customer Header */}
      <div className="customer-header">
        <div className="customer-header-content">
          <div className="customer-header-avatar">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div className="customer-header-info">
            <h2>{customer.name}</h2>
            <p>📧 {customer.email}</p>
            {customer.phone && <p>📱 {customer.phone}</p>}
            {customer.company && <p>🏢 {customer.company}</p>}
          </div>
          <div className="customer-header-actions">
            <button className="btn btn-primary">💬 Start Chat</button>
            <button className="btn btn-primary">🎫 Create Ticket</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-label">Total Chats</div>
            <div className="stat-value" style={{ color: '#3b82f6' }}>{stats.totalChats}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-label">Total Tickets</div>
            <div className="stat-value" style={{ color: '#8b5cf6' }}>{stats.totalTickets}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-label">Open Tickets</div>
            <div className="stat-value" style={{ color: '#f59e0b' }}>
              {stats.ticketsByStatus.open || 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Resolved</div>
            <div className="stat-value" style={{ color: '#10b981' }}>
              {stats.ticketsByStatus.resolved || 0}
            </div>
          </div>
        </div>
      )}

      {/* Timeline & Tickets */}
      <div className="content-grid">
        {/* Timeline */}
        <div className="timeline-card">
          <div className="card-header">
            <span style={{ fontSize: '24px' }}>📊</span>
            <h3>Activity Timeline</h3>
            <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#65676b' }}>
              {timeline.length} events
            </span>
          </div>
          <div className="timeline-list">
            {timeline.map((event) => (
              <TimelineItem key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="tickets-card">
          <div className="card-header">
            <span style={{ fontSize: '24px' }}>🎫</span>
            <h3>Recent Tickets</h3>
          </div>
          {tickets.length > 0 ? (
            tickets.slice(0, 5).map((ticket) => (
              <TicketItem key={ticket.id} ticket={ticket} />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No tickets yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const getEventIcon = (type: string) => {
    const icons: Record<string, { emoji: string; class: string }> = {
      chat: { emoji: '💬', class: 'chat' },
      ticket_created: { emoji: '🎫', class: 'ticket' },
      ticket_updated: { emoji: '📝', class: 'update' },
      ticket_closed: { emoji: '✅', class: 'closed' },
    };
    return icons[type] || { emoji: '📌', class: 'chat' };
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const icon = getEventIcon(event.type);

  return (
    <div className="timeline-item">
      <div className={`timeline-icon ${icon.class}`}>
        {icon.emoji}
      </div>
      <div className="timeline-content">
        <div className="timeline-description">{event.description}</div>
        <div className="timeline-time">{formatDate(event.timestamp)}</div>
      </div>
    </div>
  );
}

function TicketItem({ ticket }: { ticket: any }) {
  return (
    <div className="ticket-item">
      <div className="ticket-header">
        <span className="ticket-number">{ticket.ticketNumber}</span>
        <span className={`ticket-status ${ticket.status}`}>
          {ticket.status}
        </span>
      </div>
      <div className="ticket-subject">{ticket.subject}</div>
      <div className="ticket-meta">
        {ticket.priority === 'urgent' && '🔴 '}
        {ticket.priority === 'high' && '🟠 '}
        {ticket.priority === 'medium' && '🟡 '}
        {ticket.priority === 'low' && '🟢 '}
        {ticket.priority} • {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
      </div>
    </div>
  );
}