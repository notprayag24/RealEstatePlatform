// src/controllers/property.controller.js - Property Controllers
const Property = require('../models/Property.model');

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Seller or Agent only)
exports.createProperty = async (req, res) => {
  try {
    // Check if user is Seller or Agent
    if (req.user.role !== 'seller' && req.user.role !== 'agent' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers and agents can list properties',
      });
    }

    req.body.sellerId = req.user.id;
    
    if (req.user.role === 'agent') {
      req.body.agentId = req.user.id;
    }

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating property',
      error: error.message,
    });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      city, 
      propertyType, 
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      search,
      featured
    } = req.query;

    const filter = { status: 'active' };

    if (city) filter['location.city'] = { $regex: city, $options: 'i' };
    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;
    if (featured === 'true') filter.featured = true;
    if (bedrooms) filter['details.bedrooms'] = { $gte: parseInt(bedrooms) };
    if (bathrooms) filter['details.bathrooms'] = { $gte: parseInt(bathrooms) };
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const properties = await Property.find(filter)
      .populate('sellerId', 'firstName lastName email profile.avatar')
      .populate('agentId', 'firstName lastName email profile.avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching properties',
      error: error.message,
    });
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('sellerId', 'firstName lastName email profile.avatar profile.phone')
      .populate('agentId', 'firstName lastName email profile.avatar profile.phone');

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    property.views += 1;
    await property.save();

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching property',
      error: error.message,
    });
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Seller/Agent/Admin)
exports.updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check ownership
    const isOwner = property.sellerId.toString() === req.user.id;
    const isAgent = property.agentId && property.agentId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this property',
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating property',
      error: error.message,
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Seller/Agent/Admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Check ownership
    const isOwner = property.sellerId.toString() === req.user.id;
    const isAgent = property.agentId && property.agentId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAgent && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this property',
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting property',
      error: error.message,
    });
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ 
      status: 'active', 
      featured: true 
    })
    .populate('sellerId', 'firstName lastName')
    .populate('agentId', 'firstName lastName')
    .limit(6)
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error('Get featured properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured properties',
    });
  }
};

// @desc    Toggle favorite
// @route   POST /api/properties/:id/favorite
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    const Favorite = require('../models/Favorite.model');
    
    const existingFavorite = await Favorite.findOne({ userId, propertyId });

    if (existingFavorite) {
      await existingFavorite.deleteOne();
      property.favorites = Math.max(0, property.favorites - 1);
      await property.save();
      
      return res.status(200).json({
        success: true,
        message: 'Property removed from favorites',
        isFavorited: false,
      });
    } else {
      await Favorite.create({ userId, propertyId });
      property.favorites += 1;
      await property.save();
      
      return res.status(200).json({
        success: true,
        message: 'Property added to favorites',
        isFavorited: true,
      });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling favorite',
      error: error.message,
    });
  }
};

// @desc    Get user's favorite properties
// @route   GET /api/properties/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const Favorite = require('../models/Favorite.model');
    
    console.log('📊 Getting favorites for user:', req.user.id);
    
    const favorites = await Favorite.find({ userId: req.user.id });
    
    console.log('📊 Found favorites count:', favorites.length);
    
    if (favorites.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }
    
    const propertyIds = favorites.map(fav => fav.propertyId);
    
    const properties = await Property.find({
      _id: { $in: propertyIds }
    }).populate('sellerId', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message,
    });
  }
};

// @desc    Check if property is favorited
// @route   GET /api/properties/:id/favorite-status
// @access  Private
exports.getFavoriteStatus = async (req, res) => {
  try {
    const Favorite = require('../models/Favorite.model');
    
    const favorite = await Favorite.findOne({
      userId: req.user.id,
      propertyId: req.params.id,
    });

    res.status(200).json({
      success: true,
      isFavorited: !!favorite,
    });
  } catch (error) {
    console.error('Get favorite status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking favorite status',
      error: error.message,
    });
  }
};