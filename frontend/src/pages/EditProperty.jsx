// src/pages/EditProperty.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Home, Building, MapPin, Bed, Bath, Square, 
  DollarSign, Upload, X, Check, Plus,
  Image, Calendar, ArrowLeft, Save, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'house',
    listingType: 'sale',
    price: '',
    currency: 'USD',
    location: {
      address: '',
      city: '',
      state: '',
      country: 'USA',
      zipCode: ''
    },
    details: {
      bedrooms: '',
      bathrooms: '',
      area: '',
      areaUnit: 'sqft',
      furnished: 'unfurnished',
      parking: '',
      yearBuilt: ''
    },
    amenities: [],
    status: 'active',
    featured: false
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const propertyTypes = ['house', 'apartment', 'condo', 'land', 'commercial', 'villa', 'townhouse'];
  const listingTypes = ['sale', 'rent', 'lease'];
  const areaUnits = ['sqft', 'sqm', 'acres'];
  const furnishedOptions = ['unfurnished', 'semi-furnished', 'fully-furnished'];
  const currencies = ['USD', 'EUR', 'GBP', 'INR'];

  const amenityOptions = [
    'pool', 'gym', 'parking', 'garden', 'balcony', 'elevator',
    'security', 'central-ac', 'heating', 'fireplace', 'basement',
    'laundry', 'pet-friendly', 'fenced-yard', 'waterfront', 'mountain-view'
  ];

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/properties/${id}`);
      const data = await response.json();
      
      if (data.success) {
        const prop = data.data;
        setProperty(prop);
        setFormData({
          title: prop.title || '',
          description: prop.description || '',
          propertyType: prop.propertyType || 'house',
          listingType: prop.listingType || 'sale',
          price: prop.price || '',
          currency: prop.currency || 'USD',
          location: {
            address: prop.location?.address || '',
            city: prop.location?.city || '',
            state: prop.location?.state || '',
            country: prop.location?.country || 'USA',
            zipCode: prop.location?.zipCode || ''
          },
          details: {
            bedrooms: prop.details?.bedrooms || '',
            bathrooms: prop.details?.bathrooms || '',
            area: prop.details?.area || '',
            areaUnit: prop.details?.areaUnit || 'sqft',
            furnished: prop.details?.furnished || 'unfurnished',
            parking: prop.details?.parking || '',
            yearBuilt: prop.details?.yearBuilt || ''
          },
          amenities: prop.amenities || [],
          status: prop.status || 'active',
          featured: prop.featured || false
        });
        if (prop.images) {
          setImagePreviews(prop.images.map(img => img.url));
        }
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value
      }
    }));
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      details: {
        ...prev.details,
        [name]: value
      }
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (!formData.location.address.trim()) newErrors['location.address'] = 'Address is required';
    if (!formData.location.city.trim()) newErrors['location.city'] = 'City is required';
    if (!formData.location.state.trim()) newErrors['location.state'] = 'State is required';
    if (!formData.location.zipCode.trim()) newErrors['location.zipCode'] = 'Zip code is required';
    if (!formData.details.bedrooms) newErrors['details.bedrooms'] = 'Bedrooms is required';
    if (!formData.details.bathrooms) newErrors['details.bathrooms'] = 'Bathrooms is required';
    if (!formData.details.area) newErrors['details.area'] = 'Area is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    setSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        details: {
          ...formData.details,
          bedrooms: parseInt(formData.details.bedrooms),
          bathrooms: parseInt(formData.details.bathrooms),
          area: parseFloat(formData.details.area),
          parking: parseInt(formData.details.parking) || 0,
          yearBuilt: parseInt(formData.details.yearBuilt) || undefined
        }
      };

      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Property updated successfully! 🎉');
        navigate(`/properties/${id}`);
      } else {
        toast.error(data.message || 'Failed to update property');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f3' }}>
        <div style={{ color: '#8b7355' }}>Loading property...</div>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <div className="container" style={{ padding: '30px 20px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
                Edit <span style={{ color: '#b8860b', fontWeight: '400' }}>Property</span>
              </h1>
              <p style={{ color: '#8b7355' }}>Update your property listing</p>
            </div>
            <button
              onClick={() => navigate(`/properties/${id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#d4af37'}
              onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <ArrowLeft size={18} />
              Back to Property
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Basic Information */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                Basic Information
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Property Title <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Luxury Beachfront Villa"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors.title ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors.title ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors.title && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.title}</span>}
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Description <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your property..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors.description ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors.description ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors.description && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.description}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Property Type <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: '#faf8f5',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Listing Type <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <select
                    name="listingType"
                    value={formData.listingType}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: '#faf8f5',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {listingTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Price <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      style={{
                        padding: '12px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        background: '#faf8f5',
                        outline: 'none',
                        cursor: 'pointer',
                        width: '80px'
                      }}
                    >
                      {currencies.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="0"
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        border: `1px solid ${errors.price ? '#ef4444' : '#e5e7eb'}`,
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        background: '#faf8f5'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                      onBlur={(e) => e.target.style.borderColor = errors.price ? '#ef4444' : '#e5e7eb'}
                    />
                  </div>
                  {errors.price && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.price}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: '#faf8f5',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="sold">Sold</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleChange}
                      style={{
                        width: '18px',
                        height: '18px',
                        accentColor: '#d4af37',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '14px', color: '#1a1a1a' }}>Feature this property</span>
                    <span style={{ fontSize: '12px', color: '#8b7355' }}>(Appears at top of search results)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                <MapPin size={20} style={{ display: 'inline', marginRight: '8px', color: '#b8860b' }} />
                Location
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Address <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.location.address}
                    onChange={handleLocationChange}
                    placeholder="123 Main Street"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors['location.address'] ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors['location.address'] ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors['location.address'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['location.address']}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    City <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.location.city}
                    onChange={handleLocationChange}
                    placeholder="New York"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors['location.city'] ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors['location.city'] ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors['location.city'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['location.city']}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    State <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.location.state}
                    onChange={handleLocationChange}
                    placeholder="NY"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors['location.state'] ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors['location.state'] ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors['location.state'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['location.state']}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.location.country}
                    onChange={handleLocationChange}
                    placeholder="USA"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
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
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Zip Code <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.location.zipCode}
                    onChange={handleLocationChange}
                    placeholder="10001"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors['location.zipCode'] ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors['location.zipCode'] ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors['location.zipCode'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['location.zipCode']}</span>}
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                <Building size={20} style={{ display: 'inline', marginRight: '8px', color: '#b8860b' }} />
                Property Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Bedrooms <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="bedrooms"
                    value={formData.details.bedrooms}
                    onChange={handleDetailsChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors['details.bedrooms'] ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors['details.bedrooms'] ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors['details.bedrooms'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['details.bedrooms']}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Bathrooms <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.details.bathrooms}
                    onChange={handleDetailsChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors['details.bathrooms'] ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors['details.bathrooms'] ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors['details.bathrooms'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['details.bathrooms']}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Area (sqft) <span style={{ color: '#b8860b' }}>*</span>
                  </label>
                  <input
                    type="number"
                    name="area"
                    value={formData.details.area}
                    onChange={handleDetailsChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${errors['details.area'] ? '#ef4444' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = errors['details.area'] ? '#ef4444' : '#e5e7eb'}
                  />
                  {errors['details.area'] && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors['details.area']}</span>}
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Area Unit
                  </label>
                  <select
                    name="areaUnit"
                    value={formData.details.areaUnit}
                    onChange={handleDetailsChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: '#faf8f5',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {areaUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Furnished
                  </label>
                  <select
                    name="furnished"
                    value={formData.details.furnished}
                    onChange={handleDetailsChange}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      background: '#faf8f5',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {furnishedOptions.map(option => (
                      <option key={option} value={option}>{option.replace('-', ' ').charAt(0).toUpperCase() + option.replace('-', ' ').slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Parking Spaces
                  </label>
                  <input
                    type="number"
                    name="parking"
                    value={formData.details.parking}
                    onChange={handleDetailsChange}
                    placeholder="0"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '500', color: '#5c4033', display: 'block', marginBottom: '4px' }}>
                    Year Built
                  </label>
                  <input
                    type="number"
                    name="yearBuilt"
                    value={formData.details.yearBuilt}
                    onChange={handleDetailsChange}
                    placeholder="2020"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      background: '#faf8f5'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                Amenities
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {amenityOptions.map(amenity => (
                  <label
                    key={amenity}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      border: `1px solid ${formData.amenities.includes(amenity) ? '#d4af37' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: formData.amenities.includes(amenity) ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                      transition: 'all 0.3s ease',
                      fontSize: '13px',
                      color: formData.amenities.includes(amenity) ? '#b8860b' : '#5c4033'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      style={{ display: 'none' }}
                    />
                    {formData.amenities.includes(amenity) ? <Check size={16} /> : <Plus size={16} />}
                    {amenity.replace('-', ' ').charAt(0).toUpperCase() + amenity.replace('-', ' ').slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate(`/properties/${id}`)}
                style={{
                  padding: '14px 32px',
                  background: 'transparent',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#d4af37'}
                onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '14px 40px',
                  background: saving ? '#9ca3af' : 'linear-gradient(145deg, #d4af37, #b8860b)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: saving ? 'none' : '0 4px 15px -4px rgba(184,134,11,0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px -6px rgba(184,134,11,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px -4px rgba(184,134,11,0.3)';
                  }
                }}
              >
                {saving ? <Loader2 size={18} className="spinner" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Update Property'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default EditProperty;