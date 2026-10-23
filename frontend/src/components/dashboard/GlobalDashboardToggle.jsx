// src/components/dashboard/GlobalDashboardToggle.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Building2, Heart, MessageCircle, 
  Calendar, Settings, LogOut, Bell, Search, 
  PlusCircle, Users, ChevronRight, X,
  LayoutDashboard, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const GlobalDashboardToggle = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return null;
  }

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.global-dashboard-sidebar') && !e.target.closest('.global-dashboard-toggle')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/');
  };

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: Home, label: 'Overview' },
      { path: '/properties', icon: Building2, label: 'Properties' },
      { path: '/favorites', icon: Heart, label: 'Favorites' },
      { path: '/messages', icon: MessageCircle, label: 'Messages' },
    ];
    
    if (user?.role === 'seller' || user?.role === 'agent' || user?.role === 'admin') {
      baseItems.push({ path: '/my-properties', icon: Building2, label: 'My Properties' });
      baseItems.push({ path: '/add-property', icon: PlusCircle, label: 'Add Property' });
      baseItems.push({ path: '/inquiries', icon: Mail, label: 'Inquiries' });
    }
    
    const moreItems = [
      { path: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
      { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ];
    
    return [...baseItems, ...moreItems];
  };

  const navItems = getNavItems();
  const userInitials = user?.firstName?.[0] + user?.lastName?.[0] || 'U';

  return (
    <>
      <button 
        className="global-dashboard-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle dashboard"
        style={{
          position: 'fixed',
          top: '80px',
          left: '0',
          zIndex: 999,
          width: '44px',
          height: '44px',
          background: 'linear-gradient(145deg, #d4af37, #b8860b)',
          border: 'none',
          borderRadius: '0 14px 14px 0',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          boxShadow: '4px 4px 25px rgba(0, 0, 0, 0.15)',
          left: isOpen ? '300px' : '0',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.width = '50px';
          e.currentTarget.style.background = 'linear-gradient(145deg, #c9a030, #a0760a)';
          e.currentTarget.style.boxShadow = '4px 4px 35px rgba(184, 134, 11, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.width = '44px';
          e.currentTarget.style.background = 'linear-gradient(145deg, #d4af37, #b8860b)';
          e.currentTarget.style.boxShadow = '4px 4px 25px rgba(0, 0, 0, 0.15)';
        }}
      >
        {isOpen ? (
          <ChevronRight size={22} style={{ transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)' }} />
        ) : (
          <LayoutDashboard size={22} style={{ transition: 'transform 0.3s ease' }} />
        )}
      </button>

      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 997,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity 0.4s ease',
        }}
        onClick={() => setIsOpen(false)}
      />

      <div 
        className="global-dashboard-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '300px',
          height: '100vh',
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f6f3 100%)',
          boxShadow: '4px 0 50px rgba(0, 0, 0, 0.1)',
          zIndex: 998,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          overflowY: 'auto',
          paddingTop: '80px',
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '90px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
            e.currentTarget.style.color = '#1a1a1a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <X size={22} />
        </button>

        <div style={{ padding: '0 20px 20px 24px', borderBottom: '1px solid rgba(0, 0, 0, 0.05)', marginBottom: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #d4af37, #b8860b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 600,
            color: 'white',
            marginBottom: '12px',
            boxShadow: '0 4px 15px -4px rgba(184, 134, 11, 0.3)',
            transition: 'transform 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {userInitials}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', letterSpacing: '-0.01em' }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: '11px', color: '#8b7355', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500, marginTop: '2px' }}>
            {user?.role || 'Member'}
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: '0 12px', margin: 0 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} style={{ marginBottom: '2px' }}>
                <Link 
                  to={item.path} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    color: isActive ? '#b8860b' : '#6b7280',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    background: isActive ? 'rgba(212, 175, 55, 0.10)' : 'transparent',
                    transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.06)';
                      e.currentTarget.style.color = '#1a1a1a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6b7280';
                    }
                  }}
                >
                  <Icon size={20} style={{ 
                    color: isActive ? '#b8860b' : '#9ca3af',
                    flexShrink: 0,
                    transition: 'all 0.3s ease'
                  }} />
                  {item.label}
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '24px',
                      background: 'linear-gradient(180deg, #d4af37, #b8860b)',
                      borderRadius: '0 4px 4px 0',
                    }} />
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button 
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '12px',
                color: '#ef4444',
                background: 'none',
                border: 'none',
                width: '100%',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '8px',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
};

export default GlobalDashboardToggle;