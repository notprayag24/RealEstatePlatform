// src/pages/ProfilePage.jsx - Premium Version with Real Data
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Camera, 
  Save, Loader2, Lock, Eye, EyeOff,
  Calendar, Building2, Heart,
  Shield, Bell, Settings,
  LogOut, Upload, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState(null);
  const [stats, setStats] = useState({
    properties: 0,
    favorites: 0,
    appointments: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      language: 'en',
      currency: 'USD'
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Expose refreshStats globally so other components can trigger refresh
  useEffect(() => {
    window.refreshStats = fetchStats;
    return () => {
      delete window.refreshStats;
    };
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        bio: user.profile?.bio || '',
        address: {
          street: user.profile?.address?.street || '',
          city: user.profile?.address?.city || '',
          state: user.profile?.address?.state || '',
          country: user.profile?.address?.country || '',
          zipCode: user.profile?.address?.zipCode || ''
        },
        preferences: {
          notifications: {
            email: user.profile?.preferences?.notifications?.email !== undefined ? user.profile.preferences.notifications.email : true,
            sms: user.profile?.preferences?.notifications?.sms || false,
            push: user.profile?.preferences?.notifications?.push !== undefined ? user.profile.preferences.notifications.push : true
          },
          language: user.profile?.preferences?.language || 'en',
          currency: user.profile?.preferences?.currency || 'USD'
        }
      });
      fetchStats();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const parts = name.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, child, grandchild] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent]?.[child],
              [grandchild]: type === 'checkbox' ? checked : value
            }
          }
        }));
      }
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Profile updated successfully! 🎉');
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Refresh stats
        await fetchStats();
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSaveLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Password changed successfully! 🔒');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error changing password');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const statsConfig = [
    { icon: Building2, label: 'Properties', value: stats.properties || 0, color: '#d4af37' },
    { icon: Heart, label: 'Favorites', value: stats.favorites || 0, color: '#ef4444' },
    { icon: Calendar, label: 'Appointments', value: stats.appointments || 0, color: '#3b82f6' },
  ];

  const userInitials = user?.firstName?.[0] + user?.lastName?.[0] || 'U';

  if (!user) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ color: '#8b7355' }}>Please login to view profile</div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: 'linear-gradient(145deg, #f5efe6 0%, #e8dccc 50%, #d4c5a9 100%)' }}>
      <div className="container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '300', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
            My <span style={{ color: '#b8860b', fontWeight: '400' }}>Profile</span>
          </h1>
          <p style={{ color: '#8b7355' }}>Manage your account settings and preferences</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '30px' }}>
          {/* Left Column - User Card */}
          <div style={{
            background: 'rgba(255,248,240,0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '32px 24px',
            border: '1px solid rgba(212,175,55,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: '100px',
            height: 'fit-content'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  cursor: 'pointer'
                }}
                onClick={handleProfileImageClick}
              >
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: profileImage ? `url(${profileImage})` : 'linear-gradient(145deg, #d4af37, #b8860b)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '36px',
                  fontWeight: 600,
                  color: 'white',
                  boxShadow: '0 8px 30px -4px rgba(184,134,11,0.3)',
                  margin: '0 auto',
                  border: '3px solid rgba(255,255,255,0.8)'
                }}>
                  {!profileImage && userInitials}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                  border: '2px solid white',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                  <Camera size={16} />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  style={{ display: 'none' }}
                />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a', marginTop: '12px' }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ 
                color: '#8b7355', 
                fontSize: '13px',
                display: 'inline-block',
                padding: '2px 12px',
                background: 'rgba(212,175,55,0.1)',
                borderRadius: '20px',
                border: '1px solid rgba(212,175,55,0.15)'
              }}>
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </p>
              <p style={{ color: '#8b7355', fontSize: '13px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Mail size={14} /> {user.email}
              </p>
            </div>

            <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(212,175,55,0.1)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {statsConfig.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px',
                        background: `rgba(212,175,55,0.08)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 6px'
                      }}>
                        <Icon size={18} style={{ color: stat.color }} />
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a' }}>
                        {statsLoading ? '...' : stat.value}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8b7355' }}>{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: '12px',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              }}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

          {/* Right Column - Main Content */}
          <div>
            {/* Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              background: 'rgba(255,248,240,0.85)',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              padding: '6px',
              border: '1px solid rgba(212,175,55,0.1)'
            }}>
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'password', icon: Lock, label: 'Security' },
                { id: 'preferences', icon: Settings, label: 'Preferences' },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isActive ? 'linear-gradient(145deg, #d4af37, #b8860b)' : 'transparent',
                      color: isActive ? 'white' : '#6b7280',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      fontSize: '14px'
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Profile Form */}
            {activeTab === 'profile' && (
              <div style={{
                background: 'rgba(255,248,240,0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(212,175,55,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <form onSubmit={handleProfileSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(212,175,55,0.15)',
                          borderRadius: '12px',
                          fontSize: '14px',
                          background: 'rgba(255,255,255,0.5)',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          color: '#1a1a1a'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(212,175,55,0.15)',
                          borderRadius: '12px',
                          fontSize: '14px',
                          background: 'rgba(255,255,255,0.5)',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          color: '#1a1a1a'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(212,175,55,0.15)',
                          borderRadius: '12px',
                          fontSize: '14px',
                          background: 'rgba(255,255,255,0.5)',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          color: '#1a1a1a'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(212,175,55,0.15)',
                          borderRadius: '12px',
                          fontSize: '14px',
                          background: 'rgba(255,255,255,0.5)',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          color: '#1a1a1a'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows="3"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(212,175,55,0.15)',
                          borderRadius: '12px',
                          fontSize: '14px',
                          background: 'rgba(255,255,255,0.5)',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                          color: '#1a1a1a'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                      />
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(212,175,55,0.1)'
                  }}>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      style={{
                        padding: '14px 40px',
                        background: saveLoading ? '#9ca3af' : 'linear-gradient(145deg, #d4af37, #b8860b)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: saveLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease',
                        boxShadow: saveLoading ? 'none' : '0 4px 15px -4px rgba(184,134,11,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!saveLoading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px -6px rgba(184,134,11,0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!saveLoading) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(184,134,11,0.3)';
                        }
                      }}
                    >
                      {saveLoading ? <Loader2 size={18} className="spinner" /> : <Save size={18} />}
                      {saveLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Form */}
            {activeTab === 'password' && (
              <div style={{
                background: 'rgba(255,248,240,0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(212,175,55,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <form onSubmit={handlePasswordSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', maxWidth: '500px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Current Password <span style={{ color: '#b8860b' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid rgba(212,175,55,0.15)',
                            borderRadius: '12px',
                            fontSize: '14px',
                            background: 'rgba(255,255,255,0.5)',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            color: '#1a1a1a'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#8b7355',
                            cursor: 'pointer'
                          }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        New Password <span style={{ color: '#b8860b' }}>*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password (min 6 characters)"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid rgba(212,175,55,0.15)',
                          borderRadius: '12px',
                          fontSize: '14px',
                          background: 'rgba(255,255,255,0.5)',
                          outline: 'none',
                          transition: 'all 0.3s ease',
                          color: '#1a1a1a'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                        Confirm New Password <span style={{ color: '#b8860b' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: '1px solid rgba(212,175,55,0.15)',
                            borderRadius: '12px',
                            fontSize: '14px',
                            background: 'rgba(255,255,255,0.5)',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            color: '#1a1a1a'
                          }}
                          onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                          onBlur={(e) => e.target.style.borderColor = 'rgba(212,175,55,0.15)'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: '#8b7355',
                            cursor: 'pointer'
                          }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    marginTop: '24px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(212,175,55,0.1)'
                  }}>
                    <button
                      type="submit"
                      disabled={saveLoading}
                      style={{
                        padding: '14px 40px',
                        background: saveLoading ? '#9ca3af' : 'linear-gradient(145deg, #d4af37, #b8860b)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: saveLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.3s ease',
                        boxShadow: saveLoading ? 'none' : '0 4px 15px -4px rgba(184,134,11,0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (!saveLoading) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px -6px rgba(184,134,11,0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!saveLoading) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(184,134,11,0.3)';
                        }
                      }}
                    >
                      {saveLoading ? <Loader2 size={18} className="spinner" /> : <Lock size={18} />}
                      {saveLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div style={{
                background: 'rgba(255,248,240,0.85)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '32px',
                border: '1px solid rgba(212,175,55,0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', marginBottom: '24px' }}>
                  <Bell size={20} style={{ display: 'inline', marginRight: '10px', color: '#b8860b' }} />
                  Notification Preferences
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#1a1a1a' }}>Email Notifications</div>
                      <div style={{ fontSize: '12px', color: '#8b7355' }}>Receive updates via email</div>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '28px',
                      borderRadius: '14px',
                      background: formData.preferences.notifications.email ? '#d4af37' : '#e5e7eb',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            email: !prev.preferences.notifications.email
                          }
                        }
                      }));
                    }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: formData.preferences.notifications.email ? '23px' : '3px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} />
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#1a1a1a' }}>SMS Notifications</div>
                      <div style={{ fontSize: '12px', color: '#8b7355' }}>Receive updates via SMS</div>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '28px',
                      borderRadius: '14px',
                      background: formData.preferences.notifications.sms ? '#d4af37' : '#e5e7eb',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            sms: !prev.preferences.notifications.sms
                          }
                        }
                      }));
                    }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: formData.preferences.notifications.sms ? '23px' : '3px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} />
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#1a1a1a' }}>Push Notifications</div>
                      <div style={{ fontSize: '12px', color: '#8b7355' }}>Receive push notifications in app</div>
                    </div>
                    <div style={{
                      width: '48px',
                      height: '28px',
                      borderRadius: '14px',
                      background: formData.preferences.notifications.push ? '#d4af37' : '#e5e7eb',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          notifications: {
                            ...prev.preferences.notifications,
                            push: !prev.preferences.notifications.push
                          }
                        }
                      }));
                    }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: formData.preferences.notifications.push ? '23px' : '3px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }} />
                    </div>
                  </label>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  marginTop: '24px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(212,175,55,0.1)'
                }}>
                  <button
                    onClick={handleProfileSubmit}
                    style={{
                      padding: '14px 40px',
                      background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '15px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px -4px rgba(184,134,11,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px -6px rgba(184,134,11,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(184,134,11,0.3)';
                    }}
                  >
                    <Save size={18} />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;