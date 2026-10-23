// src/pages/dashboard/DashboardPage.jsx - Premium Buyer Dashboard
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, Heart, Calendar, Search, 
  Bell, PlusCircle, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Clock,
  Home, Sparkles, Star, Shield,
  ChevronRight, Compass, Award, Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../css/pages/dashboard.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    favorites: 0,
    appointments: 0,
    views: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats({
          properties: data.data.properties || 0,
          favorites: data.data.favorites || 0,
          appointments: data.data.appointments || 0,
          views: Math.floor(Math.random() * 100) + 20
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { 
      icon: Home, 
      label: 'Properties Viewed',
      value: stats.views,
      color: 'gold',
      change: '+12%',
      changeType: 'up'
    },
    { 
      icon: Heart, 
      label: 'Favorites',
      value: stats.favorites,
      color: 'blue',
      change: '+5%',
      changeType: 'up'
    },
    { 
      icon: Calendar, 
      label: 'Appointments',
      value: stats.appointments,
      color: 'green',
      change: '+8%',
      changeType: 'up'
    },
    { 
      icon: TrendingUp, 
      label: 'Market Insights',
      value: '↑ 8%',
      color: 'purple',
      change: 'This quarter',
      changeType: 'up'
    },
  ];

  const quickActions = [
    { 
      icon: Search, 
      label: 'Search Properties',
      desc: 'Find your dream home',
      link: '/properties',
      color: '#d4af37'
    },
    { 
      icon: Heart, 
      label: 'Favorites',
      desc: 'View saved properties',
      link: '/favorites',
      color: '#ef4444'
    },
    { 
      icon: Bell, 
      label: 'Alerts',
      desc: 'Property notifications',
      link: '#',
      color: '#3b82f6'
    },
    { 
      icon: Compass, 
      label: 'Explore Areas',
      desc: 'Discover neighborhoods',
      link: '#',
      color: '#8b5cf6'
    },
  ];

  const recentActivities = [
    { icon: 'gold', title: 'New luxury villa listed in Beverly Hills', time: '2 hours ago' },
    { icon: 'blue', title: 'You saved a property to favorites', time: '5 hours ago' },
    { icon: 'green', title: 'Appointment confirmed for Saturday', time: '1 day ago' },
    { icon: 'gold', title: 'Price reduced on your saved property', time: '2 days ago' },
  ];

  const tips = [
    { icon: '💡', title: 'Market Trends', desc: 'Homes in your area are up 8% this quarter' },
    { icon: '🏠', title: 'New Listings', desc: '5 new properties matched your search criteria' },
    { icon: '📈', title: 'Buyer Tips', desc: 'Get pre-approved before house hunting' },
  ];

  return (
    <div className="dashboard-container" style={{ paddingTop: '30px' }}>
      {/* Premium Header */}
      <div className="dashboard-header-premium" style={{ marginTop: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="greeting">
              Welcome Back, <span>{user?.firstName}</span>
            </div>
            <div className="subtitle">Find your dream property with AI-powered recommendations</div>
          </div>
          <div className="header-actions">
            <button className="btn-outline-premium">
              <Bell size={18} />
              Notifications
            </button>
            <Link to="/properties">
              <button className="btn-premium">
                <Search size={18} />
                Search Properties
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Premium Stats */}
      <div className="dashboard-stats-premium">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card-premium" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`stat-icon-premium ${stat.color}`}>
                <Icon size={22} />
              </div>
              <div className="stat-number-premium">
                {loading ? '...' : stat.value}
              </div>
              <div className="stat-label-premium">{stat.label}</div>
              {stat.change && (
                <div className={`stat-change-premium ${stat.changeType}`}>
                  {stat.changeType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid-premium">
        {/* Quick Actions */}
        <div className="card-premium">
          <div className="card-header-premium">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions-premium">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              if (action.link && action.link !== '#') {
                return (
                  <Link to={action.link} key={index} style={{ textDecoration: 'none' }}>
                    <div className="action-btn-premium">
                      <Icon />
                      <span>{action.label}</span>
                      <div className="action-desc">{action.desc}</div>
                    </div>
                  </Link>
                );
              }
              return (
                <div key={index} className="action-btn-premium">
                  <Icon />
                  <span>{action.label}</span>
                  <div className="action-desc">{action.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="card-premium">
          <div className="card-header-premium">
            <h3>💡 Insights</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tips.map((tip, index) => (
              <div key={index} style={{
                padding: '16px',
                borderRadius: '14px',
                background: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(0,0,0,0.03)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.8)';
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.03)';
              }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{tip.icon}</div>
                <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>{tip.title}</div>
                <div style={{ fontSize: '13px', color: '#8b7355' }}>{tip.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity - Full Width */}
        <div className="card-premium" style={{ gridColumn: '1 / -1' }}>
          <div className="card-header-premium">
            <h3>Recent Activity</h3>
            <span className="view-all">View All <ChevronRight size={16} style={{ display: 'inline' }} /></span>
          </div>
          {recentActivities.map((activity, index) => {
            const iconColors = {
              gold: 'rgba(212,175,55,0.1)',
              blue: 'rgba(59,130,246,0.1)',
              green: 'rgba(16,185,129,0.1)'
            };
            const iconTextColors = {
              gold: '#b8860b',
              blue: '#3b82f6',
              green: '#10b981'
            };
            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 0',
                borderBottom: index < recentActivities.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: iconColors[activity.icon] || iconColors.gold,
                  color: iconTextColors[activity.icon] || iconTextColors.gold,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Clock size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>{activity.title}</div>
                  <div style={{ fontSize: '12px', color: '#8b7355' }}>{activity.time}</div>
                </div>
                <div style={{ fontSize: '20px', color: '#d4af37' }}>✦</div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.1); }
          66% { transform: translate(-10px, 10px) scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;