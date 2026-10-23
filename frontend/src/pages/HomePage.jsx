// src/pages/HomePage.jsx - Premium Home Page with Real Data
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, TrendingUp, Shield, Users, 
  ArrowRight, MapPin, Bed, Bath, Square, Sparkles,
  Building2, Clock, Award, Heart, Eye, Star
} from 'lucide-react';
import '../css/pages/home.css';
import '../css/global.css';

const HomePage = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchFeaturedProperties = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/properties/featured');
      const data = await response.json();
      
      if (data.success) {
        setFeaturedProperties(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/properties?search=${encodeURIComponent(searchQuery)}`;
    } else {
      window.location.href = '/properties';
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    }
    return `$${price.toLocaleString()}`;
  };

  const features = [
    { icon: Search, title: 'Smart Search', desc: 'AI-powered property matching' },
    { icon: TrendingUp, title: 'Market Insights', desc: 'Real-time data & analytics' },
    { icon: Shield, title: 'Secure Transactions', desc: 'Safe & trusted platform' },
    { icon: Users, title: 'Expert Agents', desc: 'Professional real estate agents' },
  ];

  const stats = [
    { number: '10K+', label: 'Properties Listed' },
    { number: '5K+', label: 'Happy Clients' },
    { number: '98%', label: 'Satisfaction Rate' },
    { number: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="bg-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="container">
          <div className="hero-content">
            <div>
              <div className="hero-badge">
                <Sparkles size={16} />
                AI-Powered Real Estate
              </div>
              <h1 className="hero-title">
                Find Your Dream{' '}
                <span className="highlight">Property</span>
              </h1>
              <p className="hero-desc">
                Discover premium properties with AI-powered matching.
                Smart search, real-time insights, and expert guidance all in one place.
              </p>

              <form className="hero-search" onSubmit={handleSearch}>
                <div className="search-box">
                  <div className="search-input">
                    <MapPin />
                    <input
                      type="text"
                      placeholder="Search by city, address, or ZIP"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="search-btn">
                    <Search size={18} />
                    Search
                  </button>
                </div>
              </form>

              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Properties */}
            <div className="hero-featured">
              <div className="glow"></div>
              <div className="featured-card">
                <div className="card-header">
                  <span className="label">✨ Featured Properties</span>
                  <Link to="/properties" className="view-all">View All →</Link>
                </div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.4)' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '12px' }}>Loading properties...</p>
                  </div>
                ) : featuredProperties.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'rgba(255,255,255,0.4)' }}>
                    <Building2 size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                    <p>No featured properties yet</p>
                  </div>
                ) : (
                  featuredProperties.slice(0, 3).map((property) => (
                    <Link 
                      key={property._id} 
                      to={`/properties/${property._id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="property-item">
                        <div className="property-item-header">
                          <div className="prop-title">{property.title}</div>
                          <div className="prop-price">{formatPrice(property.price)}</div>
                        </div>
                        <div className="prop-details">
                          <span className="prop-type">
                            <Building2 size={12} />
                            {property.propertyType || 'House'}
                          </span>
                          <span className="prop-location">
                            <MapPin size={12} />
                            {property.location?.city || 'Unknown'}, {property.location?.state || ''}
                          </span>
                        </div>
                        <div className="prop-features">
                          <span><Bed size={14} /> {property.details?.bedrooms || 0}</span>
                          <span><Bath size={14} /> {property.details?.bathrooms || 0}</span>
                          <span><Square size={14} /> {property.details?.area || 0} sqft</span>
                          <span><Heart size={14} /> {property.favorites || 0}</span>
                        </div>
                        <div className="prop-status">
                          <span className={`status-badge ${property.status}`}>
                            {property.status || 'Active'}
                          </span>
                          {property.featured && (
                            <span className="featured-badge">
                              <Star size={12} /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="badge">Why Choose Us</div>
            <h2>Built for <span>Modern</span> Real Estate</h2>
            <p>Experience the future of real estate with our AI-powered platform</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="icon-box">
                    <Icon />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="badge">Get Started Today</div>
            <h2>
              Ready to Find Your <span>Dream Home</span>?
            </h2>
            <p>
              Join thousands of happy clients who found their perfect property with RealEstate AI
            </p>
            <div className="cta-buttons">
              <Link to="/register">
                <button className="btn-primary">
                  Start Your Journey
                  <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/properties">
                <button className="btn-secondary">
                  Browse Properties
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid rgba(255,255,255,0.1);
          border-top-color: #d4af37;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;