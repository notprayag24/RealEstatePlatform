// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Building2, Heart, Eye, 
  TrendingUp, DollarSign, Clock, 
  ChevronRight, UserPlus, Home,
  Calendar, MessageCircle, Mail,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    activeProperties: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalInquiries: 0,
    totalAppointments: 0,
    revenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch users
      const usersRes = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      
      // Fetch properties
      const propsRes = await fetch('/api/admin/properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const propsData = await propsRes.json();
      
      if (usersData.success) {
        const users = usersData.data || [];
        setRecentUsers(users.slice(0, 5));
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
        }));
      }
      
      if (propsData.success) {
        const properties = propsData.data || [];
        setRecentProperties(properties.slice(0, 5));
        const active = properties.filter(p => p.status === 'active').length;
        const views = properties.reduce((sum, p) => sum + (p.views || 0), 0);
        const favorites = properties.reduce((sum, p) => sum + (p.favorites || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalProperties: properties.length,
          activeProperties: active,
          totalViews: views,
          totalFavorites: favorites,
        }));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Error loading admin data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'gold' },
    { icon: Building2, label: 'Properties', value: stats.totalProperties, color: 'blue' },
    { icon: Eye, label: 'Total Views', value: stats.totalViews, color: 'green' },
    { icon: Heart, label: 'Favorites', value: stats.totalFavorites, color: 'purple' },
  ];

  const quickActions = [
    { icon: UserPlus, label: 'Add Admin', link: '#' },
    { icon: Home, label: 'Moderate Properties', link: '/admin/properties' },
    { icon: Users, label: 'Manage Users', link: '/admin/users' },
    { icon: Mail, label: 'View Inquiries', link: '/admin/inquiries' },
  ];

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <div className="container" style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
            <span style={{ color: '#b8860b', fontWeight: '400' }}>Admin</span> Dashboard
          </h1>
          <p style={{ color: '#8b7355' }}>Manage your platform, users, and properties</p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `rgba(212, 175, 55, 0.08)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}>
                  <Icon size={20} style={{ color: '#b8860b' }} />
                </div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a1a' }}>
                  {loading ? '...' : stat.value}
                </div>
                <div style={{ fontSize: '14px', color: '#8b7355' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '30px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginBottom: '16px' }}>
            Quick Actions
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.link} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.05)',
                    background: '#faf8f5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#d4af37';
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)';
                    e.currentTarget.style.background = '#faf8f5';
                  }}>
                    <Icon size={18} style={{ color: '#b8860b' }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                      {action.label}
                    </span>
                    <ChevronRight size={16} style={{ marginLeft: 'auto', color: '#8b7355' }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Users & Properties */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          {/* Recent Users */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                <Users size={18} style={{ display: 'inline', marginRight: '8px', color: '#b8860b' }} />
                Recent Users
              </h3>
              <Link to="/admin/users" style={{ color: '#b8860b', fontSize: '13px', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8b7355' }}>Loading...</div>
            ) : recentUsers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8b7355' }}>No users yet</div>
            ) : (
              recentUsers.map(u => (
                <div key={u._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.04)'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#1a1a1a' }}>
                      {u.firstName} {u.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b7355' }}>{u.email}</div>
                  </div>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    background: 'rgba(212, 175, 55, 0.08)',
                    color: '#b8860b'
                  }}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Recent Properties */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                <Building2 size={18} style={{ display: 'inline', marginRight: '8px', color: '#b8860b' }} />
                Recent Properties
              </h3>
              <Link to="/admin/properties" style={{ color: '#b8860b', fontSize: '13px', textDecoration: 'none' }}>
                View All →
              </Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8b7355' }}>Loading...</div>
            ) : recentProperties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#8b7355' }}>No properties yet</div>
            ) : (
              recentProperties.map(p => (
                <div key={p._id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 0',
                  borderBottom: '1px solid rgba(0,0,0,0.04)'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: '#e5e7eb',
                    flexShrink: 0
                  }}>
                    <img 
                      src={p.images?.[0]?.url || 'https://via.placeholder.com/50x50/cccccc/969696?text=No'} 
                      alt={p.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#1a1a1a' }}>
                      {p.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b7355' }}>
                      ${p.price?.toLocaleString()} · {p.location?.city}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    background: p.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                    color: p.status === 'active' ? '#10b981' : '#f59e0b'
                  }}>
                    {p.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;