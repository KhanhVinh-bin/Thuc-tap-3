'use client';
import { useState } from 'react';
import { getAdminOrders, getAdminOrdersSummary } from '../../lib/api';

export default function AdminOrdersTestPage() {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    studentName: '',
    courseTitle: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: ''
  });

  const testSummaryAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams = {};
      if (filters.dateFrom) filterParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) filterParams.dateTo = filters.dateTo;
      
      const data = await getAdminOrdersSummary(filterParams);
      setSummary(data);
      console.log('Summary API Response:', data);
    } catch (err) {
      setError(`Summary API Error: ${err.message}`);
      console.error('Summary API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testOrdersAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterParams = {};
      if (filters.studentName.trim()) filterParams.studentName = filters.studentName.trim();
      if (filters.courseTitle.trim()) filterParams.courseTitle = filters.courseTitle.trim();
      if (filters.paymentStatus) filterParams.paymentStatus = filters.paymentStatus;
      if (filters.dateFrom) filterParams.dateFrom = filters.dateFrom;
      if (filters.dateTo) filterParams.dateTo = filters.dateTo;
      
      const data = await getAdminOrders(filterParams);
      setOrders(data);
      console.log('Orders API Response:', data);
    } catch (err) {
      setError(`Orders API Error: ${err.message}`);
      console.error('Orders API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Admin Orders API Test</h1>
      
      {/* Filters */}
      <div style={{ 
        background: '#f9fafb', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <h3>Test Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <input
            type="text"
            name="studentName"
            placeholder="Student Name"
            value={filters.studentName}
            onChange={handleFilterChange}
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <input
            type="text"
            name="courseTitle"
            placeholder="Course Title"
            value={filters.courseTitle}
            onChange={handleFilterChange}
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <select
            name="paymentStatus"
            value={filters.paymentStatus}
            onChange={handleFilterChange}
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          >
            <option value="">All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            style={{ padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Test Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <button 
          onClick={testSummaryAPI}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Testing...' : 'Test Summary API'}
        </button>
        
        <button 
          onClick={testOrdersAPI}
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Testing...' : 'Test Orders API'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fee2e2',
          color: '#991b1b',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #fecaca'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Summary Results */}
      {summary && (
        <div style={{ marginBottom: '30px' }}>
          <h3>Summary API Results:</h3>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <pre style={{ margin: 0, fontSize: '14px' }}>
              {JSON.stringify(summary, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Orders Results */}
      {orders && (
        <div>
          <h3>Orders API Results ({Array.isArray(orders) ? orders.length : 0} orders):</h3>
          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            maxHeight: '500px',
            overflow: 'auto'
          }}>
            <pre style={{ margin: 0, fontSize: '12px' }}>
              {JSON.stringify(orders, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* API Endpoints Info */}
      <div style={{ 
        marginTop: '30px', 
        padding: '16px', 
        background: '#f3f4f6', 
        borderRadius: '8px',
        border: '1px solid #d1d5db'
      }}>
        <h4>API Endpoints Being Tested:</h4>
        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
          <li><code>GET /api/admin/orders/summary</code> - Get orders summary statistics</li>
          <li><code>GET /api/admin/orders</code> - Get filtered orders list</li>
        </ul>
        <p style={{ margin: '8px 0', fontSize: '14px', color: '#6b7280' }}>
          Make sure your backend server is running on <strong>https://localhost:7166</strong> and you have admin authentication token.
        </p>
      </div>
    </div>
  );
}