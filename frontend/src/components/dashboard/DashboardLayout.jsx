// src/components/dashboard/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Building2, Heart, MessageCircle, 
  Calendar, Settings, LogOut, Bell, Search, 
  PlusCircle, Users, ChevronRight, Menu, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.dashboard-sidebar') && !e.target.closest('.dashboard-toggle-btn')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/properties', icon: Building2, label: 'Properties' },
    { path: '/favorites', icon: Heart, label: 'Favorites' },
    { path: '/add-property', icon: PlusCircle, label: 'Add Property' },
    { path: '/dashboard/messages', icon: MessageCircle, label: 'Messages' },
    { path: '/dashboard/appointments', icon: Calendar, label: 'Appointments' },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  const userInitials = user?.firstName?.[0] + user?.lastName?.[0] || 'U';

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f6f3' }}>
      {/* Overlay */}
      <div 
        className={`dashboard-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Toggle Button */}
      <button 
        className={`dashboard-toggle-btn ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle dashboard"
      >
        {isOpen ? <ChevronRight size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="user-section">
          <div className="user-avatar">{userInitials}</div>
          <div className="user-name">{user?.firstName} {user?.lastName}</div>
          <div className="user-role">{user?.role || 'Member'}</div>
        </div>

        <ul className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link to={item.path} className={isActive ? 'active' : ''}>
                  <Icon />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <button onClick={handleLogout} className="sidebar-logout">
              <LogOut />
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className={`dashboard-main ${isOpen ? 'shifted' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;