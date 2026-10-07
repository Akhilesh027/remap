import React, { useState, useEffect, useRef } from 'react';
import {
  FaPaperPlane, FaCircle, FaRegDotCircle, FaUser,
  FaSearch, FaEllipsisV, FaPhone, FaVideo, FaSmile,
  FaPaperclip, FaMicrophone, FaRegSmile, FaBars, FaTimes
} from 'react-icons/fa';

const API_MESSAGES = "http://localhost:5000/api/messages/department";
const API_USERS = "http://localhost:5000/api/users";

function DepartmentChat() {
  const [activeDepartment, setActiveDepartment] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const sidebarRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(API_USERS);
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);

      // Select first user/department by default
      if (data.length > 0) {
        setCurrentUser(data[0]);
        setActiveDepartment(data[0].role);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch messages from backend for active department
  const fetchMessages = async () => {
    if (!activeDepartment) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_MESSAGES}/${activeDepartment}`);
      if (!res.ok) throw new Error('Failed to fetch messages');

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : data.messages || []);
      setError('');
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setError("Failed to load messages");
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchMessages();

    // Auto-refresh messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [activeDepartment]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close sidebar on department change on mobile
  useEffect(() => {
    if (activeDepartment && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [activeDepartment]);

  // Handle click outside sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Send message with proper user data
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !activeDepartment) return;

    const now = new Date();
    const messageData = {
      departmentId: activeDepartment,
      senderId: currentUser._id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      text: newMessage.trim(),
      timestamp: now.toISOString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      // Optimistically add message to UI
      const tempMessage = {
        ...messageData,
        _id: Date.now().toString(),
        isSending: true
      };
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Send to backend
      const res = await fetch(API_MESSAGES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) throw new Error("Failed to send message");

      const savedMessage = await res.json();

      // Replace temporary message with saved one
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempMessage._id ? { ...savedMessage, isSending: false } : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message");

      // Remove failed message
      setMessages(prev => prev.filter(msg => !msg.isSending));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Check if message is from current user
  const isCurrentUser = (message) => {
    return message.senderId === currentUser?._id;
  };

  // Format message time
  const formatMessageTime = (timestamp, time) => {
    if (timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return time;
  };

  const activeDeptData = users.find(u => u.role === activeDepartment);

  // Function to determine user color for Department List Avatar
  const getDepartmentColor = (role) => {
    switch (role) {
      case 'CEO': return '#ef4444';
      case 'Marketing': return '#10b981';
      case 'Finance': return '#f59e0b';
      case 'HR': return '#8b5cf6';
      case 'IT': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  return (
    <div className="department-chat-container">
      <div className="chat-app">

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="mobile-overlay"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Responsive Sidebar */}
        <div
          ref={sidebarRef}
          className={`sidebar ${isSidebarOpen ? 'sidebar-open' : ''}`}
        >
          <div className="sidebar-header">
            <div className="header-content">
              <div className="logo-section">
                <div className="app-logo">
                  C
                </div>
                <h1 className="app-title">
                  Corporate Chat
                </h1>
              </div>
              <button className="menu-button">
                <FaEllipsisV />
              </button>
            </div>
            <p className="app-subtitle">Communicate with departments</p>

            {/* Current User Info */}
            {currentUser && (
              <div className="current-user-card">
                <div className="user-avatar">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <p className="user-name">{currentUser.name}</p>
                  <p className="user-role">{currentUser.role}</p>
                </div>
                <div className="user-status">
                  <FaCircle className="status-indicator" />
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search departments..."
                className="search-input"
              />
            </div>
          </div>

          {/* Scrollable Departments List */}
          <div className="departments-list">
            <div className="departments-header">
              <h2 className="departments-title">
                Departments ({users.length})
              </h2>
            </div>

            <div className="departments-content">
              {isLoading && users.length === 0 ? (
                // Loading Skeleton
                [...Array(6)].map((_, index) => (
                  <div key={index} className="department-skeleton">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-line skeleton-line-wide"></div>
                      <div className="skeleton-line skeleton-line-narrow"></div>
                    </div>
                  </div>
                ))
              ) : (
                users.map(user => (
                  <div
                    key={user._id}
                    onClick={() => setActiveDepartment(user.role)}
                    className={`department-item ${activeDepartment === user.role ? 'department-item-active' : 'department-item-inactive'
                      }`}
                    style={{
                      '--dept-color': getDepartmentColor(user.role)
                    }}
                  >
                    <div className={`department-avatar ${activeDepartment === user.role ? 'department-avatar-active' : 'department-avatar-inactive'
                      }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="department-info">
                      <div className="department-header">
                        <h3 className="department-name">{user.name}</h3>
                        <div className="department-status">
                          <FaCircle className={`status-dot ${activeDepartment === user.role ? 'status-dot-active' : 'status-dot-inactive'
                            }`} />
                        </div>
                      </div>
                      <p className="department-role">{user.role}</p>
                      <div className="department-meta">
                        <span className="online-status">Online</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area - Takes remaining space */}
        <div className="chat-area">
          {/* Chat Header */}
          <div className="chat-header">

            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="mobile-toggle"
            >
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            {activeDeptData ? (
              <>
                <div className="chat-user-info">
                  <div
                    className="chat-user-avatar"
                    style={{ backgroundColor: getDepartmentColor(activeDeptData.role) }}
                  >
                    {activeDeptData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-user-details">
                    <h2 className="chat-user-name">{activeDeptData.name}</h2>
                    <p className="chat-user-status">
                      <FaCircle className="status-dot-online" />
                      Active now
                    </p>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="chat-action-btn">
                    <FaPhone />
                  </button>
                  <button className="chat-action-btn">
                    <FaVideo />
                  </button>
                  <button className="chat-action-btn">
                    <FaEllipsisV />
                  </button>
                </div>
              </>
            ) : (
              <div className="no-department-selected">
                Select a department to start chatting
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {isLoading && messages.length === 0 ? (
              <div className="loading-messages">
                <div className="loading-spinner"></div>
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 && activeDepartment ? (
              <div className="no-messages">
                <div className="no-messages-icon">
                  <FaRegDotCircle />
                </div>
                <p className="no-messages-title">No messages yet</p>
                <p className="no-messages-subtitle">Start a conversation with {activeDeptData?.name}</p>
              </div>
            ) : (
              messages.map(message => {
                const isUser = isCurrentUser(message);
                return (
                  <div
                    key={message._id}
                    className={`message-container ${isUser ? 'message-user' : 'message-other'}`}
                  >
                    <div
                      className={`message-bubble ${isUser ? 'message-bubble-user' : 'message-bubble-other'} ${message.isSending ? 'message-sending' : ''
                        }`}
                    >
                      {/* Sender name for others' messages */}
                      {!isUser && (
                        <div className="message-sender">
                          <span className="sender-name">{message.senderName}</span>
                          <span className="sender-separator">•</span>
                          <span className="sender-role">
                            {message.senderRole}
                          </span>
                        </div>
                      )}

                      <p className="message-text">{message.text}</p>

                      <div className={`message-meta ${isUser ? 'message-meta-user' : 'message-meta-other'}`}>
                        <span className="message-sender-label">
                          {isUser ? 'You' : message.senderName}
                        </span>
                        <span className="message-time">
                          {message.isSending && (
                            <FaCircle className="sending-indicator" />
                          )}
                          {formatMessageTime(message.timestamp, message.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="input-area">
            <div className="input-container">
              <button className="input-action-btn input-action-hidden">
                <FaPaperclip />
              </button>
              <button className="input-action-btn input-action-hidden">
                <FaRegSmile />
              </button>

              <div className="message-input-container">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={`Message ${activeDeptData?.name || 'department'}...`}
                  className="message-input"
                  rows="1"
                  disabled={!activeDepartment}
                />
                <button className="mobile-emoji-btn">
                  <FaRegSmile />
                </button>
              </div>

              <button className="input-action-btn input-action-hidden">
                <FaMicrophone />
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !activeDepartment}
                className={`send-button ${newMessage.trim() && activeDepartment ? 'send-button-active' : 'send-button-disabled'}`}
              >
                <FaPaperPlane />
              </button>
            </div>

            {/* Typing indicator or status */}
            {activeDepartment && (
              <div className="chat-status">
                <div className="status-indicator-online"></div>
                <span>
                  Chatting with <span className="status-department-name">{activeDeptData?.name}</span> • {activeDeptData?.role}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .department-chat-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
        }

        .chat-app {
          width: 100%;
          max-width: 1200px;
          height: 95vh;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          display: flex;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        /* Mobile Overlay */
        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 20;
        }

        @media (min-width: 1024px) {
          .mobile-overlay {
            display: none;
          }
        }

        /* Sidebar Styles */
        .sidebar {
          width: 320px;
          flex-shrink: 0;
          background: linear-gradient(to bottom, #ffffff, rgba(219, 234, 254, 0.8));
          color: #1f2937;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(229, 231, 235, 0.5);
          position: absolute;
          inset: 0;
          left: 0;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
          z-index: 30;
        }

        @media (min-width: 1024px) {
          .sidebar {
            position: relative;
            transform: translateX(0);
          }
        }

        .sidebar-open {
          transform: translateX(0);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          flex-shrink: 0;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: between;
        }

        .logo-section {
          display: flex;
          align-items: center;
        }

        .app-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          margin-right: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .app-title {
          font-size: 20px;
          font-weight: bold;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .menu-button {
          padding: 8px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s ease;
        }

        .menu-button:hover {
          background: rgba(243, 244, 246, 0.5);
        }

        .app-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-top: 8px;
          margin-left: 4px;
        }

        /* Current User Card */
        .current-user-card {
          margin-top: 16px;
          padding: 12px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1));
          border-radius: 16px;
          display: flex;
          align-items: center;
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .user-info {
          margin-left: 12px;
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .user-role {
          font-size: 12px;
          color: #2563eb;
          font-weight: 500;
        }

        .status-indicator {
          color: #10b981;
          font-size: 12px;
        }

        /* Search Section */
        .search-section {
          padding: 16px;
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
          flex-shrink: 0;
        }

        .search-container {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 14px;
        }

        .search-input {
          width: 100%;
          padding-left: 44px;
          padding-right: 16px;
          padding-top: 12px;
          padding-bottom: 12px;
          background: rgba(243, 244, 246, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          border: none;
          outline: none;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          background: white;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        /* Departments List */
        .departments-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px 0;
          background: transparent;
        }

        .departments-header {
          position: sticky;
          top: 0;
          background: linear-gradient(to bottom, rgba(219, 234, 254, 0.9), transparent);
          padding-bottom: 8px;
          z-index: 10;
          backdrop-filter: blur(10px);
        }

        .departments-title {
          padding: 0 20px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #6b7280;
          margin-bottom: 12px;
          font-weight: 600;
        }

        .departments-content {
          padding: 0 8px;
        }

        /* Department Items */
        .department-item {
          display: flex;
          align-items: center;
          padding: 16px;
          margin: 0 4px 8px 4px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .department-item-inactive {
          background: transparent;
        }

        .department-item-inactive:hover {
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #d1d5db;
        }

        .department-item-active {
          background: linear-gradient(135deg, #3b82f6, #7c3aed);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transform: scale(1.02);
          border-left: 4px solid #93c5fd;
        }

        .department-avatar {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .department-avatar-inactive {
          background: linear-gradient(135deg, var(--dept-color), var(--dept-color));
        }

        .department-avatar-active {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .department-info {
          margin-left: 16px;
          flex: 1;
          min-width: 0;
        }

        .department-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .department-name {
          font-weight: bold;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .department-item-active .department-name {
          color: white;
        }

        .department-item-inactive .department-name {
          color: #1f2937;
        }

        .status-dot {
          font-size: 12px;
          transition: color 0.3s ease;
          flex-shrink: 0;
          margin-left: 8px;
        }

        .status-dot-inactive {
          color: #10b981;
        }

        .status-dot-active {
          color: rgba(255, 255, 255, 0.8);
        }

        .department-role {
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .department-item-active .department-role {
          color: #bfdbfe;
        }

        .department-item-inactive .department-role {
          color: #6b7280;
        }

        .department-meta {
          display: flex;
          align-items: center;
          margin-top: 4px;
        }

        .online-status {
          font-size: 12px;
          transition: color 0.3s ease;
        }

        .department-item-active .online-status {
          color: rgba(255, 255, 255, 0.7);
        }

        .department-item-inactive .online-status {
          color: #9ca3af;
        }

        /* Loading Skeleton */
        .department-skeleton {
          display: flex;
          align-items: center;
          padding: 16px;
          margin: 0 4px;
          border-radius: 16px;
        }

        .skeleton-avatar {
          width: 48px;
          height: 48px;
          background: #e5e7eb;
          border-radius: 16px;
          flex-shrink: 0;
        }

        .skeleton-content {
          margin-left: 16px;
          flex: 1;
          min-width: 0;
        }

        .skeleton-line {
          height: 16px;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 8px;
          animation: pulse 2s infinite;
        }

        .skeleton-line-wide {
          width: 75%;
        }

        .skeleton-line-narrow {
          width: 50%;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Chat Area */
        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(10px);
          min-width: 0;
        }

        /* Chat Header */
        .chat-header {
          padding: 16px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .mobile-toggle {
          padding: 8px;
          margin-right: 12px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s ease;
          font-size: 20px;
        }

        .mobile-toggle:hover {
          background: rgba(243, 244, 246, 0.5);
        }

        @media (min-width: 1024px) {
          .mobile-toggle {
            display: none;
          }
        }

        .chat-user-info {
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .chat-user-avatar {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          flex-shrink: 0;
        }

        .chat-user-details {
          margin-left: 16px;
          min-width: 0;
        }

        .chat-user-name {
          font-weight: bold;
          color: #1f2937;
          font-size: 18px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .chat-user-status {
          font-size: 14px;
          color: #6b7280;
          display: flex;
          align-items: center;
        }

        .status-dot-online {
          color: #10b981;
          font-size: 12px;
          margin-right: 8px;
        }

        .chat-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .chat-action-btn {
          padding: 12px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 16px;
          transition: all 0.2s ease;
        }

        .chat-action-btn:hover {
          background: rgba(243, 244, 246, 0.5);
        }

        .chat-action-btn:nth-child(1):hover {
          color: #2563eb;
        }

        .chat-action-btn:nth-child(2):hover {
          color: #059669;
        }

        .chat-action-btn:nth-child(3):hover {
          color: #7c3aed;
        }

        .no-department-selected {
          color: #6b7280;
          font-size: 18px;
          font-weight: 500;
          width: 100%;
          text-align: center;
        }

        /* Messages Area */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          background: linear-gradient(to bottom, rgba(248, 250, 252, 0.5), rgba(219, 234, 254, 0.3));
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .error-message {
          text-align: center;
          color: #dc2626;
          background: rgba(254, 226, 226, 0.8);
          backdrop-filter: blur(10px);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(254, 202, 202, 0.5);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 0 16px;
        }

        .loading-messages {
          text-align: center;
          color: #6b7280;
          padding: 32px 0;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #3b82f6;
          border-bottom-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .no-messages {
          text-align: center;
          color: #6b7280;
          padding: 48px 0;
        }

        .no-messages-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #e5e7eb, #d1d5db);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          box-shadow: inset 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .no-messages-icon svg {
          font-size: 32px;
          color: #9ca3af;
        }

        .no-messages-title {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .no-messages-subtitle {
          font-size: 14px;
        }

        /* Message Styles */
        .message-container {
          display: flex;
          animation: fade-in 0.3s ease-out;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message-user {
          justify-content: flex-end;
        }

        .message-other {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 80%;
          padding: 16px 20px;
          border-radius: 24px;
          position: relative;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .message-bubble:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .message-bubble-user {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border-bottom-right-radius: 8px;
        }

        .message-bubble-other {
          background: rgba(255, 255, 255, 0.9);
          color: #1f2937;
          border: 1px solid rgba(229, 231, 235, 0.5);
          border-bottom-left-radius: 8px;
        }

        .message-sending {
          opacity: 0.7;
          transform: scale(0.95);
        }

        .message-sender {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }

        .sender-name {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sender-separator {
          color: #d1d5db;
          margin: 0 8px;
        }

        .sender-role {
          color: #6b7280;
          font-size: 12px;
        }

        .message-text {
          font-size: 14px;
          line-height: 1.5;
          word-wrap: break-word;
          margin: 0;
        }

        .message-meta {
          font-size: 12px;
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .message-meta-user {
          color: #bfdbfe;
        }

        .message-meta-other {
          color: #6b7280;
        }

        .message-sender-label {
          color: inherit;
        }

        .message-time {
          display: flex;
          align-items: center;
          color: inherit;
        }

        .sending-indicator {
          font-size: 12px;
          animation: pulse 2s infinite;
          margin-right: 8px;
        }

        /* Input Area */
        .input-area {
          padding: 16px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(229, 231, 235, 0.5);
          flex-shrink: 0;
        }

        .input-container {
          display: flex;
          align-items: flex-end;
          gap: 12px;
        }

        .input-action-btn {
          padding: 12px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 16px;
          transition: all 0.2s ease;
          font-size: 18px;
        }

        .input-action-btn:hover {
          background: rgba(243, 244, 246, 0.5);
        }

        .input-action-hidden {
          display: none;
        }

        @media (min-width: 640px) {
          .input-action-hidden {
            display: flex;
          }
        }

        .input-action-btn:nth-child(1):hover {
          color: #2563eb;
        }

        .input-action-btn:nth-child(2):hover {
          color: #f59e0b;
        }

        .input-action-btn:nth-child(4):hover {
          color: #059669;
        }

        .message-input-container {
          flex: 1;
          position: relative;
        }

        .message-input {
          width: 100%;
          background: rgba(243, 244, 246, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 16px 20px;
          padding-right: 48px;
          border: none;
          outline: none;
          font-size: 14px;
          resize: none;
          transition: all 0.2s ease;
          max-height: 120px;
          font-family: inherit;
        }

        .message-input:focus {
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }

        .message-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .message-input::placeholder {
          color: #9ca3af;
        }

        .mobile-emoji-btn {
          position: absolute;
          right: 12px;
          bottom: 12px;
          padding: 8px;
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s ease;
          font-size: 18px;
        }

        .mobile-emoji-btn:hover {
          background: rgba(209, 213, 219, 0.5);
        }

        @media (min-width: 640px) {
          .mobile-emoji-btn {
            display: none;
          }
        }

        .send-button {
          padding: 16px;
          border-radius: 16px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          font-size: 14px;
        }

        .send-button-active {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
        }

        .send-button-active:hover {
          background: linear-gradient(135deg, #1d4ed8, #6d28d9);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          transform: scale(1.05);
        }

        .send-button-active:active {
          transform: scale(0.95);
        }

        .send-button-disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        /* Chat Status */
        .chat-status {
          font-size: 12px;
          color: #6b7280;
          margin-top: 12px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-indicator-online {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s infinite;
        }

        .status-department-name {
          font-weight: 600;
          color: #2563eb;
        }

        /* Custom Scrollbars */
        .departments-list::-webkit-scrollbar,
        .messages-area::-webkit-scrollbar {
          width: 6px;
        }

        .departments-list::-webkit-scrollbar-track,
        .messages-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .departments-list::-webkit-scrollbar-thumb,
        .messages-area::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .departments-list::-webkit-scrollbar-thumb:hover,
        .messages-area::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

export default DepartmentChat;