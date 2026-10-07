import React, { useEffect, useState } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  PointElement,
  LineElement
);

const Reports = () => {
  const [data, setData] = useState(null);
  const [dateFilter, setDateFilter] = useState("Last 30 Days");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/analytics");
        setData(res.data);
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchReports();
  }, []);

  if (!data) {
    return <p className="text-center mt-10 text-gray-600">Loading reports...</p>;
  }

  // ✅ Destructure backend data
  const {
    totalLeads,
    totalAppointments,
    totalRevenue,
    totalCabsBooked,
    totalClientsVisited,
    leadsByStatus,
    appointmentsOverview,
    revenueGrowth,
  } = data;

  // ✅ Chart Data
  const leadsChartData = {
    labels: Object.keys(leadsByStatus),
    datasets: [
      {
        label: "Leads",
        data: Object.values(leadsByStatus),
        backgroundColor: ["#6366f1", "#f59e0b", "#10b981", "#ef4444"],
      },
    ],
  };

  const appointmentsChartData = {
    labels: Object.keys(appointmentsOverview),
    datasets: [
      {
        data: Object.values(appointmentsOverview),
        backgroundColor: ["#6366f1", "#10b981"],
      },
    ],
  };
  const revenueDataArray = Array.isArray(revenueGrowth)
    ? revenueGrowth
    : Object.entries(revenueGrowth || {}).map(([month, total]) => ({
      _id: month,
      total,
    }));

  const revenueChartData = {
    labels: revenueDataArray.map((r) => `Month ${r._id}`),
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueDataArray.map((r) => r.total),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.2)",
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Reports & Analytics</h2>
          <p className="text-gray-600">
            Track performance metrics, lead conversions, and revenue trends.
          </p>
        </div>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 90 Days</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">

        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Clients Visited</h3>
          <p className="text-3xl font-bold text-purple-600">{totalClientsVisited}</p>
        </div>
        <div className="bg-indigo-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Total Leads</h3>
          <p className="text-3xl font-bold text-indigo-600">{totalLeads}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Appointments</h3>
          <p className="text-3xl font-bold text-green-600">{totalAppointments}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Revenue</h3>
          <p className="text-3xl font-bold text-yellow-600">
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-2">Cabs Booked</h3>
          <p className="text-3xl font-bold text-blue-600">{totalCabsBooked}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Leads by Status</h3>
          <Bar data={leadsChartData} options={{ responsive: true }} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Appointments Overview</h3>
          <Pie data={appointmentsChartData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Revenue Growth</h3>
        <Line data={revenueChartData} options={{ responsive: true }} />
      </div>
    </div>
  );
};

export default Reports;
