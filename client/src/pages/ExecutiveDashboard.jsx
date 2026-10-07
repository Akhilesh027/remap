import React, { useEffect, useState } from "react";
import axios from "axios";

const ExecutiveDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [leadsCount, setLeadsCount] = useState(0);
  const [propertiesCount, setPropertiesCount] = useState(0);
  const [commission, setCommission] = useState(0);

  const getStatusClass = (status) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Interested":
        return "bg-green-100 text-green-800";
      case "Follow-up":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-gray-300 text-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Leads
        const leadsRes = await axios.get(
          `http://localhost:5000/api/lead/user/${userId}`
        );
        setLeads(leadsRes.data || []);
        setLeadsCount(Array.isArray(leadsRes.data) ? leadsRes.data.length : 0);

        // Properties count
        const propertiesRes = await axios.get(
          "http://localhost:5000/api/properties"
        );
        setPropertiesCount(propertiesRes.data || 0);

        // Commission
        const commissionRes = await axios.get(
          `http://localhost:5000/api/commission/${userId}`
        );
        setCommission(commissionRes.data.total || 0);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Executive Dashboard
          </h1>
          <p className="text-gray-600">
            Track your leads, properties, and commissions
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center">
            <i className="fas fa-user-plus mr-2"></i> Add Lead
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 flex items-center">
            <i className="fas fa-car mr-2"></i> Book Cab
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">My Leads</p>
            <h2 className="text-2xl font-bold">{leadsCount}</h2>
          </div>
          <i className="fas fa-users text-blue-500 text-3xl"></i>
        </div>
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Properties Assigned</p>
            <h2 className="text-2xl font-bold">{propertiesCount.length}</h2>
          </div>
          <i className="fas fa-home text-green-500 text-3xl"></i>
        </div>

        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Commission Earned</p>
            <h2 className="text-2xl font-bold">₹{commission}</h2>
          </div>
          <i className="fas fa-rupee-sign text-yellow-500 text-3xl"></i>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">My Leads</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <p className="p-6 text-gray-500">Loading...</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-left">
                  <th className="px-6 py-3">Name</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3">{lead.name}</td>
                    <td className="px-6 py-3">{lead.contact}</td>
                    <td className="px-6 py-3">{lead.project}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                          View
                        </button>
                        {lead.status !== "Closed" && (
                          <button className="text-green-600 hover:text-green-800 text-xs font-medium">
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
