// src/components/property/AdvancedSearch.jsx
import React, { useState } from 'react';
import { Search, Sliders, X, ChevronDown, ChevronUp } from 'lucide-react';

const AdvancedSearch = ({ onSearch, onClear, initialFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: initialFilters?.search || '',
    propertyType: initialFilters?.propertyType || '',
    listingType: initialFilters?.listingType || '',
    minPrice: initialFilters?.minPrice || '',
    maxPrice: initialFilters?.maxPrice || '',
    bedrooms: initialFilters?.bedrooms || '',
    bathrooms: initialFilters?.bathrooms || '',
    city: initialFilters?.city || '',
    minArea: initialFilters?.minArea || '',
    maxArea: initialFilters?.maxArea || '',
    furnished: initialFilters?.furnished || '',
    amenities: initialFilters?.amenities || [],
  });

  const propertyTypes = ['house', 'apartment', 'condo', 'land', 'commercial', 'villa', 'townhouse'];
  const listingTypes = ['sale', 'rent', 'lease'];
  const furnishedOptions = ['unfurnished', 'semi-furnished', 'fully-furnished'];
  const bedroomOptions = [1, 2, 3, 4, 5, 6];
  const bathroomOptions = [1, 2, 3, 4, 5];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      search: '',
      propertyType: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      city: '',
      minArea: '',
      maxArea: '',
      furnished: '',
      amenities: [],
    };
    setFilters(clearedFilters);
    onClear();
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(val => 
      val !== '' && val !== null && val !== undefined && 
      !(Array.isArray(val) && val.length === 0)
    );
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '24px'
    }}>
      {/* Basic Search */}
      <form onSubmit={handleSearch}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <Search size={18} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#8b7355' 
            }} />
            <input
              type="text"
              name="search"
              placeholder="Search by title, city, or address..."
              value={filters.search}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px 12px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                background: '#faf8f5',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#d4af37'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ minWidth: '140px' }}>
            <select
              name="propertyType"
              value={filters.propertyType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                background: '#faf8f5',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          <div style={{ minWidth: '120px' }}>
            <select
              name="listingType"
              value={filters.listingType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '14px',
                background: '#faf8f5',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Listings</option>
              {listingTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: '12px 28px',
              background: 'linear-gradient(145deg, #d4af37, #b8860b)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
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
            Search
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              color: '#6b7280',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d4af37';
              e.currentTarget.style.color = '#1a1a1a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <Sliders size={18} />
            Advanced
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {hasActiveFilters() && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <X size={16} />
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Min Price
              </label>
              <input
                type="number"
                name="minPrice"
                placeholder="$0"
                value={filters.minPrice}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
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
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Max Price
              </label>
              <input
                type="number"
                name="maxPrice"
                placeholder="$1,000,000"
                value={filters.maxPrice}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
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
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Bedrooms
              </label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: '#faf8f5',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Any</option>
                {bedroomOptions.map(num => (
                  <option key={num} value={num}>{num}+</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Bathrooms
              </label>
              <select
                name="bathrooms"
                value={filters.bathrooms}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: '#faf8f5',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Any</option>
                {bathroomOptions.map(num => (
                  <option key={num} value={num}>{num}+</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Min Area (sqft)
              </label>
              <input
                type="number"
                name="minArea"
                placeholder="500"
                value={filters.minArea}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
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
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Max Area (sqft)
              </label>
              <input
                type="number"
                name="maxArea"
                placeholder="5000"
                value={filters.maxArea}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
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
            <div>
              <label style={{ fontSize: '12px', fontWeight: 500, color: '#5c4033', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '4px' }}>
                Furnished
              </label>
              <select
                name="furnished"
                value={filters.furnished}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: '#faf8f5',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">Any</option>
                {furnishedOptions.map(option => (
                  <option key={option} value={option}>{option.replace('-', ' ').charAt(0).toUpperCase() + option.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdvancedSearch;