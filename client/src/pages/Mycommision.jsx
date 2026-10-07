import React, { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { FaFileDownload } from "react-icons/fa";
import { mockData } from "../utils/data";

/* ------------------------------------------------------------------
   REGISTER CHART ELEMENTS
   ------------------------------------------------------------------ */
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

/* ------------------------------------------------------------------
   NOTES
   ------------------------------------------------------------------
   • This "MyCommissionCommon" page is a *shared* commission view for both
     Directors and Executives (and can be used by Admin/Management) — so we do
     **NOT** filter by role. (Per your request: "dont cheack role there will be
     commenr as for now".)
   • Later you can scope by logged-in role; see commented code below.
   ------------------------------------------------------------------ */

/* ------------------------------------------------------------------
   SAFE MOCK ACCESS HELPERS
   ------------------------------------------------------------------ */
const commissionsRAW = Array.isArray(mockData?.commissions) ? mockData.commissions : [];

// Normalize each record (defensive — tolerate missing fields)
function norm(c, idx) {
  return {
    id: c.id ?? idx,
    userRole: c.userRole ?? "Unknown",
    userName: c.userName ?? c.user ?? "Unknown User",
    venture: c.venture ?? "-",
    property: c.property ?? "-",
    amount: Number(c.amount) || 0,
    date: c.date ?? "",
    status: c.status ?? "Paid", // Paid or Pending
    // optional splits
    directorAmt: Number(c.directorAmt) || null,
    executiveAmt: Number(c.executiveAmt) || null,
  };
}
const commissions = commissionsRAW.map(norm);

/* ------------------------------------------------------------------
   DISTINCT PICKERS
   ------------------------------------------------------------------ */
const distinct = (arr, key) => {
  const set = new Set();
  arr.forEach((o) => set.add(o[key] ?? "-"));
  return Array.from(set).filter(Boolean).sort();
};
const ventureOptions = distinct(commissions, "venture");
const roleOptions = distinct(commissions, "userRole");
const userOptions = distinct(commissions, "userName");
const statusOptions = distinct(commissions, "status");

/* ------------------------------------------------------------------
   FORMATTERS
   ------------------------------------------------------------------ */
const fmtNum = (n) => Number(n || 0).toLocaleString();
const fmtCurr = (n, sym = "₹") => `${sym}${fmtNum(n)}`;

/* ------------------------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------------------------ */
export default function MyCommissionCommon({ currencySymbol = "₹", enableRoleFilter = false }) {
  /* Filters -------------------------------------------------------- */
  const [filterVenture, setFilterVenture] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  /* Filtered Dataset ----------------------------------------------- */
  const filtered = useMemo(() => {
    return commissions.filter((c) => {
      const v = filterVenture ? c.venture === filterVenture : true;
      const r = enableRoleFilter && filterRole ? c.userRole === filterRole : true;
      const u = filterUser ? c.userName === filterUser : true;
      const s = filterStatus ? c.status === filterStatus : true;
      const df = dateFrom ? c.date >= dateFrom : true;
      const dt = dateTo ? c.date <= dateTo : true;
      return v && r && u && s && df && dt;
    });
  }, [filterVenture, enableRoleFilter, filterRole, filterUser, filterStatus, dateFrom, dateTo]);

  /* Totals ---------------------------------------------------------- */
  const totalCommission = useMemo(() => filtered.reduce((sum, c) => sum + c.amount, 0), [filtered]);
  const paidCommission = useMemo(
    () => filtered.filter((c) => c.status === "Paid").reduce((s, c) => s + c.amount, 0),
    [filtered]
  );
  const pendingCommission = useMemo(
    () => filtered.filter((c) => c.status !== "Paid").reduce((s, c) => s + c.amount, 0),
    [filtered]
  );

  /* Bar: Commission by Venture ------------------------------------- */
  const barData = useMemo(() => {
    const map = new Map();
    filtered.forEach((c) => map.set(c.venture, (map.get(c.venture) || 0) + c.amount));
    const labels = Array.from(map.keys());
    const data = Array.from(map.values());
    return {
      labels,
      datasets: [
        {
          label: "Commission",
          data,
          backgroundColor: "#6366f1",
          borderRadius: 4,
          maxBarThickness: 48,
        },
      ],
    };
  }, [filtered]);

  const barOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => fmtCurr(ctx.parsed.y, currencySymbol),
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => fmtCurr(v / 1, currencySymbol),
          precision: 0,
        },
      },
    },
  };

  /* Pie: Paid vs Pending ------------------------------------------- */
  const pieData = useMemo(() => {
    const paid = paidCommission;
    const pending = pendingCommission;
    return {
      labels: ["Paid", "Pending"],
      datasets: [
        {
          data: [paid, pending],
          backgroundColor: ["#22c55e", "#f59e0b"],
          borderWidth: 1,
        },
      ],
    };
  }, [paidCommission, pendingCommission]);

  const pieOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${fmtCurr(ctx.parsed, currencySymbol)}`,
        },
      },
    },
  };

  /* Export CSV ------------------------------------------------------ */
  const exportCSV = () => {
    const rows = [["Date", "Venture", "Property", "User", "Role", "Status", "Commission"]];
    filtered.forEach((c) => {
      rows.push([c.date, c.venture, c.property, c.userName, c.userRole, c.status, c.amount]);
    });
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "commissions.csv";
    link.click();
  };

  /* Target vs Achieved ---------------------------------------------- */
  // demo: simple monthly target of 1,00,000
  const monthlyTarget = 100000; // adjust / prop / API
  const progressPct = monthlyTarget ? Math.min(100, (totalCommission / monthlyTarget) * 100) : 0;

  /* Render ---------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="text-2xl font-bold mb-1">My Commission</h2>
        <p className="text-gray-600 text-sm mb-4">Combined commission overview (Director / Executive / All).</p>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border px-3 py-2 rounded-md text-sm"
          value={filterVenture}
          onChange={(e) => setFilterVenture(e.target.value)}
        >
          <option value="">All Ventures</option>
          {ventureOptions.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        {enableRoleFilter && (
          <select
            className="border px-3 py-2 rounded-md text-sm"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {roleOptions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        )}
        <select
          className="border px-3 py-2 rounded-md text-sm"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        >
          <option value="">All Users</option>
          {userOptions.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
        <select
          className="border px-3 py-2 rounded-md text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          {statusOptions.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          type="date"
          className="border px-3 py-2 rounded-md text-sm"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded-md text-sm"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <button
          onClick={exportCSV}
          className="ml-auto bg-indigo-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
        >
          <FaFileDownload /> Export CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KPICard label="Total" value={fmtCurr(totalCommission, currencySymbol)} color="green" />
        <KPICard label="Paid" value={fmtCurr(paidCommission, currencySymbol)} color="indigo" />
        <KPICard label="Pending" value={fmtCurr(pendingCommission, currencySymbol)} color="yellow" />
        <KPICard label="Target" value={fmtCurr(monthlyTarget, currencySymbol)} color="purple" />
      </div>

      {/* Target Progress */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-2">Target vs Achieved</h3>
        <div className="w-full bg-gray-100 rounded h-4 overflow-hidden">
          <div
            className="h-4 bg-green-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">{progressPct.toFixed(1)}% of {fmtCurr(monthlyTarget, currencySymbol)} target.</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 h-72">
          <h3 className="text-lg font-semibold mb-4">Commission by Venture</h3>
          {barData.labels.length ? (
            <Bar data={barData} options={barOpts} />
          ) : (
            <NoData label="commission" />
          )}
        </div>
        <div className="bg-white rounded-lg shadow p-4 h-72">
          <h3 className="text-lg font-semibold mb-4">Paid vs Pending</h3>
          <Pie data={pieData} options={pieOpts} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Commission Records</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Venture</th>
                <th className="px-4 py-2">Property</th>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Commission</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{c.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{c.venture}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{c.property}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{c.userName}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{c.userRole}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{c.status}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{fmtCurr(c.amount, currencySymbol)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No commission records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   SUBCOMPONENTS
   ------------------------------------------------------------------ */
function KPICard({ label, value, color }) {
  const colors = {
    green: "bg-green-50 text-green-600",
    indigo: "bg-indigo-50 text-indigo-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    gray: "bg-gray-50 text-gray-600",
  };
  const cls = colors[color] || colors.gray;
  return (
    <div className={`${cls} p-4 rounded-lg text-center shadow-sm`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

function NoData({ label }) {
  return (
    <div className="h-48 flex items-center justify-center text-sm text-gray-400 italic">
      No {label} data.
    </div>
  );
}
