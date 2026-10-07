import React, { useState, useMemo, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const TelecallerOutcome = ({ callLogs = [] }) => {
  const [search, setSearch] = useState("");
  const [filterOutcome, setFilterOutcome] = useState("");

  // Consider debouncing search if needed (not shown here for brevity)

  // Normalize callLogs to expected structure for this UI
  const outcomeData = useMemo(() => {
    return callLogs.map((log) => ({
      _id: log._id,
      name: log.lead?.name || "Unknown Lead",
      phone: log.lead?.contact || "N/A",
      outcome: log.outcome || classifyOutcomeFromStatus(log.lead?.status),
      callDate: new Date(log.timestamp).toLocaleDateString(),
      notes: log.notes || "",
    }));
  }, [callLogs]);

  // Filtering
  const filteredData = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return outcomeData.filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(lowerSearch) ||
        item.phone.includes(search);
      const matchOutcome = filterOutcome ? item.outcome === filterOutcome : true;
      return matchSearch && matchOutcome;
    });
  }, [search, filterOutcome, outcomeData]);

  // Aggregate stats
  const totalCalls = outcomeData.length;
  const interested = outcomeData.filter((o) => o.outcome === "Interested").length;
  const followUps = outcomeData.filter((o) => o.outcome === "Follow-up").length;
  const converted = outcomeData.filter((o) => o.outcome === "Converted").length;

  const pieChartData = {
    labels: ["Interested", "Follow-up", "Converted"],
    datasets: [
      {
        data: [interested, followUps, converted],
        backgroundColor: ["#6366f1", "#f59e0b", "#22c55e"],
      },
    ],
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold">Telecaller Outcome</h2>
        <p className="text-gray-600 text-sm">Overview of calls made and their outcomes</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Total Calls" value={totalCalls} color="indigo" />
        <StatCard label="Interested" value={interested} color="green" />
        <StatCard label="Follow-ups" value={followUps} color="yellow" />
        <StatCard label="Converted" value={converted} color="purple" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search name / phone"
          className="border px-3 py-2 rounded-md flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded-md"
          value={filterOutcome}
          onChange={(e) => setFilterOutcome(e.target.value)}
        >
          <option value="">All Outcomes</option>
          <option value="Interested">Interested</option>
          <option value="Follow-up">Follow-up</option>
          <option value="Converted">Converted</option>
        </select>
      </div>

      {/* Chart */}
  

      {/* Outcome Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Outcome Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2">Lead Name</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Outcome</th>
                <th className="px-4 py-2">Call Date</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length ? (
                filteredData.map((o) => (
                  <tr key={o._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{o.name}</td>
                    <td className="px-4 py-2">{o.phone}</td>
                    <td className="px-4 py-2">{o.outcome}</td>
                    <td className="px-4 py-2">{o.callDate}</td>
                    <td className="px-4 py-2">{o.notes}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No outcome records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const classifyOutcomeFromStatus = (status) => {
  if (!status) return "Interested"; // default
  if (status === "Booked") return "Converted";
  if (status === "Follow-up") return "Follow-up";
  return "Interested";
};

const StatCard = ({ label, value, color }) => {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div className={`${c} p-4 rounded-lg text-center shadow-sm`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default TelecallerOutcome;
