import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const AdminDashboard = () => {
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // ✅ States for stats
  const [leadsCount, setLeadsCount] = useState(0);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [employeesCount, setEmployeesCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  // ✅ Recent activities
  const [activities, setActivities] = useState([]);

  // ✅ Customer form state
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // Fetch dashboard stats + activities
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard/summary`);
        setLeadsCount(res.data.leadsCount);
        setPropertiesCount(res.data.propertiesCount);
        setEmployeesCount(res.data.employeesCount);

      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };
    fetchDashboard();
  }, []);


  // Handle customer form submit
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/customers`, customer);
      alert("Customer added successfully!");
      setIsCustomerModalOpen(false);
      setCustomer({ name: "", email: "", phone: "", password: "" });
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Try again.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Manage leads, employees, and properties efficiently</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center">
            <i className="fas fa-user-plus mr-2"></i> Add Employee
          </button>
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 flex items-center"
          >
            <i className="fas fa-user mr-2"></i> Add Customer
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 flex items-center">
            <i className="fas fa-chart-line mr-2"></i> View Reports
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Leads</p>
            <h2 className="text-2xl font-bold">{leadsCount}</h2>
          </div>
          <i className="fas fa-users text-blue-500 text-3xl"></i>
        </div>
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Properties</p>
            <h2 className="text-2xl font-bold">{propertiesCount}</h2>
          </div>
          <i className="fas fa-home text-green-500 text-3xl"></i>
        </div>
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Employees</p>
            <h2 className="text-2xl font-bold">{employeesCount}</h2>
          </div>
          <i className="fas fa-user-tie text-purple-500 text-3xl"></i>
        </div>
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Revenue</p>
            <h2 className="text-2xl font-bold">₹{revenue}</h2>
          </div>
          <i className="fas fa-rupee-sign text-yellow-500 text-3xl"></i>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Recent Activities</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left">
                <th className="px-6 py-3">Activity</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{a.activity}</td>
                  <td className="px-6 py-3">{a.user}</td>
                  <td className="px-6 py-3">
                    {new Date(a.date).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {activities.length === 0 && (
            <p className="p-6 text-gray-500 text-center">No recent activities</p>
          )}
        </div>
      </div>

      {/* Reports & Analytics Placeholder */}
      <div className="bg-white shadow rounded-lg mt-6 p-6 text-center text-gray-500">
        <p><i className="fas fa-chart-pie text-indigo-500 text-3xl mb-3"></i></p>
        <p>Reports & Analytics will appear here.</p>
      </div>

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Add Customer</h2>
            <form className="space-y-4" onSubmit={handleAddCustomer}>
              <div>
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Phone</label>
                <input
                  type="text"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700">Password</label>
                <input
                  type="password"
                  value={customer.password}
                  onChange={(e) => setCustomer({ ...customer, password: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
