// src/pages/PropertyDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Bed, Bath, Square, MapPin, Heart, Eye, 
  Calendar, User, Phone, Mail, ArrowLeft,
  Home, Building, Check, X, Share2,
  ChevronLeft, ChevronRight, Edit, Trash2,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import DeleteModal from '../components/common/DeleteModal';
import ContactAgent from '../components/property/ContactAgent';
import RequestAppointment from '../components/property/RequestAppointment';

const PropertyDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProperty();
    if (user) {
      checkFavoriteStatus();
    }
  }, [id, user]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProperty(data.data);
      } else {
        toast.error('Property not found');
        navigate('/properties');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Error loading property');
      navigate('/properties');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`/api/properties/${id}/favorite-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsFavorite(data.isFavorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/properties/${id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setIsFavorite(data.isFavorited);
        setProperty(prev => ({
          ...prev,
          favorites: data.isFavorited ? prev.favorites + 1 : prev.favorites - 1
        }));
        toast.success(data.message);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error updating favorite');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Property deleted successfully!');
        navigate('/properties');
      } else {
        toast.error(data.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Error deleting property');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const startConversation = async () => {
    if (!user) {
      toast.error('Please login to send a message');
      navigate('/login');
      return;
    }

    const receiverId = agentId?._id || sellerId?._id;
    
    if (!receiverId) {
      toast.error('No seller or agent found for this property');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: receiverId,
          propertyId: property._id
        })
      });
      const data = await response.json();
      
      if (data.success) {
        navigate('/messages', { state: { conversation: data.data } });
      } else {
        toast.error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Error starting conversation');
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)} Million`;
    }
    return `$${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ color: '#8b7355' }}>Loading property details...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
        <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <h2>Property not found</h2>
          <Link to="/properties" style={{ color: '#b8860b' }}>Back to properties</Link>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    price,
    location,
    details,
    propertyType,
    listingType,
    images,
    amenities,
    status,
    views,
    favorites,
    sellerId,
    agentId,
    createdAt,
    featured,
    currency
  } = property;

  const allImages = images?.map(img => img.url) || ['https://via.placeholder.com/800x500/cccccc/969696?text=No+Image'];
  const mainImage = images?.find(img => img.isMain)?.url || allImages[0];

  const canEdit = user && (
    user._id === sellerId?._id || 
    user._id === agentId?._id || 
    user.role === 'admin'
  );

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
      />

      <ContactAgent
        propertyId={property._id}
        seller={sellerId}
        agent={agentId}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />

      <RequestAppointment
        propertyId={property._id}
        seller={sellerId}
        agent={agentId}
        isOpen={showAppointmentModal}
        onClose={() => setShowAppointmentModal(false)}
      />

      <div className="container" style={{ padding: '30px 20px' }}>
        <Link to="/properties" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: '#8b7355',
          textDecoration: 'none',
          marginBottom: '24px',
          fontSize: '14px',
          transition: 'color 0.3s ease'
        }}
        onMouseEnter={(e) => e.target.style.color = '#b8860b'}
        onMouseLeave={(e) => e.target.style.color = '#8b7355'}>
          <ArrowLeft size={18} />
          Back to Properties
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          {/* Left Column - Images */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              height: '400px',
              background: '#e5e7eb'
            }}>
              <img 
                src={allImages[currentImageIndex]} 
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                display: 'flex',
                gap: '8px'
              }}>
                <span style={{
                  padding: '4px 14px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {propertyType}
                </span>
                <span style={{
                  padding: '4px 14px',
                  background: '#d4af37',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'white',
                  textTransform: 'uppercase'
                }}>
                  {listingType}
                </span>
                {featured && (
                  <span style={{
                    padding: '4px 14px',
                    background: '#8b5cf6',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white'
                  }}>
                    Featured
                  </span>
                )}
              </div>

              <button
                onClick={toggleFavorite}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isFavorite ? '#ef4444' : '#9ca3af',
                  transition: 'all 0.3s ease'
                }}
              >
                <Heart size={20} fill={isFavorite ? '#ef4444' : 'none'} />
              </button>
            </div>

            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px', overflowX: 'auto' }}>
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      width: '80px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: currentImageIndex === index ? '2px solid #d4af37' : '2px solid transparent',
                      flexShrink: 0
                    }}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '24px',
              marginTop: '16px',
              padding: '16px',
              background: 'white',
              borderRadius: '12px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                <Eye size={16} /> {views || 0} views
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                <Heart size={16} /> {favorites || 0} favorites
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#6b7280' }}>
                <Calendar size={16} /> {new Date(createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a' }}>
                    {formatPrice(price)}
                  </div>
                  <div style={{ fontSize: '14px', color: '#8b7355' }}>{currency || 'USD'}</div>
                </div>
                <span style={{
                  padding: '4px 16px',
                  background: status === 'active' ? '#d1fae5' : '#fef3c7',
                  color: status === 'active' ? '#065f46' : '#92400e',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {status}
                </span>
              </div>

              <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>
                {title}
              </h1>

              <p style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#8b7355',
                marginBottom: '16px'
              }}>
                <MapPin size={16} />
                {location.address}, {location.city}, {location.state} {location.zipCode}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                padding: '16px',
                background: '#faf8f5',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Bed size={20} style={{ color: '#b8860b', marginBottom: '4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>{details.bedrooms}</div>
                  <div style={{ fontSize: '12px', color: '#8b7355' }}>Bedrooms</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Bath size={20} style={{ color: '#b8860b', marginBottom: '4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>{details.bathrooms}</div>
                  <div style={{ fontSize: '12px', color: '#8b7355' }}>Bathrooms</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Square size={20} style={{ color: '#b8860b', marginBottom: '4px' }} />
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>{details.area}</div>
                  <div style={{ fontSize: '12px', color: '#8b7355' }}>{details.areaUnit}</div>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Description</h3>
                <p style={{ color: '#4a4a4a', lineHeight: '1.8', fontSize: '14px' }}>{description}</p>
              </div>

              {amenities && amenities.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' }}>Amenities</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {amenities.map(amenity => (
                      <span key={amenity} style={{
                        padding: '4px 14px',
                        background: 'rgba(212, 175, 55, 0.08)',
                        border: '1px solid rgba(212, 175, 55, 0.15)',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: '#b8860b',
                        textTransform: 'capitalize'
                      }}>
                        {amenity.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {/* Send Message Button */}
                <button
                  onClick={startConversation}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '14px 24px',
                    background: 'transparent',
                    border: '1px solid #3b82f6',
                    borderRadius: '12px',
                    color: '#3b82f6',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <MessageCircle size={18} />
                  Send Message
                </button>

                {/* Contact Agent Button */}
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to contact the agent');
                      navigate('/login');
                      return;
                    }
                    setShowContactModal(true);
                  }}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '14px 24px',
                    background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px -4px rgba(184,134,11,0.3)'
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
                  <Mail size={18} />
                  Contact Agent
                </button>

                {/* Request Viewing Button */}
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to request a viewing');
                      navigate('/login');
                      return;
                    }
                    setShowAppointmentModal(true);
                  }}
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    padding: '14px 24px',
                    background: 'transparent',
                    border: '1px solid #8b5cf6',
                    borderRadius: '12px',
                    color: '#8b5cf6',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Calendar size={18} />
                  Request Viewing
                </button>

                {/* Edit Button */}
                {canEdit && (
                  <Link to={`/properties/${property._id}/edit`} style={{ flex: 1, minWidth: '100px' }}>
                    <button style={{
                      width: '100%',
                      padding: '14px 24px',
                      background: 'transparent',
                      border: '1px solid #d4af37',
                      borderRadius: '12px',
                      color: '#b8860b',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(212, 175, 55, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}>
                      <Edit size={18} />
                      Edit
                    </button>
                  </Link>
                )}

                {/* Delete Button */}
                {canEdit && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      padding: '14px 24px',
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      borderRadius: '12px',
                      color: '#ef4444',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      flex: 1,
                      minWidth: '100px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                )}
              </div>
            </div>

            {(sellerId || agentId) && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '12px' }}>
                  {agentId ? 'Listing Agent' : 'Seller'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}>
                    {(agentId?.firstName?.[0] || sellerId?.firstName?.[0] || 'U')}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#1a1a1a' }}>
                      {agentId?.firstName || sellerId?.firstName} {agentId?.lastName || sellerId?.lastName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#8b7355' }}>
                      {agentId ? 'Real Estate Agent' : 'Property Owner'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#b8860b', marginTop: '2px' }}>
                      <Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {agentId?.email || sellerId?.email}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;