// src/components/dashboard/SellerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, PlusCircle, Eye, TrendingUp, 
  DollarSign, Clock, ArrowUpRight, ArrowDownRight,
  Calendar, Users, MessageCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    totalViews: 0,
    inquiries: 0
  });
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Get seller's properties
      const response = await fetch('/api/properties?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        const properties = data.data || [];
        setRecentProperties(properties);
        
        // Calculate stats
        const active = properties.filter(p => p.status === 'active').length;
        const sold = properties.filter(p => p.status === 'sold' || p.status === 'rented').length;
        const views = properties.reduce((sum, p) => sum + (p.views || 0), 0);
        
        setStats({
          totalProperties: properties.length,
          activeListings: active,
          soldProperties: sold,
          totalViews: views,
          inquiries: Math.floor(Math.random() * 10) + 1
        });
      }
    } catch (error) {
      console.error('Error fetching seller data:', error);
      toast.error('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Building2, label: 'Total Properties', value: stats.totalProperties, color: 'gold' },
    { icon: Eye, label: 'Total Views', value: stats.totalViews, color: 'blue' },
    { icon: TrendingUp, label: 'Active Listings', value: stats.activeListings, color: 'green' },
    { icon: DollarSign, label: 'Sold/Rented', value: stats.soldProperties, color: 'purple' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <div className="header-actions">
          <Link to="/add-property">
            <button className="btn-primary">
              <PlusCircle size={18} />
              List New Property
            </button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-stats">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.color}`}>
                <Icon size={20} />
              </div>
              <div className="stat-number">{loading ? '...' : stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Properties */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3>Your Recent Properties</h3>
          <Link to="/properties" className="view-all">View All →</Link>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#8b7355' }}>
            Loading...
          </div>
        ) : recentProperties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Building2 size={48} style={{ color: '#d4af37', marginBottom: '12px' }} />
            <h3 style={{ color: '#1a1a1a' }}>No properties listed yet</h3>
            <p style={{ color: '#8b7355' }}>Start by listing your first property</p>
            <Link to="/add-property">
              <button style={{
                marginTop: '16px',
                padding: '10px 24px',
                background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                List Property
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#8b7355', textTransform: 'uppercase' }}>Property</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#8b7355', textTransform: 'uppercase' }}>Price</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#8b7355', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#8b7355', textTransform: 'uppercase' }}>Views</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '12px', color: '#8b7355', textTransform: 'uppercase' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map(prop => (
                  <tr key={prop._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <Link to={`/properties/${prop._id}`} style={{ color: '#1a1a1a', fontWeight: 500 }}>
                        {prop.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 600, color: '#1a1a1a' }}>
                      ${prop.price?.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        padding: '2px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        background: prop.status === 'active' ? '#d1fae5' : '#fef3c7',
                        color: prop.status === 'active' ? '#065f46' : '#92400e'
                      }}>
                        {prop.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', color: '#6b7280' }}>{prop.views || 0}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <Link to={`/properties/${prop._id}/edit`} style={{ color: '#b8860b' }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dashboard-content-grid">
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <Link to="/add-property" style={{ textDecoration: 'none' }}>
              <button className="action-btn">
                <PlusCircle />
                <span>Add Property</span>
              </button>
            </Link>
            <Link to="/properties" style={{ textDecoration: 'none' }}>
              <button className="action-btn">
                <Building2 />
                <span>My Listings</span>
              </button>
            </Link>
            <button className="action-btn">
              <Users />
              <span>Inquiries</span>
            </button>
            <button className="action-btn">
              <MessageCircle />
              <span>Messages</span>
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Tips for Sellers</h3>
          </div>
          <div style={{ padding: '8px 0' }}>
            <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '20px' }}>📸</span>
              <div>
                <div style={{ fontWeight: 500, color: '#1a1a1a' }}>High-Quality Photos</div>
                <div style={{ fontSize: '13px', color: '#8b7355' }}>Properties with professional photos sell 32% faster</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '20px' }}>💰</span>
              <div>
                <div style={{ fontWeight: 500, color: '#1a1a1a' }}>Competitive Pricing</div>
                <div style={{ fontSize: '13px', color: '#8b7355' }}>Research comparable properties in your area</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', padding: '10px 0' }}>
              <span style={{ fontSize: '20px' }}>📝</span>
              <div>
                <div style={{ fontWeight: 500, color: '#1a1a1a' }}>Detailed Description</div>
                <div style={{ fontSize: '13px', color: '#8b7355' }}>Highlight unique features and recent upgrades</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;