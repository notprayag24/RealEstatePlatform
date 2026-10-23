// src/pages/Appointments.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, Clock, User, CheckCircle, XCircle, 
  Clock as ClockIcon, MapPin, Phone, Mail,
  ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error loading appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Appointment ${status}!`);
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Error updating appointment');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Appointment cancelled!');
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Error cancelling appointment');
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', label: 'Pending', icon: ClockIcon };
      case 'confirmed':
        return { bg: '#dbeafe', color: '#1e40af', label: 'Confirmed', icon: CheckCircle };
      case 'completed':
        return { bg: '#d1fae5', color: '#065f46', label: 'Completed', icon: CheckCircle };
      case 'cancelled':
        return { bg: '#fce4ec', color: '#c62828', label: 'Cancelled', icon: XCircle };
      case 'rejected':
        return { bg: '#fce4ec', color: '#c62828', label: 'Rejected', icon: XCircle };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', label: status, icon: ClockIcon };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isBuyer = user?.role === 'buyer';
  const isSellerOrAgent = user?.role === 'seller' || user?.role === 'agent';

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ color: '#8b7355' }}>Loading appointments...</div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <div className="container" style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
              <Calendar style={{ display: 'inline', marginRight: '12px', color: '#b8860b' }} />
              Appointments
            </h1>
            <p style={{ color: '#8b7355' }}>Manage your property viewings</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{
              padding: '6px 16px',
              background: '#d4af37',
              borderRadius: '20px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {appointments.filter(a => a.status === 'pending').length} Pending
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: filter === 'all' ? '2px solid #d4af37' : '1px solid #e5e7eb',
              background: filter === 'all' ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: filter === 'all' ? '#b8860b' : '#6b7280',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            All ({appointments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: filter === 'pending' ? '2px solid #d4af37' : '1px solid #e5e7eb',
              background: filter === 'pending' ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: filter === 'pending' ? '#b8860b' : '#6b7280',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Pending ({appointments.filter(a => a.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('confirmed')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: filter === 'confirmed' ? '2px solid #d4af37' : '1px solid #e5e7eb',
              background: filter === 'confirmed' ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: filter === 'confirmed' ? '#b8860b' : '#6b7280',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Confirmed ({appointments.filter(a => a.status === 'confirmed').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: filter === 'completed' ? '2px solid #d4af37' : '1px solid #e5e7eb',
              background: filter === 'completed' ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: filter === 'completed' ? '#b8860b' : '#6b7280',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Completed ({appointments.filter(a => a.status === 'completed').length})
          </button>
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Calendar size={48} style={{ color: '#d4af37', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', color: '#1a1a1a', marginBottom: '8px' }}>No appointments</h3>
            <p style={{ color: '#8b7355' }}>
              {isBuyer ? 'Request a viewing on a property you like' : 'You have no appointment requests yet'}
            </p>
            {isBuyer && (
              <Link to="/properties">
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
                  Browse Properties
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredAppointments.map((appointment) => {
              const statusBadge = getStatusBadge(appointment.status);
              const Icon = statusBadge.icon;
              const property = appointment.propertyId;
              
              return (
                <div
                  key={appointment._id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          background: statusBadge.bg,
                          color: statusBadge.color,
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Icon size={14} />
                          {statusBadge.label}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                          {formatDate(appointment.date)} at {appointment.time}
                        </span>
                      </div>
                      
                      <div style={{ marginTop: '8px' }}>
                        <Link to={`/properties/${property?._id}`} style={{ color: '#b8860b', textDecoration: 'none', fontWeight: 500 }}>
                          {property?.title || 'Property'}
                        </Link>
                        <span style={{ color: '#8b7355', fontSize: '13px', marginLeft: '8px' }}>
                          {property?.location?.city}, {property?.location?.state}
                        </span>
                      </div>
                      
                      <div style={{ marginTop: '6px', fontSize: '13px', color: '#4a4a4a' }}>
                        <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {appointment.buyerName || appointment.buyerId?.firstName} {appointment.buyerId?.lastName}
                        {' · '}
                        <Mail size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {appointment.buyerEmail || appointment.buyerId?.email}
                        {appointment.buyerPhone && (
                          <>
                            {' · '}
                            <Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />
                            {appointment.buyerPhone}
                          </>
                        )}
                      </div>
                      
                      {appointment.message && (
                        <div style={{
                          marginTop: '6px',
                          padding: '8px 14px',
                          background: '#faf8f5',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#4a4a4a'
                        }}>
                          "{appointment.message}"
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {appointment.status === 'pending' && isSellerOrAgent && (
                        <>
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                            style={{
                              padding: '6px 16px',
                              background: '#10b981',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(appointment._id, 'rejected')}
                            style={{
                              padding: '6px 16px',
                              background: '#ef4444',
                              border: 'none',
                              borderRadius: '8px',
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && isSellerOrAgent && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                          style={{
                            padding: '6px 16px',
                            background: '#3b82f6',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Mark Completed
                        </button>
                      )}
                      {appointment.status === 'pending' && isBuyer && (
                        <button
                          onClick={() => cancelAppointment(appointment._id)}
                          style={{
                            padding: '6px 16px',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;