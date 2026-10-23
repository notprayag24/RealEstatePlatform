// src/models/Property.model.js - Property Schema
const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Property title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Property description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    propertyType: {
      type: String,
      enum: ['house', 'apartment', 'condo', 'land', 'commercial', 'villa', 'townhouse'],
      required: [true, 'Property type is required'],
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent', 'lease'],
      required: [true, 'Listing type is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'INR'],
    },
    location: {
      address: {
        type: String,
        required: [true, 'Address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'USA',
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    details: {
      bedrooms: {
        type: Number,
        required: [true, 'Number of bedrooms is required'],
        min: [0, 'Bedrooms cannot be negative'],
      },
      bathrooms: {
        type: Number,
        required: [true, 'Number of bathrooms is required'],
        min: [0, 'Bathrooms cannot be negative'],
      },
      area: {
        type: Number,
        required: [true, 'Area is required'],
        min: [0, 'Area cannot be negative'],
      },
      areaUnit: {
        type: String,
        enum: ['sqft', 'sqm', 'acres'],
        default: 'sqft',
      },
      furnished: {
        type: String,
        enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
        default: 'unfurnished',
      },
      parking: {
        type: Number,
        default: 0,
      },
      yearBuilt: Number,
      lotSize: Number,
    },
    amenities: [{
      type: String,
      enum: [
        'pool', 'gym', 'parking', 'garden', 'balcony', 'elevator',
        'security', 'central-ac', 'heating', 'fireplace', 'basement',
        'laundry', 'pet-friendly', 'fenced-yard', 'waterfront', 'mountain-view'
      ],
    }],
    images: [{
      url: String,
      publicId: String,
      isMain: {
        type: Boolean,
        default: false,
      },
    }],
    videos: [String],
    virtualTour: String,
    floorPlan: String,
    status: {
      type: String,
      enum: ['draft', 'pending', 'active', 'sold', 'rented', 'inactive'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
    },
    favorites: {
      type: Number,
      default: 0,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller is required'],
    },
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedAt: Date,
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
propertySchema.index({ title: 'text', description: 'text', 'location.city': 'text' });
propertySchema.index({ price: 1, 'location.city': 1, propertyType: 1 });
propertySchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Property', propertySchema);