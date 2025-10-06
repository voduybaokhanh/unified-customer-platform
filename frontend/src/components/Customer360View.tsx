// frontend/src/components/Customer360View.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { customerApi, timelineApi, ticketApi } from '../lib/api';

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
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
              <p className="text-gray-600 mt-1">{customer.email}</p>
              {customer.phone && (
                <p className="text-gray-600">{customer.phone}</p>
              )}
              {customer.company && (
                <p className="text-gray-500 text-sm mt-2">{customer.company}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Start Chat
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Create Ticket
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total Chats</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {stats.totalChats}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Total Tickets</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">
                {stats.totalTickets}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Open Tickets</div>
              <div className="text-3xl font-bold text-orange-600 mt-2">
                {stats.ticketsByStatus.open || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600">Resolved</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {stats.ticketsByStatus.resolved || 0}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Activity Timeline</h2>
            <div className="space-y-4">
              {timeline.map((event) => (
                <TimelineItem key={event.id} event={event} />
              ))}
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Recent Tickets</h2>
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <TicketItem key={ticket.id} ticket={ticket} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'chat': return '💬';
      case 'ticket_created': return '🎫';
      case 'ticket_updated': return '📝';
      case 'ticket_closed': return '✅';
      default: return '📌';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex items-start gap-3 pb-4 border-b last:border-0">
      <div className="text-2xl">{getIcon(event.type)}</div>
      <div className="flex-1">
        <p className="text-gray-900">{event.description}</p>
        <p className="text-sm text-gray-500 mt-1">{formatDate(event.timestamp)}</p>
      </div>
    </div>
  );
}

function TicketItem({ ticket }: { ticket: any }) {
  const statusColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-medium text-sm">{ticket.ticketNumber}</p>
          <p className="text-sm text-gray-600 mt-1">{ticket.subject}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${statusColors[ticket.status]}`}>
          {ticket.status}
        </span>
      </div>
    </div>
  );
}