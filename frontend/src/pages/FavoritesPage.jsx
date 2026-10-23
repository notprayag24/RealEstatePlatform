// src/pages/FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/properties/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setFavorites(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/properties/${propertyId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Removed from favorites');
        setFavorites(prev => prev.filter(p => p._id !== propertyId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ color: '#8b7355' }}>Loading favorites...</div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
            Your <span style={{ color: '#b8860b', fontWeight: '400' }}>Favorites</span>
          </h1>
          <p style={{ color: '#8b7355' }}>{favorites.length} properties saved</p>
        </div>

        {favorites.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 0',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <Heart size={64} style={{ color: '#d4af37', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', color: '#1a1a1a', marginBottom: '8px' }}>No favorites yet</h3>
            <p style={{ color: '#8b7355', marginBottom: '16px' }}>Start saving properties you love</p>
            <Link to="/properties">
              <button style={{
                padding: '12px 32px',
                background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Browse Properties
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
            {favorites.map((property) => {
              const mainImage = property.images?.find(img => img.isMain)?.url || property.images?.[0]?.url || '/placeholder-house.jpg';
              
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
                    <button
                      onClick={() => removeFavorite(property._id)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.85)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#ef4444',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'white'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.85)'}
                    >
                      <Heart size={18} fill="#ef4444" />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
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
                        background: '#d4af37',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'white',
                        textTransform: 'uppercase'
                      }}>
                        {property.listingType}
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px 20px' }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>
                      {formatPrice(property.price)}
                    </div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#1a1a1a',
                      marginBottom: '6px',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {property.title}
                    </h3>
                    <p style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      color: '#8b7355',
                      marginBottom: '12px'
                    }}>
                      <MapPin size={16} />
                      {property.location.city}, {property.location.state}
                    </p>

                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(0,0,0,0.06)',
                      marginBottom: '12px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' }}>
                        <Bed size={16} /> {property.details.bedrooms} beds
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' }}>
                        <Bath size={16} /> {property.details.bathrooms} baths
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#6b7280' }}>
                        <Square size={16} /> {property.details.area} {property.details.areaUnit}
                      </span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '12px',
                      borderTop: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#8b7355' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={14} /> {property.views || 0}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={14} /> {property.favorites || 0}
                        </span>
                      </div>
                      <Link
                        to={`/properties/${property._id}`}
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#b8860b',
                          textDecoration: 'none',
                          transition: 'color 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.color = '#8b6914'}
                        onMouseLeave={(e) => e.target.style.color = '#b8860b'}
                      >
                        View Details →
                      </Link>
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

export default FavoritesPage;