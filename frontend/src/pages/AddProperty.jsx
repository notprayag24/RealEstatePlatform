// src/pages/AddProperty.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Building, MapPin, Bed, Bath, Square, 
  DollarSign, Upload, X, Check, Plus,
  Image, Calendar as CalendarIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const AddProperty = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const [images, setImages] = useState([]);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = [...images, ...files];
    const newPreviews = [...imagePreviews];
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === newImages.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages(newImages);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    if (images.length === 0) newErrors.images = 'At least one image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all errors');
      return;
    }

    setLoading(true);
    
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
        },
        images: imagePreviews.map((preview, index) => ({
          url: preview,
          isMain: index === 0,
          publicId: `temp_${Date.now()}_${index}`
        }))
      };

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(propertyData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Property listed successfully! 🎉');
        navigate('/properties');
      } else {
        toast.error(data.message || 'Failed to list property');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <div className="container" style={{ padding: '30px 20px', maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#1a1a1a', fontFamily: 'Playfair Display, serif' }}>
            List Your <span style={{ color: '#b8860b', fontWeight: '400' }}>Property</span>
          </h1>
          <p style={{ color: '#8b7355' }}>Fill in the details below to list your property</p>
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

            {/* Images */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' }}>
                <Image size={20} style={{ display: 'inline', marginRight: '8px', color: '#b8860b' }} />
                Images <span style={{ color: '#b8860b' }}>*</span>
              </h3>

              <div
                style={{
                  border: `2px dashed ${errors.images ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '12px',
                  padding: '40px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: '#faf8f5'
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.target.style.borderColor = '#d4af37';
                  e.target.style.background = 'rgba(212, 175, 55, 0.05)';
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.target.style.borderColor = errors.images ? '#ef4444' : '#e5e7eb';
                  e.target.style.background = '#faf8f5';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.background = '#faf8f5';
                  const files = Array.from(e.dataTransfer.files);
                  const fileInput = document.querySelector('input[type="file"]');
                  const dataTransfer = new DataTransfer();
                  files.forEach(file => dataTransfer.items.add(file));
                  fileInput.files = dataTransfer.files;
                  fileInput.dispatchEvent(new Event('change'));
                }}
              >
                <Upload size={48} style={{ color: '#b8860b', marginBottom: '12px' }} />
                <p style={{ color: '#8b7355', fontSize: '14px' }}>
                  Drag & drop images here, or <span style={{ color: '#b8860b', fontWeight: '500' }}>browse</span>
                </p>
                <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                  Upload up to 10 images (JPEG, PNG, WEBP)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload').click()}
                  style={{
                    marginTop: '12px',
                    padding: '10px 24px',
                    background: '#d4af37',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#b8860b'}
                  onMouseLeave={(e) => e.target.style.background = '#d4af37'}
                >
                  Select Images
                </button>
              </div>
              {errors.images && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', display: 'block' }}>{errors.images}</span>}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        width: '120px',
                        height: '120px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: index === 0 ? '2px solid #d4af37' : '1px solid #e5e7eb'
                      }}
                    >
                      <img src={preview} alt={`Preview ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {index === 0 && (
                        <span style={{
                          position: 'absolute',
                          bottom: '4px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: 'rgba(212, 175, 55, 0.9)',
                          color: 'white',
                          fontSize: '10px',
                          padding: '2px 10px',
                          borderRadius: '4px'
                        }}>
                          Main
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate('/properties')}
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
                disabled={loading}
                style={{
                  padding: '14px 40px',
                  background: loading ? '#9ca3af' : 'linear-gradient(145deg, #d4af37, #b8860b)',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: loading ? 'none' : '0 4px 15px -4px rgba(184, 134, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.target.style.transform = 'translateY(0)';
                }}
              >
                {loading ? 'Listing Property...' : 'List Property'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;