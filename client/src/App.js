import React, { useState, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";

// Components
import Sidebar from "./components/Sidebar.jsx";
import Header from "./components/Header.jsx";
import { ToastContainer, toast } from "./components/Toast.jsx";

// Pages
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import LockScreen from "./components/Lockscreen.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ManagementDashboard from "./Dashbords/ManahementDashboard.jsx";
import AdminDashboard from "./Dashbords/AdminDashboard.jsx";
import ExecutiveDashboard from "./pages/ExecutiveDashboard.jsx";
import DirectorDashboard from "./Dashbords/DirecterDashboard.jsx";
import DriverDashboard from "./pages/Driverdashboard.jsx";
import ReceptionistDashboard from "./pages/ReceptionistDashboard.jsx";
import TelecallerDashboard from "./pages/TelicallerDashboard.jsx";
import HrDashboard from "./pages/Hrdashboard.jsx";
import Leads from "./pages/Leads.jsx";
import Leadsmanagement from "./pages/LeadsManagement.jsx";
import MyLeads from "./pages/MyLeads.jsx";
import TelecallerOutcome from "./pages/TellicallerOutcome.jsx";
import Appointments from "./pages/Appointments.jsx";
import AppointmentScheduler from "./pages/AppointmentScheduler.jsx";
import Walkins from "./pages/Walkins.jsx";
import Referrals from "./pages/Referrals.jsx";
import ChatApp from "./pages/Chat.jsx";
import PropertyPage from "./pages/Propertyaddpage.jsx";
import Inventory from "./pages/Inventory.jsx";
import PropertyDetail from "./pages/Property-details.jsx";
import VenturePlots from "./pages/Ventureplotes.jsx";
import HiddenProperties from "./pages/HiddenProperty.jsx";
import MyCommission from "./pages/Mycommision.jsx";
import CabManagement from "./pages/CabManagement.jsx";
import CabBookings from "./pages/CabBookings.jsx";
import Mybookings from "./components/Mybookings.jsx";
import Reports from "./pages/Reports.jsx";
import GovtContacts from "./pages/GovtContacts.jsx";
import CustomerContacts from "./pages/CustomerContacts.jsx";
import ExecutivesCardView from "./pages/Allexigitives.jsx";
import AddExecutive from "./pages/Addexigitive.jsx";
import AddAdmin from "./pages/Addadmin.jsx";
import AdminCardView from "./pages/Alladmins.jsx";
import HRList from "./pages/Hrlist.jsx";
import ReceptionistList from "./pages/ReceptionistList.jsx";
import DriverList from "./pages/DriverList.jsx";
import TelecallerList from "./pages/TelecallerList.jsx";
import DirectorList from "./pages/Alldirecter.jsx";
import Recruitment from "./pages/Recruitment.jsx";
import LeaveManagement from "./pages/LeaveManagement.jsx";
import Attendance from "./pages/Attendance.jsx";
import ApprovalPage from "./pages/Approvel.jsx";
import Profilesection from "./pages/Profilesection.jsx";
import DepartmentChat from "./pages/DepartmentChat.jsx";
import SystemSettings from "./pages/SystemSettings.jsx";
import PlotDetail from "./pages/Plotdetails.jsx";
import CustomerDashboard from "./pages/CustomerDashboard.jsx";
import MyProperty from "./pages/Myproperty.jsx";
import Documents from "./pages/Documents.jsx";
import Updates from "./pages/updates.jsx";
import ClientListPage from "./pages/Client.jsx";
import VenturesInventory from "./pages/VenturePage.jsx";

const getDashboardPathForRole = (role) => {
  if (!role) return "/login";
  const r = role.toLowerCase().trim();
  switch (r) {
    case "management":
      return "/Management-dashboard";
    case "admin":
      return "/Admin-dashboard";
    case "director":
      return "/Director-dashboard";
    case "executive":
      return "/Executive-dashboard";
    case "driver":
      return "/Driver-dashboard";
    case "receptionist":
      return "/Receptionist-dashboard";
    case "telecaller":
      return "/Telecaller-dashboard";
    case "hr":
      return "/Hr-dashboard";
    case "customer":
      return "/Customer-dashboard";
    default:
      return "/Management-dashboard";
  }
};

// Protected layout defined outside App to maintain component identity across renders
const ProtectedLayout = ({
  user,
  darkMode,
  setDarkMode,
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
  isLockScreen,
  mainOffsetClasses,
}) => {
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className={`relative min-h-screen bg-gray-100 dark:bg-gray-900 ${mainOffsetClasses}`}>
      {!isLockScreen && (
        <Sidebar
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          logout={handleLogout}
        />
      )}

      <div className="flex flex-col min-h-screen">
        {!isLockScreen && (
          <Header
            user={user}
            logout={handleLogout}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            setSidebarOpen={setSidebarOpen}
          />
        )}
        <main className="p-6 overflow-y-auto flex-1 focus:outline-none" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser || storedUser === "undefined" || storedUser === "null") return null;
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const handleLogin = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    toast(`Welcome, ${userData.name || userData.email}`, "success");
    const targetPath = getDashboardPathForRole(userData.role);
    navigate(targetPath, { replace: true });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    toast("You have been logged out", "info");
    navigate("/login", { replace: true });
  };

  const isLockScreen = location.pathname === "/lock-screen";
  const mainOffsetClasses = !isLockScreen ? "lg:ml-64" : "";

  return (
    <>
      <ToastContainer />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/lock-screen" element={<LockScreen />} />

        {/* Root path redirect */}
        <Route
          path="/"
          element={
            user ? (
              <Navigate to={getDashboardPathForRole(user.role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedLayout
              user={user}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              handleLogout={handleLogout}
              isLockScreen={isLockScreen}
              mainOffsetClasses={mainOffsetClasses}
            />
          }
        >
          <Route path="/Management-dashboard" element={<ManagementDashboard />} />
          <Route path="/Admin-dashboard" element={<AdminDashboard user={user} />} />
          <Route path="/Executive-dashboard" element={<ExecutiveDashboard user={user} />} />
          <Route path="/Director-dashboard" element={<DirectorDashboard user={user} />} />
          <Route path="/Driver-dashboard" element={<DriverDashboard user={user} />} />
          <Route path="/Receptionist-dashboard" element={<ReceptionistDashboard user={user} />} />
          <Route path="/Telecaller-dashboard" element={<TelecallerDashboard user={user} />} />
          <Route path="/Hr-dashboard" element={<HrDashboard user={user} />} />
          <Route path="/Customer-dashboard" element={<CustomerDashboard user={user} />} />
          <Route path="/leads" element={<Leads user={user} />} />
          <Route path="/leads-management" element={<Leads user={user} />} />
          <Route path="/My-leads" element={<MyLeads />} />
          <Route path="/call-outcomes" element={<TelecallerOutcome />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointment-scheduler" element={<AppointmentScheduler />} />
          <Route path="/walkins" element={<Walkins />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/Client" element={<ClientListPage />} />
          <Route path="/chat" element={<ChatApp />} />
          <Route path="/plots/:plotNumber" element={<PlotDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/VenturesInventory" element={<VenturesInventory />} />
          <Route path="/add-property" element={<PropertyPage />} />
          <Route path="/property-detail/:id" element={<PropertyDetail />} />
          <Route path="/My-property" element={<MyProperty />} />
          <Route path="/My-Documents" element={<Documents />} />
          <Route path="/Updates" element={<Updates />} />
          <Route path="/ventureplotes/:ventureId" element={<VenturePlots />} />
          <Route path="/Hidden-property" element={<HiddenProperties />} />
          <Route path="/My-commission" element={<MyCommission />} />
          <Route path="/cab-management" element={<CabManagement />} />
          <Route path="/cab-bookings" element={<CabBookings />} />
          <Route path="/my-bookings" element={<Mybookings />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/govt-contacts" element={<GovtContacts />} />
          <Route path="/customer-contacts" element={<CustomerContacts />} />
          <Route path="/executives" element={<ExecutivesCardView />} />
          <Route path="/add-executive" element={<AddExecutive />} />
          <Route path="/add-employee" element={<AddAdmin />} />
          <Route path="/admins" element={<AdminCardView />} />
          <Route path="/hr-list" element={<HRList />} />
          <Route path="/receptionist-list" element={<ReceptionistList />} />
          <Route path="/driver-list" element={<DriverList />} />
          <Route path="/telecaller-list" element={<TelecallerList />} />
          <Route path="/directors" element={<DirectorList />} />
          <Route path="/recruitment-staffing" element={<Recruitment />} />
          <Route path="/leave-management" element={<LeaveManagement />} />
          <Route path="/attendance-tracking" element={<Attendance />} />
          <Route path="/profile" element={<Profilesection />} />
          <Route path="/requests" element={<ApprovalPage />} />
          <Route path="/department-chat" element={<DepartmentChat />} />
          <Route path="/system-settings" element={<SystemSettings user={user} darkMode={darkMode} />} />
        </Route>

        {/* Fallback redirect */}
        <Route
          path="*"
          element={
            user ? (
              <Navigate to={getDashboardPathForRole(user.role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

export default App;