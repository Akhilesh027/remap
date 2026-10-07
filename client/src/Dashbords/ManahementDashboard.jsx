import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

export default function ManagementDashboard() {
  const [data, setData] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/dashboard`);
        setData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, []);

  if (!data) return <div className="p-6 text-gray-500">Loading Dashboard...</div>;

  const { kpis, salesData, conversionData, recentAppointments, recentReferrals } = data;

  const kpiData = [
    { title: 'Total Leads', value: kpis.totalLeads, icon: 'fa-users', color: 'bg-blue-500' },
    { title: 'Total Sales', value: `₹ ${kpis.totalSales?.toLocaleString() || 0}`, icon: 'fa-rupee-sign', color: 'bg-green-500' },
    { title: 'Active Projects', value: kpis.activeProjects, icon: 'fa-home', color: 'bg-purple-500' },
    { title: 'Employees', value: kpis.employeeCount, icon: 'fa-user-tie', color: 'bg-pink-500' },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Management Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiData.map((item, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">{item.title}</p>
              <h3 className="text-2xl font-bold text-gray-800">{item.value}</h3>
            </div>
            <div className={`p-4 rounded-full text-white ${item.color}`}>
              <i className={`fas ${item.icon} text-xl`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Sales Performance</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Conversion Funnel</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={conversionData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                {conversionData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Appointments</h2>
          <ul>
            {recentAppointments.map((a) => (
              <li key={a.id} className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-700">{a.clientName}</p>
                  <p className="text-sm text-gray-500">{a.date} • {a.Employee?.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${a.status === "Scheduled" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  }`}>
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Referrals</h2>
          <ul>
            {recentReferrals.map((r) => (
              <li key={r.id} className="flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-medium text-gray-700">{r.referredBy}</p>
                  <p className="text-sm text-gray-500">Referred: {r.name}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${r.rewardStatus === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                  }`}>
                  {r.rewardStatus}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
