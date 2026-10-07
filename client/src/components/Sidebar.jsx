import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { menuConfig } from "../utils/data";
import logo from "../Images/icon.png";
import "./style.css";

const Sidebar = ({ user, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const roleKey = user?.role?.toLowerCase(); // ensure lowercase
  const menuItems = menuConfig[roleKey] || [];

  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (id) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.length) {
        const match = item.children.some(
          (child) => location.pathname === `/${child.id}`
        );
        if (match) {
          setOpenGroups((prev) => (prev[item.id] ? prev : { ...prev, [item.id]: true }));
        }
      }
    });
  }, [location.pathname, menuItems]);

  const topRoute = (id) =>
    id === "dashboard" || id === `${roleKey}-dashboard` ? "/" : `/${id}`;

  // ✅ Logout with attendance end
  const handleLogout = async () => {
    try {
      const attendanceId = localStorage.getItem("attendanceId");
      if (attendanceId) {
        await fetch(`http://localhost:5000/api/attendance/end/${attendanceId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
        });
        console.log("Attendance ended successfully");
        localStorage.removeItem("attendanceId");
      }

      // Clear user-related storage
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
      localStorage.removeItem("token");

      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      navigate("/login"); // fallback redirect
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 lg:hidden z-20"
        />
      )}

      <div
        className={`w-64 bg-gray-900 text-white flex flex-col h-screen fixed inset-y-0 left-0 transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 transition-transform duration-300 ease-in-out z-30`}
        style={{ overscrollBehavior: "contain" }}
      >
        {/* Logo & Role */}
        <div className="p-6 border-b border-gray-700 flex items-center space-x-4 shrink-0">
          <div className="from-indigo-600 to-indigo-800 w-12 h-12 rounded-lg flex items-center justify-center">
            <img src={logo} alt="logo" className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">REMAP</h3>
            <p className="text-indigo-300 text-sm capitalize">
              {user?.roleName || user?.role}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto sidebar-scrollbar">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const hasChildren =
                Array.isArray(item.children) && item.children.length > 0;

              if (!hasChildren) {
                return (
                  <li key={item.id}>
                    <NavLink
                      to={topRoute(item.id)}
                      className={({ isActive }) =>
                        `flex items-center p-3 space-x-3 rounded-lg transition ${isActive
                          ? "bg-indigo-600 text-white font-semibold"
                          : "text-gray-300 hover:bg-gray-700"
                        }`
                      }
                      onClick={() => setSidebarOpen(false)}
                      end
                    >
                      <i className={`${item.icon} text-lg`}></i>
                      <span>{item.title}</span>
                    </NavLink>
                  </li>
                );
              }

              const isOpen = openGroups[item.id];
              const isParentActive = item.children.some(
                (child) => location.pathname === `/${child.id}`
              );

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition ${isParentActive
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-gray-300 hover:bg-gray-700"
                      }`}
                  >
                    <span className="flex items-center space-x-3">
                      <i className={`${item.icon} text-lg`}></i>
                      <span>{item.title}</span>
                    </span>
                    <i
                      className={`fas fa-chevron-${isOpen ? "up" : "down"
                        } text-xs text-gray-400`}
                    ></i>
                  </button>

                  {isOpen && (
                    <ul className="mt-1 pl-10 pr-2 space-y-1 text-sm">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <NavLink
                            to={`/${child.id}`}
                            className={({ isActive }) =>
                              `flex items-center p-2 rounded-lg transition ${isActive
                                ? "bg-indigo-600/80 text-white font-medium"
                                : "text-gray-300 hover:bg-gray-700"
                              }`
                            }
                            onClick={() => setSidebarOpen(false)}
                            end
                          >
                            <i className={`${child.icon} text-sm mr-2`}></i>
                            {child.title}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700 mt-auto shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 text-gray-300 hover:text-white p-3 rounded-lg transition bg-gray-800 hover:bg-gray-700"
          >
            <i className="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
