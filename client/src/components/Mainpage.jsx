import React, { useMemo } from "react";
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
import { mockData } from "../utils/data";

/* ------------------------------------------------------------------
   CHART.JS REGISTRATION
   ------------------------------------------------------------------ */
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

/* ------------------------------------------------------------------
   HELPERS
   ------------------------------------------------------------------ */
const fmtNumber = (n) => Number(n || 0).toLocaleString();
const fmtCurrency = (n, symbol = "₹") => `${symbol}${fmtNumber(n)}`;

// Accepts optional override currency from props; falls back to ₹.
// Attempts to compute revenue if mockData has deals with value; else uses fallback.
function useTotals(currencySymbol) {
  const leads = mockData?.leads ?? [];
  const appts = mockData?.appointments ?? [];
  const refs = mockData?.referrals ?? [];
  const deals = mockData?.deals ?? [];

  // revenue from deals.value if present
  const revenue = deals.length
    ? deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0)
    : 25000000; // fallback demo amount (₹)

  return {
    totalLeads: leads.length,
    totalAppointments: appts.length,
    totalRevenue: fmtCurrency(revenue, currencySymbol),
    totalReferrals: refs.length,
  };
}

/* ------------------------------------------------------------------
   QUICK STAT CARD
   ------------------------------------------------------------------ */
function StatCard({ label, value, color }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
    gray: "bg-gray-50 text-gray-600",
  };
  const c = colorMap[color] || colorMap.gray;
  return (
    <div className={`${c} p-4 rounded-lg text-center`}> 
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

/* ------------------------------------------------------------------
   PREP LEADS STATUS BAR DATA
   ------------------------------------------------------------------ */
function useLeadsStatusData() {
  const leads = mockData?.leads ?? [];
  const counts = useMemo(() => {
    const c = { New: 0, "Follow-up": 0, Interested: 0, Booked: 0 };
    leads.forEach((l) => {
      if (c[l.status] != null) c[l.status] += 1;
    });
    return c;
  }, [leads]);
  return {
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          label: "Leads by Status",
          data: Object.values(counts),
          backgroundColor: ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"],
          borderRadius: 4,
          maxBarThickness: 48,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.parsed.y} Leads`,
          },
        },
        title: { display: false },
      },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          ticks: { precision: 0 },
        },
      },
    },
  };
}

/* ------------------------------------------------------------------
   PREP APPOINTMENTS PIE DATA
   ------------------------------------------------------------------ */
function useAppointmentsStatusData() {
  const appts = mockData?.appointments ?? [];
  const counts = useMemo(() => {
    const c = { Scheduled: 0, Completed: 0 };
    appts.forEach((a) => {
      if (c[a.status] != null) c[a.status] += 1;
    });
    return c;
  }, [appts]);
  return {
    data: {
      labels: Object.keys(counts),
      datasets: [
        {
          data: Object.values(counts),
          backgroundColor: ["#6366f1", "#22c55e"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${ctx.parsed} (${pct(ctx, counts)})`,
          },
        },
      },
    },
  };
}

function pct(ctx, counts) {
  const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
  const idx = ctx.dataIndex;
  const val = Object.values(counts)[idx];
  return ((val / total) * 100).toFixed(1) + "%";
}

/* ------------------------------------------------------------------
   NO DATA PLACEHOLDER
   ------------------------------------------------------------------ */
function NoData({ label }) {
  return (
    <div className="h-48 flex items-center justify-center text-sm text-gray-400 italic">
      No {label} data.
    </div>
  );
}

/* ------------------------------------------------------------------
   MAIN COMPONENT
   ------------------------------------------------------------------ */
export default function Mainpage({ user, currencySymbol = "₹" }) {
  const { totalLeads, totalAppointments, totalRevenue, totalReferrals } = useTotals(currencySymbol);
  const { data: leadsStatusData, options: leadsStatusOpts } = useLeadsStatusData();
  const { data: apptsStatusData, options: apptsStatusOpts } = useAppointmentsStatusData();

  const hasLeads = (mockData?.leads?.length ?? 0) > 0;
  const hasAppts = (mockData?.appointments?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <header>
        <h2 className="text-2xl font-bold mb-1">Welcome{user?.name ? `, ${user.name}` : ""}</h2>
        {user?.role && (
          <p className="text-gray-500 text-sm mb-6">Role: {user.role}</p>
        )}
      </header>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Leads" value={fmtNumber(totalLeads)} color="indigo" />
        <StatCard label="Appointments" value={fmtNumber(totalAppointments)} color="green" />
        <StatCard label="Revenue" value={totalRevenue} color="yellow" />
        <StatCard label="Referrals" value={fmtNumber(totalReferrals)} color="purple" />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 h-72">
          <h3 className="text-lg font-semibold mb-4">Leads by Status</h3>
          {hasLeads ? (
            <Bar data={leadsStatusData} options={leadsStatusOpts} />
          ) : (
            <NoData label="lead" />
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-4 h-72">
          <h3 className="text-lg font-semibold mb-4">Appointments Overview</h3>
          {hasAppts ? (
            <Pie data={apptsStatusData} options={apptsStatusOpts} />
          ) : (
            <NoData label="appointment" />
          )}
        </div>
      </section>
    </div>
  );
}
