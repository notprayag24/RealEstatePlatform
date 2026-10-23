// src/pages/MyProperties.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, PlusCircle, Eye, Edit, Trash2, 
  Search, Filter, ChevronLeft, ChevronRight,
  Bed, Bath, Square, MapPin, Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import DeleteModal from '../components/common/DeleteModal';

const MyProperties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchMyProperties();
  }, [currentPage, statusFilter]);

  const fetchMyProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Get properties where user is seller or agent
      const response = await fetch(`/api/properties?page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Filter properties owned by the user
        const myProps = data.data.filter(prop => 
          prop.sellerId?._id === user._id || prop.agentId?._id === user._id
        );
        setProperties(myProps);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProperty) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/properties/${selectedProperty._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Property deleted successfully!');
        setProperties(prev => prev.filter(p => p._id !== selectedProperty._id));
        setShowDeleteModal(false);
        setSelectedProperty(null);
      } else {
        toast.error(data.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Error deleting property');
    } finally {
      setDeleting(false);
    }
  };

  const filteredProperties = properties.filter(prop => {
    const matchesSearch = prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          prop.location.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prop.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return { bg: '#d1fae5', text: '#065f46' };
      case 'pending': return { bg: '#fef3c7', text: '#92400e' };
      case 'sold': return { bg: '#fce4ec', text: '#c62828' };
      case 'rented': return { bg: '#e3f2fd', text: '#0d47a1' };
      case 'draft': return { bg: '#f5f5f5', text: '#616161' };
      default: return { bg: '#f5f5f5', text: '#616161' };
    }
  };

  const openDeleteModal = (property) => {
    setSelectedProperty(property);
    setShowDeleteModal(true);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ color: '#8b7355' }}>Loading your properties...</div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProperty(null);
        }}
        onConfirm={handleDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${selectedProperty?.title || ''}"? This action cannot be undone.`}
      />

      <div className="container" style={{ padding: '30px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
              My <span style={{ color: '#b8860b', fontWeight: '400' }}>Properties</span>
            </h1>
            <p style={{ color: '#8b7355' }}>Manage your property listings</p>
          </div>
          <Link to="/add-property">
            <button style={{
              padding: '12px 28px',
              background: 'linear-gradient(145deg, #d4af37, #b8860b)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
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
            }}>
              <PlusCircle size={18} />
              Add Property
            </button>
          </Link>
        </div>

        {/* Filters */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px 24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b7355' }} />
              <input
                type="text"
                placeholder="Search by title or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
          <div style={{ minWidth: '150px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '14px',
                background: '#faf8f5',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <div style={{ color: '#8b7355', fontSize: '14px' }}>
            {filteredProperties.length} properties found
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Building2 size={48} style={{ color: '#d4af37', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '20px', color: '#1a1a1a', marginBottom: '8px' }}>No properties found</h3>
            <p style={{ color: '#8b7355', marginBottom: '16px' }}>
              {searchTerm ? 'Try adjusting your search' : 'Start by listing your first property'}
            </p>
            <Link to="/add-property">
              <button style={{
                padding: '12px 32px',
                background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}>
                Add Property
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {filteredProperties.map((property) => {
              const statusColors = getStatusColor(property.status);
              const mainImage = property.images?.find(img => img.isMain)?.url || property.images?.[0]?.url || 'https://via.placeholder.com/400x300/cccccc/969696?text=No+Image';
              
              return (
                <div
                  key={property._id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
                  }}
                >
                  <div style={{ position: 'relative', height: '200px', background: '#e5e7eb' }}>
                    <img
                      src={mainImage}
                      alt={property.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        background: 'rgba(255,255,255,0.9)',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {property.propertyType}
                      </span>
                      <span style={{
                        padding: '4px 12px',
                        background: statusColors.bg,
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: statusColors.text,
                        textTransform: 'capitalize'
                      }}>
                        {property.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
                          {formatPrice(property.price)}
                        </div>
                        <h3 style={{
                          fontSize: '15px',
                          fontWeight: '500',
                          color: '#1a1a1a',
                          marginTop: '2px',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {property.title}
                        </h3>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <Link to={`/properties/${property._id}`}>
                          <button style={{
                            padding: '6px 10px',
                            background: 'rgba(59,130,246,0.08)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#3b82f6',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}>
                            <Eye size={16} />
                          </button>
                        </Link>
                        <Link to={`/properties/${property._id}/edit`}>
                          <button style={{
                            padding: '6px 10px',
                            background: 'rgba(212,175,55,0.08)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#b8860b',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.08)'}>
                            <Edit size={16} />
                          </button>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(property)}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(239,68,68,0.08)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: '#8b7355',
                      marginTop: '6px',
                      marginBottom: '10px'
                    }}>
                      <MapPin size={14} />
                      {property.location.city}, {property.location.state}
                    </p>

                    <div style={{
                      display: 'flex',
                      gap: '14px',
                      paddingTop: '10px',
                      borderTop: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <Bed size={14} /> {property.details.bedrooms}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <Bath size={14} /> {property.details.bathrooms}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <Square size={14} /> {property.details.area} {property.details.areaUnit}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <Heart size={14} /> {property.favorites || 0}
                      </span>
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

export default MyProperties;