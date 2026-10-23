// src/controllers/message.controller.js - Message Controllers
const Message = require('../models/Message.model');
const Conversation = require('../models/Conversation.model');
const User = require('../models/User.model');

// @desc    Get all conversations for a user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id,
    })
    .populate('participants', 'firstName lastName email profile.avatar')
    .populate('propertyId', 'title images')
    .populate('lastMessageSenderId', 'firstName lastName')
    .sort({ lastMessageAt: -1 });

    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id.toString(),
          receiverId: req.user.id,
          isRead: false,
        });
        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversationsWithUnread,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversations',
      error: error.message,
    });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.participants.includes(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this conversation',
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Message.find({
      conversationId,
      isDeleted: false,
    })
    .populate('senderId', 'firstName lastName email profile.avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    await Message.updateMany(
      {
        conversationId,
        receiverId: req.user.id,
        isRead: false,
      },
      {
        isRead: true,
        readAt: Date.now(),
      }
    );

    await Conversation.findByIdAndUpdate(conversationId, {
      unreadCount: 0,
    });

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
};

// @desc    Create or get conversation
// @route   POST /api/messages/conversation
// @access  Private
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId, propertyId } = req.body;

    console.log('📝 Creating conversation:', { receiverId, propertyId, userId: req.user.id });

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      console.log('❌ Receiver not found:', receiverId);
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, receiverId] },
    });

    // If propertyId is provided, check for property-specific conversation
    if (propertyId) {
      conversation = await Conversation.findOne({
        participants: { $all: [req.user.id, receiverId] },
        propertyId: propertyId,
      });
    }

    if (conversation) {
      console.log('✅ Found existing conversation:', conversation._id);
      // If archived, unarchive
      if (conversation.archivedFor && conversation.archivedFor.includes(req.user.id)) {
        conversation.archivedFor = conversation.archivedFor.filter(
          id => id.toString() !== req.user.id.toString()
        );
        await conversation.save();
      }
      
      const populated = await Conversation.findById(conversation._id)
        .populate('participants', 'firstName lastName email profile.avatar')
        .populate('propertyId', 'title images');
      
      return res.status(200).json({
        success: true,
        data: populated,
      });
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [req.user.id, receiverId],
      propertyId: propertyId || null,
    });

    console.log('✅ Created new conversation:', conversation._id);

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'firstName lastName email profile.avatar')
      .populate('propertyId', 'title images');

    res.status(201).json({
      success: true,
      data: populatedConversation,
    });
  } catch (error) {
    console.error('❌ Get or create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating conversation',
      error: error.message,
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, content, propertyId } = req.body;

    console.log('📝 Sending message:', { conversationId, receiverId, content });

    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found',
        });
      }
    } else {
      conversation = await Conversation.create({
        participants: [req.user.id, receiverId],
        propertyId: propertyId || null,
      });
    }

    const message = await Message.create({
      conversationId: conversation._id.toString(),
      senderId: req.user.id,
      receiverId,
      content,
      propertyId: propertyId || null,
    });

    conversation.lastMessage = content;
    conversation.lastMessageAt = Date.now();
    conversation.lastMessageSenderId = req.user.id;
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'firstName lastName email profile.avatar');

    res.status(201).json({
      success: true,
      data: populatedMessage,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:messageId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (message.receiverId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this message as read',
      });
    }

    message.isRead = true;
    message.readAt = Date.now();
    await message.save();

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message,
    });
  }
};

// @desc    Archive conversation
// @route   PUT /api/messages/conversation/:conversationId/archive
// @access  Private
exports.archiveConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.archivedFor) {
      conversation.archivedFor = [];
    }
    
    if (!conversation.archivedFor.includes(req.user.id)) {
      conversation.archivedFor.push(req.user.id);
      await conversation.save();
    }

    res.status(200).json({
      success: true,
      message: 'Conversation archived',
    });
  } catch (error) {
    console.error('Archive conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error archiving conversation',
      error: error.message,
    });
  }
};