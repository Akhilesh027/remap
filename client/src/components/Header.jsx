// src/components/Header.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";

const Header = ({ user, logout, darkMode, setDarkMode, setSidebarOpen }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Helper Functions ---
  const getIcon = (type) => {
    switch (type) {
      case "lead_created":
      case "lead_assigned":
        return {
          icon: "fas fa-user-plus",
          color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900",
        };
      case "status_change":
        return {
          icon: "fas fa-clock",
          color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900",
        };
      default:
        return {
          icon: "fas fa-info-circle",
          color: "bg-gray-100 text-gray-600 dark:bg-gray-700",
        };
    }
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const getDashboardTitle = () => {
    if (!user?.role) return "Dashboard";
    const role = user.role
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return `${role} Section`;
  };

  // --- Fetch Notifications ---
  const fetchNotifications = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${user._id}`, // ✅ Fetch for specific user
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) throw new Error(`HTTP error! ${response.status}`);

      const data = await response.json();
      if (Array.isArray(data)) setNotifications(data);
      else setNotifications([]);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setError("Failed to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      if (showNotifications) fetchNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications, showNotifications]);

  const unreadCount = (notifications || []).filter((n) => !n.is_read).length;

  // --- JSX ---
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex justify-between items-center dark:bg-gray-800 dark:border-gray-700 shadow-md">
      {/* Left Section */}
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="mr-4 text-gray-600 lg:hidden dark:text-gray-300"
        >
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h1 className="text-xl font-semibold dark:text-white">
          {getDashboardTitle()}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 relative">
        {/* Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="text-gray-600 hover:text-indigo-600 dark:text-gray-300"
        >
          {darkMode ? (
            <i className="fas fa-sun text-yellow-400"></i>
          ) : (
            <i className="fas fa-moon"></i>
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              if (!showNotifications) fetchNotifications();
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative text-gray-600 hover:text-indigo-600 dark:text-gray-300"
          >
            <i className="fas fa-bell text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              {/* Header */}
              <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-gray-800 dark:text-gray-100 font-semibold text-lg">
                  Notifications
                </h3>
              </div>

              {/* Notifications List */}
              <ul className="max-h-64 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700 custom-scrollbar">
                {loading && (
                  <li className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <i className="fas fa-spinner fa-spin mr-2"></i> Loading...
                  </li>
                )}
                {error && (
                  <li className="p-4 text-center text-red-500 dark:text-red-400">
                    Error: {error}
                  </li>
                )}
                {!loading && notifications.length === 0 && !error && (
                  <li className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No new notifications.
                  </li>
                )}
                {!loading &&
                  (notifications || []).map((notification) => {
                    const { icon, color } = getIcon(notification.action_type);
                    const itemClass = notification.is_read
                      ? "opacity-80"
                      : "font-medium bg-indigo-50/50 dark:bg-gray-700/50";

                    // 🔹 Delete handler
                    const handleDeleteNotification = async (id) => {
                      try {
                        await fetch(
                          `http://localhost:5000/api/notifications/${id}`,
                          {
                            method: "DELETE",
                          }
                        );
                        setNotifications((prev) =>
                          prev.filter((notif) => notif._id !== id)
                        );
                      } catch (err) {
                        console.error("Failed to delete notification:", err);
                      }
                    };

                    return (
                      <li
                        key={notification._id}
                        className={`flex items-start justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${itemClass}`}
                      >
                        {/* Notification Info */}
                        <div className="flex items-start flex-1">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}
                            >
                              <i className={icon}></i>
                            </div>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-gray-700 dark:text-gray-200 text-sm">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {timeSince(notification.created_at)}
                            </p>
                          </div>
                        </div>

                        {/* ❌ Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification._id);
                          }}
                          className="text-gray-400 hover:text-red-500 ml-3"
                          title="Remove notification"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </li>
                    );
                  })}
              </ul>

              {/* Footer */}
              <div className="text-center px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/notifications"
                  className="text-indigo-600 hover:underline dark:text-indigo-400 text-sm font-medium"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 focus:outline-none"
          >
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 w-9 h-9 rounded-lg flex items-center justify-center">
              <i className="fas fa-user text-white text-sm"></i>
            </div>
            <span className="hidden md:inline font-medium dark:text-white">
              {user?.name}
            </span>
            <i className="fas fa-chevron-down text-xs text-gray-500 dark:text-gray-400"></i>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-700 dark:border-gray-600 z-50">
              <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role}
                </p>
              </div>
              <Link
                to="/profile"
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <i className="fas fa-user mr-2"></i> View Profile
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
