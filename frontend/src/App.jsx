import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Mail } from 'lucide-react';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PropertyListing from './pages/PropertyListing';
import PropertyDetails from './pages/PropertyDetails';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import MyProperties from './pages/MyProperties';
import Inquiries from './pages/Inquiries';
import Appointments from './pages/Appointments';
import MessagesPage from './pages/MessagesPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import GlobalDashboardToggle from './components/dashboard/GlobalDashboardToggle';
import AuthLayout from './layouts/AuthLayout';
import { useAuth } from './context/AuthContext';
import './css/global.css';
import './css/components/navbar.css';

// Navbar Component
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="logo">
          <div className="logo-icon">RA</div>
          RealEstate <span className="logo-highlight">AI</span>
        </Link>

        <ul className={`nav-links ${isMobileOpen ? 'open' : ''}`}>
          <li>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/properties" className={`nav-link ${isActive('/properties') ? 'active' : ''}`}>
              Properties
            </Link>
          </li>
          {user ? (
            <>
              {/* Admin Dashboard - Admin only */}
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    Admin
                  </Link>
                </li>
              )}
              {/* My Properties - Sellers, Agents, Admins */}
              {(user.role === 'seller' || user.role === 'agent' || user.role === 'admin') && (
                <li>
                  <Link to="/my-properties" className={`nav-link ${isActive('/my-properties') ? 'active' : ''}`}>
                    My Properties
                  </Link>
                </li>
              )}
              {/* Add Property - Sellers, Agents, Admins */}
              {(user.role === 'seller' || user.role === 'agent' || user.role === 'admin') && (
                <li>
                  <Link to="/add-property" className={`nav-link ${isActive('/add-property') ? 'active' : ''}`}>
                    Add Property
                  </Link>
                </li>
              )}
              {/* Inquiries - Sellers, Agents, Admins */}
              {(user.role === 'seller' || user.role === 'agent' || user.role === 'admin') && (
                <li>
                  <Link to="/inquiries" className={`nav-link ${isActive('/inquiries') ? 'active' : ''}`}>
                    <Mail size={16} style={{ display: 'inline', marginRight: '4px' }} />
                    Inquiries
                  </Link>
                </li>
              )}
              <li>
                <Link to="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}>
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`}>
                  Messages
                </Link>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                Login
              </Link>
            </li>
          )}
          <li>
            {user ? (
              (user.role === 'seller' || user.role === 'agent' || user.role === 'admin') ? (
                <Link to="/add-property" className="btn-get-started">
                  List Property
                </Link>
              ) : (
                <Link to="/dashboard" className="btn-get-started">
                  Dashboard
                </Link>
              )
            ) : (
              <Link to="/register" className="btn-get-started">
                Get Started
              </Link>
            )}
          </li>
        </ul>

        <button 
          className="mobile-toggle" 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={isMobileOpen ? 'open' : ''}></span>
          <span className={isMobileOpen ? 'open' : ''}></span>
          <span className={isMobileOpen ? 'open' : ''}></span>
        </button>
      </div>
    </nav>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#8b7355'
      }}>
        Loading...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Router>
      {/* Global Dashboard Toggle - Only visible when logged in */}
      {user && <GlobalDashboardToggle />}
      
      <Routes>
        {/* Home page with navbar */}
        <Route path="/" element={
          <>
            <Navbar />
            <HomePage />
          </>
        } />
        
        {/* Properties page */}
        <Route path="/properties" element={
          <>
            <Navbar />
            <PropertyListing />
          </>
        } />

        {/* Property Details page */}
        <Route path="/properties/:id" element={
          <>
            <Navbar />
            <PropertyDetails />
          </>
        } />

        {/* Edit Property - Protected */}
        <Route path="/properties/:id/edit" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <EditProperty />
            </>
          </ProtectedRoute>
        } />

        {/* Favorites page */}
        <Route path="/favorites" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <FavoritesPage />
            </>
          </ProtectedRoute>
        } />

        {/* My Properties - For Sellers & Agents */}
        <Route path="/my-properties" element={
          <ProtectedRoute>
            <>
              <Navbar />
              {(user?.role === 'seller' || user?.role === 'agent' || user?.role === 'admin') ? (
                <MyProperties />
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </>
          </ProtectedRoute>
        } />

        {/* Inquiries - For Sellers & Agents */}
        <Route path="/inquiries" element={
          <ProtectedRoute>
            <>
              <Navbar />
              {(user?.role === 'seller' || user?.role === 'agent' || user?.role === 'admin') ? (
                <Inquiries />
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </>
          </ProtectedRoute>
        } />

        {/* Appointments - For all users */}
        <Route path="/dashboard/appointments" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <Appointments />
            </>
          </ProtectedRoute>
        } />

        {/* Messages - For all users */}
        <Route path="/messages" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <MessagesPage />
            </>
          </ProtectedRoute>
        } />

        {/* Admin Dashboard - Admin only */}
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <>
              <Navbar />
              {user?.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </>
          </ProtectedRoute>
        } />

        {/* Add Property - Protected (Only Sellers, Agents, Admins) */}
        <Route path="/add-property" element={
          <ProtectedRoute>
            <>
              <Navbar />
              {(user?.role === 'seller' || user?.role === 'agent' || user?.role === 'admin') ? (
                <AddProperty />
              ) : (
                <Navigate to="/dashboard" replace />
              )}
            </>
          </ProtectedRoute>
        } />
        
        {/* Profile/Settings page */}
        <Route path="/dashboard/settings" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <ProfilePage />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/test" element={<TestPage />} />

        {/* Auth routes - WITHOUT navbar */}
        <Route path="/login" element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        } />
        <Route path="/register" element={
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        } />

        {/* Dashboard - Protected Route */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <DashboardPage />
            </>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </Router>
  );
}

export default App;