// frontend/src/components/CustomerList.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerApi } from '../lib/api';
import '../styles/customer-list.css';

interface Customer {
  id: string;
  email: string;
  name: string;
  company?: string;
  phone?: string;
  createdAt: string;
}

export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAll({ page, limit: 10 });
      setCustomers(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = (customerId: string) => {
    navigate(`/customer/${customerId}`);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && customers.length === 0) {
    return (
      <div className="loading-container">
        <div>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '16px', color: '#65676b' }}>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-list-container">
      <div className="customer-list-header">
        <h1>👥 Customer Management</h1>
        <p>View and manage all your customers</p>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCustomers.length > 0 ? (
        <>
          <div className="customer-grid">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="customer-card"
                onClick={() => handleCustomerClick(customer.id)}
              >
                <div className="customer-avatar">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="customer-name">{customer.name}</div>
                <div className="customer-email">{customer.email}</div>
                {customer.company && (
                  <div className="customer-company">🏢 {customer.company}</div>
                )}
                <div className="customer-meta">
                  <span className="customer-badge">
                    📅 {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No customers found</h3>
          <p>Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}