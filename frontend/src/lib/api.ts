// frontend/src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customer APIs
export const customerApi = {
  getAll: (params?: { page?: number; limit?: number }) => 
    api.get('/api/customers', { params }),
  
  getById: (id: string) => 
    api.get(`/api/customers/${id}`),
  
  getByEmail: (email: string) => 
    api.get(`/api/customers/email/${email}`),
  
  create: (data: any) => 
    api.post('/api/customers', data),
  
  update: (id: string, data: any) => 
    api.put(`/api/customers/${id}`, data),
};

// Timeline APIs
export const timelineApi = {
  getCustomerTimeline: (customerId: string) => 
    api.get(`/api/timeline/customer/${customerId}`),
  
  getCustomerStats: (customerId: string) => 
    api.get(`/api/timeline/customer/${customerId}/stats`),
  
  getRecent: (limit: number = 20) => 
    api.get(`/api/timeline/recent?limit=${limit}`),
};

// Ticket APIs
export const ticketApi = {
  getCustomerTickets: (customerId: string) => 
    api.get(`/api/tickets/customer/${customerId}`),
  
  getById: (id: string) => 
    api.get(`/api/tickets/${id}`),
};

// Chat APIs
export const chatApi = {
  getActiveSessions: () => 
    api.get('/api/chat/sessions/active'),
};