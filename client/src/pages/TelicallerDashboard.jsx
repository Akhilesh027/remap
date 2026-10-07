import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const TelecallerDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todaysCalls, setTodaysCalls] = useState(0);
  const [callsError, setCallsError] = useState("");
  const userId = localStorage.getItem('userId');         // string

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/lead/user/${userId}`);
        setLeads(res.data);
        setError("");
      } catch (err) {
        setError("Failed to fetch leads. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const fetchTodaysCalls = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/calls/today/${userId}`);
        setTodaysCalls(res.data.count || 0);
        setCallsError("");
      } catch {
        setCallsError("Failed to fetch today's calls.");
      }
    };

    if (userId) {
      setLoading(true);
      fetchLeads();
      fetchTodaysCalls();
    }
  }, [userId]);

  if (loading) {
    return <p className="text-center text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  const booked = leads.filter((l) => l.status === "Booked").length;
  const followUps = leads.filter((l) => l.status === "Follow-up").length;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold">Telecaller Dashboard</h2>
      <p className="text-gray-600">Manage your calls and follow-ups efficiently</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 text-center bg-white shadow rounded-lg">
          <p>Total Leads</p>
          <h3 className="text-3xl font-bold text-indigo-600">{leads.length}</h3>
        </div>
        <div className="card p-6 text-center bg-white shadow rounded-lg">
          <p>Follow-ups</p>
          <h3 className="text-3xl font-bold text-yellow-600">{followUps}</h3>
        </div>
        <div className="card p-6 text-center bg-white shadow rounded-lg">
          <p>Conversions</p>
          <h3 className="text-3xl font-bold text-green-600">{booked}</h3>
        </div>
        <div className="card p-6 text-center bg-white shadow rounded-lg">
          <p>Today's Calls</p>
          {callsError ? (
            <p className="text-sm text-red-500">{callsError}</p>
          ) : (
            <h3 className="text-3xl font-bold text-purple-600">{todaysCalls}</h3>
          )}
        </div>
      </div>

      {/* Recent Calls */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Calls</h3>
        {leads.length === 0 ? (
          <p className="text-gray-500">No leads available</p>
        ) : (
          <ul className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <li key={lead._id} className="flex justify-between border-b pb-2">
                <span>{lead.name}</span>
                <span className="text-sm text-gray-500">{lead.contact || lead.phone}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TelecallerDashboard;
