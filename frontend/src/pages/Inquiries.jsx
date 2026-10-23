// src/pages/Inquiries.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, MessageSquare, Eye, Clock, CheckCircle, 
  Reply, Archive, Trash2, User, Phone, MapPin,
  ChevronLeft, ChevronRight, Search, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Inquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, read, replied

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/inquiries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setInquiries(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast.error('Error loading inquiries');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (inquiryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'read' })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Marked as read');
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Error updating inquiry');
    }
  };

  const markAsReplied = async (inquiryId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'replied' })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Marked as replied');
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error marking as replied:', error);
      toast.error('Error updating inquiry');
    }
  };

  const filteredInquiries = inquiries.filter(inq => {
    if (filter === 'all') return true;
    return inq.status === filter;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e', label: 'Pending' };
      case 'read':
        return { bg: '#dbeafe', color: '#1e40af', label: 'Read' };
      case 'replied':
        return { bg: '#d1fae5', color: '#065f46', label: 'Replied' };
      case 'archived':
        return { bg: '#f3f4f6', color: '#6b7280', label: 'Archived' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', label: status };
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ color: '#8b7355' }}>Loading inquiries...</div>
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
              <Mail style={{ display: 'inline', marginRight: '12px', color: '#b8860b' }} />
              Inquiries
            </h1>
            <p style={{ color: '#8b7355' }}>Manage messages from potential buyers</p>
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
              {inquiries.filter(i => i.status === 'pending').length} Pending
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
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            All ({inquiries.length})
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
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Pending ({inquiries.filter(i => i.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('read')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: filter === 'read' ? '2px solid #d4af37' : '1px solid #e5e7eb',
              background: filter === 'read' ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: filter === 'read' ? '#b8860b' : '#6b7280',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Read ({inquiries.filter(i => i.status === 'read').length})
          </button>
          <button
            onClick={() => setFilter('replied')}
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              border: filter === 'replied' ? '2px solid #d4af37' : '1px solid #e5e7eb',
              background: filter === 'replied' ? 'rgba(212,175,55,0.08)' : 'transparent',
              color: filter === 'replied' ? '#b8860b' : '#6b7280',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Replied ({inquiries.filter(i => i.status === 'replied').length})
          </button>
        </div>

        {/* Inquiries List */}
        {filteredInquiries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Mail size={48} style={{ color: '#d4af37', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', color: '#1a1a1a', marginBottom: '8px' }}>No inquiries yet</h3>
            <p style={{ color: '#8b7355' }}>When buyers contact you, their messages will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredInquiries.map((inquiry) => {
              const statusBadge = getStatusBadge(inquiry.status);
              const isSelected = selectedInquiry?._id === inquiry._id;
              
              return (
                <div
                  key={inquiry._id}
                  style={{
                    background: isSelected ? 'rgba(212,175,55,0.05)' : 'white',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: isSelected ? '1px solid #d4af37' : '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedInquiry(isSelected ? null : inquiry)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '14px'
                        }}>
                          {inquiry.senderId?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a1a1a' }}>
                            {inquiry.senderId?.firstName} {inquiry.senderId?.lastName}
                          </div>
                          <div style={{ fontSize: '13px', color: '#8b7355' }}>
                            {inquiry.senderId?.email}
                          </div>
                        </div>
                        <span style={{
                          padding: '2px 12px',
                          borderRadius: '20px',
                          background: statusBadge.bg,
                          color: statusBadge.color,
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          {statusBadge.label}
                        </span>
                        {inquiry.phone && (
                          <span style={{ fontSize: '13px', color: '#8b7355', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={14} /> {inquiry.phone}
                          </span>
                        )}
                      </div>
                      
                      <div style={{ marginTop: '8px', fontSize: '14px', color: '#4a4a4a' }}>
                        <Link to={`/properties/${inquiry.propertyId?._id}`} style={{ color: '#b8860b', textDecoration: 'none' }}>
                          {inquiry.propertyId?.title || 'Property'}
                        </Link>
                        {' '}· {inquiry.propertyId?.location?.city}, {inquiry.propertyId?.location?.state}
                      </div>
                      
                      <div style={{
                        marginTop: '6px',
                        padding: '10px 14px',
                        background: '#faf8f5',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#4a4a4a',
                        maxHeight: isSelected ? 'none' : '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: isSelected ? 'none' : 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {inquiry.message}
                      </div>
                      
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#8b7355', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>{new Date(inquiry.createdAt).toLocaleDateString()} at {new Date(inquiry.createdAt).toLocaleTimeString()}</span>
                        {inquiry.isRead && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} style={{ color: '#10b981' }} />
                            Read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {isSelected && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '16px',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap'
                    }}>
                      {inquiry.status === 'pending' && (
                        <button
                          onClick={() => markAsRead(inquiry._id)}
                          style={{
                            padding: '8px 20px',
                            background: 'rgba(59,130,246,0.08)',
                            border: '1px solid rgba(59,130,246,0.15)',
                            borderRadius: '8px',
                            color: '#3b82f6',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
                        >
                          <Eye size={16} />
                          Mark as Read
                        </button>
                      )}
                      {inquiry.status !== 'replied' && (
                        <button
                          onClick={() => markAsReplied(inquiry._id)}
                          style={{
                            padding: '8px 20px',
                            background: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.15)',
                            borderRadius: '8px',
                            color: '#10b981',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                        >
                          <Reply size={16} />
                          Mark as Replied
                        </button>
                      )}
                      <button
                        onClick={() => {
                          // Copy email to clipboard
                          navigator.clipboard.writeText(inquiry.senderId?.email || '');
                          toast.success('Email copied to clipboard');
                        }}
                        style={{
                          padding: '8px 20px',
                          background: 'rgba(212,175,55,0.08)',
                          border: '1px solid rgba(212,175,55,0.15)',
                          borderRadius: '8px',
                          color: '#b8860b',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}
                      >
                        <Mail size={16} />
                        Copy Email
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inquiries;