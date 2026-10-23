// src/components/property/RequestAppointment.jsx
import React, { useState } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const RequestAppointment = ({ propertyId, seller, agent, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    message: '',
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.time || !formData.buyerName || !formData.buyerEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId,
          date: formData.date,
          time: formData.time,
          message: formData.message,
          buyerName: formData.buyerName,
          buyerEmail: formData.buyerEmail,
          buyerPhone: formData.buyerPhone,
        })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Appointment requested successfully! The seller/agent will confirm shortly.');
        setFormData({ date: '', time: '', message: '', buyerName: '', buyerEmail: '', buyerPhone: '' });
        onClose();
      } else {
        toast.error(data.message || 'Failed to request appointment');
      }
    } catch (error) {
      console.error('Error requesting appointment:', error);
      toast.error('Error requesting appointment');
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }}
    onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '480px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease',
        position: 'relative'
      }}
      onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            transition: 'color 0.3s ease',
            padding: '4px'
          }}
          onMouseEnter={(e) => e.target.style.color = '#1a1a1a'}
          onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>
            Request a Viewing
          </h3>
          <p style={{ color: '#8b7355', fontSize: '14px' }}>
            Schedule a time to visit this property
          </p>
        </div>

        {/* Contact Person Info */}
        {(seller || agent) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(212,175,55,0.06)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
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
              fontSize: '16px'
            }}>
              {(agent?.firstName?.[0] || seller?.firstName?.[0] || 'U')}
            </div>
            <div>
              <div style={{ fontWeight: 500, color: '#1a1a1a' }}>
                {agent?.firstName || seller?.firstName} {agent?.lastName || seller?.lastName}
              </div>
              <div style={{ fontSize: '13px', color: '#8b7355' }}>
                {agent ? 'Real Estate Agent' : 'Property Owner'}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Your Name <span style={{ color: '#b8860b' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b7355' }} />
                <input
                  type="text"
                  name="buyerName"
                  value={formData.buyerName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: '#faf8f5',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Email <span style={{ color: '#b8860b' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b7355' }} />
                <input
                  type="email"
                  name="buyerEmail"
                  value={formData.buyerEmail}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: '#faf8f5',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Phone (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b7355' }} />
                <input
                  type="tel"
                  name="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: '#faf8f5',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                  Date <span style={{ color: '#b8860b' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b7355' }} />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={minDate}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: '#faf8f5',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                  Time <span style={{ color: '#b8860b' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b7355' }} />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: '#faf8f5',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Message (Optional)
              </label>
              <div style={{ position: 'relative' }}>
                <MessageSquare size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#8b7355' }} />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Any specific questions or preferred time..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    background: '#faf8f5',
                    outline: 'none',
                    transition: 'all 0.3s ease',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '20px',
              padding: '14px',
              background: loading ? '#9ca3af' : 'linear-gradient(145deg, #d4af37, #b8860b)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 4px 15px -4px rgba(184,134,11,0.3)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px -6px rgba(184,134,11,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(184,134,11,0.3)';
              }
            }}
          >
            {loading ? (
              'Requesting...'
            ) : (
              <>
                <Send size={18} />
                Request Viewing
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default RequestAppointment;