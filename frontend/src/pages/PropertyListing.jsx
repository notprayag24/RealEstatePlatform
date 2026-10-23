// src/pages/PropertyListing.jsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import AdvancedSearch from '../components/property/AdvancedSearch';
import '../css/components/property-card.css';

const PropertyListing = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
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
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchProperties();
  }, [currentPage, filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 9,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))
        )
      });

      const response = await fetch(`/api/properties?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setProperties(data.data || []);
        setPagination(data.pagination || {});
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
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
    });
    setCurrentPage(1);
  };

  const handleFavoriteToggle = (propertyId, isFavorited) => {
    setProperties(prev => 
      prev.map(prop => 
        prop._id === propertyId 
          ? { ...prop, favorites: isFavorited ? (prop.favorites || 0) + 1 : (prop.favorites || 0) - 1 }
          : prop
      )
    );
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <div className="container" style={{ padding: '40px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
              Find Your <span style={{ color: '#b8860b', fontWeight: '400' }}>Dream Property</span>
            </h1>
            <p style={{ color: '#8b7355', marginTop: '4px' }}>{pagination.total || 0} properties available</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setViewMode('grid')}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: viewMode === 'grid' ? '2px solid #d4af37' : '1px solid #e5e7eb',
                background: viewMode === 'grid' ? 'rgba(212, 175, 55, 0.08)' : 'white',
                cursor: 'pointer'
              }}
            >
              <Grid size={18} style={{ color: viewMode === 'grid' ? '#b8860b' : '#6b7280' }} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: viewMode === 'list' ? '2px solid #d4af37' : '1px solid #e5e7eb',
                background: viewMode === 'list' ? 'rgba(212, 175, 55, 0.08)' : 'white',
                cursor: 'pointer'
              }}
            >
              <List size={18} style={{ color: viewMode === 'list' ? '#b8860b' : '#6b7280' }} />
            </button>
          </div>
        </div>

        {/* Advanced Search */}
        <AdvancedSearch 
          onSearch={handleSearch}
          onClear={handleClearFilters}
          initialFilters={filters}
        />

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#8b7355' }}>
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 0',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ color: '#1a1a1a' }}>No properties found</h3>
            <p style={{ color: '#8b7355' }}>Try adjusting your filters</p>
            <button
              onClick={handleClearFilters}
              style={{
                marginTop: '12px',
                padding: '10px 24px',
                background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="properties-grid">
              {properties.map(property => (
                <PropertyCard 
                  key={property._id} 
                  property={property}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.borderColor = '#d4af37';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: currentPage === page ? '2px solid #d4af37' : '1px solid #e5e7eb',
                      background: currentPage === page ? 'rgba(212, 175, 55, 0.08)' : 'white',
                      color: currentPage === page ? '#b8860b' : '#1a1a1a',
                      fontWeight: currentPage === page ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {page}
                  </button>
                ))}
                {pagination.pages > 5 && (
                  <span style={{ padding: '10px 16px', color: '#6b7280' }}>...</span>
                )}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={currentPage === pagination.pages}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    cursor: currentPage === pagination.pages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === pagination.pages ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== pagination.pages) {
                      e.currentTarget.style.borderColor = '#d4af37';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                  }}
                >
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertyListing;