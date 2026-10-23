// src/components/property/PropertyCard.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bed, Bath, Square, MapPin, Heart, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const PropertyCard = ({ property, onFavoriteToggle }) => {
  const navigate = useNavigate();
  const { 
    _id, 
    title, 
    price, 
    location, 
    details, 
    images, 
    propertyType, 
    listingType,
    views,
    favorites: initialFavorites,
    createdAt 
  } = property;

  const [isFavorited, setIsFavorited] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(initialFavorites || 0);
  const [loading, setLoading] = useState(false);

  const mainImage = images?.find(img => img.isMain)?.url || images?.[0]?.url || '/placeholder-house.jpg';

  useEffect(() => {
    checkFavoriteStatus();
  }, [_id]);

  const checkFavoriteStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`/api/properties/${_id}/favorite-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to save favorites');
      navigate('/login');
      return;
    }
    
    if (loading) return;
    setLoading(true);
    
    try {
      const response = await fetch(`/api/properties/${_id}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setIsFavorited(data.isFavorited);
        setFavoritesCount(prev => data.isFavorited ? prev + 1 : prev - 1);
        toast.success(data.message);
        
        if (onFavoriteToggle) {
          onFavoriteToggle(_id, data.isFavorited);
        }
      } else {
        toast.error(data.message || 'Failed to update favorite');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Error updating favorite');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="property-card">
      <div className="property-card-image">
        <img 
          src={mainImage} 
          alt={title}
          onError={(e) => {
            e.target.src = '/placeholder-house.jpg';
          }}
        />
        <div className="property-card-badges">
          <span className="badge-type">{propertyType}</span>
          <span className="badge-listing">{listingType}</span>
        </div>
        <button 
          className="property-card-favorite"
          onClick={toggleFavorite}
          disabled={loading}
          style={{
            color: isFavorited ? '#ef4444' : '#9ca3af',
            background: isFavorited ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.85)'
          }}
        >
          <Heart size={20} fill={isFavorited ? '#ef4444' : 'none'} />
        </button>
      </div>
      
      <div className="property-card-content">
        <div className="property-card-price">{formatPrice(price)}</div>
        <h3 className="property-card-title">{title}</h3>
        <p className="property-card-location">
          <MapPin size={16} />
          {location.city}, {location.state}
        </p>
        
        <div className="property-card-features">
          <span><Bed size={16} /> {details.bedrooms} beds</span>
          <span><Bath size={16} /> {details.bathrooms} baths</span>
          <span><Square size={16} /> {details.area} {details.areaUnit}</span>
        </div>
        
        <div className="property-card-footer">
          <div className="property-card-stats">
            <span><Eye size={14} /> {views || 0}</span>
            <span><Heart size={14} /> {favoritesCount}</span>
          </div>
          <Link to={`/properties/${_id}`} className="property-card-link">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;