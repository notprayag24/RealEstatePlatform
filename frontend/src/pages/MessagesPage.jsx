// src/pages/MessagesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Search, Send, User, Phone, Video, 
  MoreVertical, Paperclip, Smile, 
  Check, CheckCheck, Clock, ArrowLeft,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (location.state?.conversation) {
      setCurrentConversation(location.state.conversation);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    setSocket(newSocket);

    if (user) {
      newSocket.emit('join-room', user._id);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      console.log('📩 New message received:', data);
      
      // If this is the current user's own message (already shown optimistically)
      if (data.message.senderId?._id === user?._id) {
        // Replace the temp message with the real one
        setMessages(prev => 
          prev.map(msg => 
            msg.isTemp === true ? { ...data.message, isTemp: false } : msg
          )
        );
        return;
      }
      
      // For messages from other users
      if (currentConversation && data.conversationId === currentConversation._id) {
        setMessages(prev => {
          // Check if message already exists (prevent duplicates)
          const exists = prev.some(msg => msg._id === data.message._id);
          if (exists) return prev;
          return [...prev, data.message];
        });
      }
      
      fetchConversations();
    };

    const handleConversationUpdated = (conversation) => {
      console.log('🔄 Conversation updated:', conversation);
      fetchConversations();
    };

    const handleMessageError = (error) => {
      console.error('❌ Message error:', error);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(msg => !msg.isTemp));
    };

    socket.on('new-message', handleNewMessage);
    socket.on('conversation-updated', handleConversationUpdated);
    socket.on('message-error', handleMessageError);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('conversation-updated', handleConversationUpdated);
      socket.off('message-error', handleMessageError);
    };
  }, [socket, currentConversation, user]);

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation._id);
      if (socket) {
        socket.emit('join-conversation', currentConversation._id);
        socket.emit('mark-read', {
          conversationId: currentConversation._id,
          userId: user._id,
        });
      }
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    setMessagesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/messages/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation) return;

    const receiverId = currentConversation.participants.find(
      p => p._id !== user._id
    );

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}`;
    
    // Optimistic update
    const tempMessage = {
      _id: tempId,
      senderId: { _id: user._id, firstName: user.firstName, lastName: user.lastName },
      content: messageContent,
      createdAt: new Date(),
      isRead: false,
      isTemp: true,
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage('');

    // Send ONLY via socket (not via API)
    if (socket && socket.connected) {
      socket.emit('send-message', {
        conversationId: currentConversation._id,
        receiverId: receiverId?._id,
        content: messageContent,
        senderId: user._id,
        propertyId: currentConversation.propertyId?._id || null,
      });
    } else {
      // Fallback: send via API if socket is not connected
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            conversationId: currentConversation._id,
            receiverId: receiverId?._id,
            content: messageContent,
            propertyId: currentConversation.propertyId?._id || null,
          })
        });
        const data = await response.json();
        if (data.success) {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === tempId ? { ...data.data, isTemp: false } : msg
            )
          );
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
      }
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id);
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    if (!other) return false;
    return other.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           other.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f6f3' }}>
      <div style={{ display: 'flex', height: 'calc(100vh - 80px)', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Conversations List */}
        <div style={{
          width: '340px',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1a1a' }}>Messages</h2>
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#8b7355' }} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '14px',
                  background: '#faf8f5',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b7355' }}>Loading...</div>
            ) : filteredConversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b7355' }}>
                <MessageCircle size={40} style={{ color: '#d4af37', marginBottom: '12px' }} />
                <p>No conversations yet</p>
                <p style={{ fontSize: '13px' }}>Start messaging by contacting an agent or seller</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const other = getOtherParticipant(conv);
                if (!other) return null;
                const isActive = currentConversation?._id === conv._id;
                const unread = conv.unreadCount || 0;

                return (
                  <div
                    key={conv._id}
                    onClick={() => setCurrentConversation(conv)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: isActive ? 'rgba(212,175,55,0.06)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = '#f8f6f3';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '16px',
                        flexShrink: 0
                      }}>
                        {other.firstName?.[0]}{other.lastName?.[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 500, color: '#1a1a1a' }}>
                            {other.firstName} {other.lastName}
                          </span>
                          {conv.lastMessageAt && (
                            <span style={{ fontSize: '11px', color: '#8b7355' }}>
                              {formatTime(conv.lastMessageAt)}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '160px'
                          }}>
                            {conv.lastMessage || 'No messages yet'}
                          </span>
                          {unread > 0 && (
                            <span style={{
                              background: '#d4af37',
                              color: 'white',
                              borderRadius: '50%',
                              padding: '2px 8px',
                              fontSize: '12px',
                              fontWeight: 600,
                              minWidth: '20px',
                              textAlign: 'center'
                            }}>
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
          {currentConversation ? (
            <>
              <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setCurrentConversation(null)}
                    style={{
                      display: 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    className="mobile-back-btn"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    {getOtherParticipant(currentConversation)?.firstName?.[0] || 'U'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500, color: '#1a1a1a' }}>
                      {getOtherParticipant(currentConversation)?.firstName} {getOtherParticipant(currentConversation)?.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b7355' }}>
                      {currentConversation.propertyId?.title ? `About: ${currentConversation.propertyId.title}` : 'General'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Phone size={18} />
                  </button>
                  <button style={{
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Video size={18} />
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {messagesLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#8b7355' }}>Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: '#8b7355' }}>
                    <p>No messages yet</p>
                    <p style={{ fontSize: '13px' }}>Send a message to start the conversation</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = msg.senderId?._id === user._id;
                    return (
                      <div
                        key={msg._id || index}
                        style={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          marginBottom: '8px'
                        }}
                      >
                        {!isOwn && (
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'linear-gradient(145deg, #d4af37, #b8860b)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 600,
                            fontSize: '12px',
                            marginRight: '8px',
                            flexShrink: 0,
                            alignSelf: 'flex-end'
                          }}>
                            {msg.senderId?.firstName?.[0] || 'U'}
                          </div>
                        )}
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '10px 16px',
                            borderRadius: '16px',
                            background: isOwn ? 'linear-gradient(145deg, #d4af37, #b8860b)' : '#f3f4f6',
                            color: isOwn ? 'white' : '#1a1a1a',
                            wordWrap: 'break-word',
                            borderBottomRightRadius: isOwn ? '4px' : '16px',
                            borderBottomLeftRadius: !isOwn ? '4px' : '16px',
                          }}
                        >
                          <div style={{ fontSize: '14px' }}>{msg.content}</div>
                          <div style={{
                            fontSize: '10px',
                            marginTop: '4px',
                            opacity: 0.7,
                            textAlign: isOwn ? 'right' : 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            justifyContent: isOwn ? 'flex-end' : 'flex-start'
                          }}>
                            {formatTime(msg.createdAt)}
                            {isOwn && (
                              msg.isRead ? <CheckCheck size={12} /> : <Check size={12} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                background: 'white'
              }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    style={{
                      padding: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Paperclip size={20} />
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#d4af37'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    style={{
                      padding: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Smile size={20} />
                  </button>
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    style={{
                      padding: '10px 20px',
                      background: newMessage.trim() ? 'linear-gradient(145deg, #d4af37, #b8860b)' : '#e5e7eb',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Send size={18} />
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b7355'
            }}>
              <MessageCircle size={64} style={{ color: '#d4af37', marginBottom: '16px' }} />
              <h3 style={{ color: '#1a1a1a', fontSize: '20px', marginBottom: '8px' }}>Your Messages</h3>
              <p style={{ textAlign: 'center', maxWidth: '300px' }}>
                Select a conversation from the list or start a new one by contacting an agent or seller
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-back-btn {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MessagesPage;