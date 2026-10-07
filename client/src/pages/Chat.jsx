import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/messages";

const GroupChatRealEstateCRM = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const userId = localStorage.getItem("userId");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  // ✅ Fetch all messages on load
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };
    fetchMessages();
  }, []);

  // ✅ Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message to backend
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      senderId: userId || "anonymous", // ✅ Save user ID instead of name
      senderName: user.name || "Anonymous", // ✅ Include name for display
      text: newMessage,
      timestamp: new Date().toISOString(), // ✅ Better to use ISO string for consistency
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      if (!res.ok) throw new Error("Failed to send");

      const savedMessage = await res.json();
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // ✅ Check if message is from current user (using ID)
  const isCurrentUser = (message) => {
    return message.senderId === user?.id;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* ✅ Header */}
      <header className="bg-blue-700 text-white flex items-center justify-between px-4 py-3 shadow-md">
        <h2 className="text-lg font-semibold">🏠 Real Estate CRM - Group Chat</h2>
        <div className="text-sm opacity-90">
          {user?.name || "Guest"} {user?.id && `(ID: ${user.id})`}
        </div>
      </header>

      {/* ✅ Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No messages yet. Start the conversation!
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={msg._id || index} // ✅ Use message ID if available
            className={`flex ${isCurrentUser(msg) ? "justify-end" : "justify-start"
              }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-xs shadow-md ${isCurrentUser(msg)
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none"
                }`}
            >
              {/* ✅ Show sender name for others' messages */}
              {!isCurrentUser(msg) && (
                <div className="text-xs font-semibold text-blue-600 mb-1">
                  {msg.senderName}
                </div>
              )}
              <p className="text-sm break-words">{msg.text}</p>
              <div className="text-xs mt-1 opacity-70">
                {msg.time}
                {/* ✅ Show "You" for current user's messages */}
                {isCurrentUser(msg) ? " • You" : ` • ${msg.senderName}`}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ Message Input */}
      <div className="flex items-center p-3 bg-white border-t">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="ml-3 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default GroupChatRealEstateCRM;