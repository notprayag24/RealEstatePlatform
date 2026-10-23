// src/socket/index.js - Socket.io Configuration
const Message = require('../models/Message.model');
const Conversation = require('../models/Conversation.model');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);

    // User joins their personal room
    socket.on('join-room', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined their room`);
      }
    });

    // User joins a conversation room
    socket.on('join-conversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
        console.log(`💬 User joined conversation: ${conversationId}`);
      }
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, receiverId, content, propertyId, senderId } = data;

        console.log('📩 Received message:', { conversationId, senderId, receiverId, content });

        // Validate required fields
        if (!conversationId || !receiverId || !content || !senderId) {
          console.log('❌ Missing required fields:', { conversationId, receiverId, content, senderId });
          socket.emit('message-error', { error: 'Missing required fields' });
          return;
        }

        // Create message in database
        const message = await Message.create({
          conversationId,
          senderId,
          receiverId,
          content,
          propertyId: propertyId || null,
        });

        // Update conversation
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.lastMessage = content;
          conversation.lastMessageAt = Date.now();
          conversation.lastMessageSenderId = senderId;
          conversation.unreadCount = (conversation.unreadCount || 0) + 1;
          await conversation.save();
        }

        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'firstName lastName email profile.avatar');

        // Emit to conversation room (both users)
        io.to(`conversation_${conversationId}`).emit('new-message', {
          message: populatedMessage,
          conversationId,
        });

        // Emit to receiver's personal room for notification
        io.to(`user_${receiverId}`).emit('new-message-notification', {
          message: populatedMessage,
          conversationId,
          sender: populatedMessage.senderId,
        });

        // Update conversation list for both users
        const updatedConversation = await Conversation.findById(conversationId)
          .populate('participants', 'firstName lastName email profile.avatar')
          .populate('propertyId', 'title images')
          .populate('lastMessageSenderId', 'firstName lastName');

        io.to(`user_${senderId}`).emit('conversation-updated', updatedConversation);
        io.to(`user_${receiverId}`).emit('conversation-updated', updatedConversation);

        console.log('✅ Message sent successfully');

      } catch (error) {
        console.error('❌ Socket send message error:', error);
        socket.emit('message-error', { error: error.message });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId, userId, isTyping } = data;
      socket.to(`conversation_${conversationId}`).emit('user-typing', {
        userId,
        isTyping,
      });
    });

    // Mark messages as read
    socket.on('mark-read', async (data) => {
      try {
        const { conversationId, userId } = data;
        
        await Message.updateMany(
          {
            conversationId,
            receiverId: userId,
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

        io.to(`user_${userId}`).emit('messages-read', { conversationId });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });
};