// ReferralPage.jsx
import React, { useMemo, useState, useId, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import { toast } from "../components/Toast.jsx";

/* ------------------------------------------------------------------
   SIMPLE ICONS (emoji so no external icon libs required)
   ------------------------------------------------------------------ */
const IPlus = () => <span aria-hidden>➕</span>;
const IEdit = () => <span aria-hidden>✏️</span>;
const IBooked = () => <span aria-hidden>✅</span>;
const IClose = () => <span aria-hidden>✖️</span>;
const IRefresh = () => <span aria-hidden>🔄</span>;

/* ------------------------------------------------------------------
   SETTINGS
   ------------------------------------------------------------------ */
export const STATUS_OPTIONS = ["New", "Contacted", "Booked"];
const statusClasses = {
  New: "bg-indigo-100 text-indigo-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Booked: "bg-green-100 text-green-700",
};

// Default reward value when referral converts (can be overridden via props)
const DEFAULT_REWARD_VALUE = 5000; // currency units (₹) default 5k per referral sale

/* ------------------------------------------------------------------
   DEFAULT FORM STATE
   ------------------------------------------------------------------ */
const defaultForm = {
  referrer: "",
  referred: "",
  phone: "",
  relation: "",
  status: "New",
  date: "",
  reward: "Pending", // referral bonus (flat)
  notes: "",
  // extended fields
  director: "",      // Director handling the deal
  executive: "",     // Executive showing property
  venture: "",       // Venture / project name
  originalPrice: "", // numeric ₹ price user enters
  commissionPct: "", // % of originalPrice to pay as commission (total pool)
};

/* ------------------------------------------------------------------
   UTILITIES
   ------------------------------------------------------------------ */
const todayISO = () => new Date().toISOString().slice(0, 10);
const parseCurrency = (val) => {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
};
const formatCurrency = (num, currencySymbol = "₹") => `${currencySymbol}${Number(num || 0).toLocaleString()}`;

const parsePct = (val) => {
  if (val == null || val === "") return 0;
  if (typeof val === "number") return val;
  const cleaned = String(val).replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
};

function calcCommissionAmt(r) {
  const price = parseCurrency(r.originalPrice);
  const pct = parsePct(r.commissionPct);
  return +(price * (pct / 100));
}

/* ------------------------------------------------------------------
   REFERRALS PAGE COMPONENT
   ------------------------------------------------------------------ */
export default function ReferralPage({ rewardValue = DEFAULT_REWARD_VALUE, currencySymbol = "₹" }) {
  /* --------------------------------------------------------------
     STATE
     -------------------------------------------------------------- */
  const [referrals, setReferrals] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(defaultForm);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  /* --------------------------------------------------------------
     API BASE URL
     -------------------------------------------------------------- */
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

  /* --------------------------------------------------------------
     FETCH DATA FROM BACKEND
     -------------------------------------------------------------- */
  useEffect(() => {
    fetchReferrals();
    fetchSummary();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      // Build query parameters
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus) params.append('status', filterStatus);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await axios.get(`${API_BASE_URL}/referrals?${params}`);
      setReferrals(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching referrals:", error);
      toast("Failed to load referrals", "error");
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/referrals-summary`);
      setSummary(response.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const [summary, setSummary] = useState({
    totalReferrals: 0,
    totalBooked: 0,
    totalRewards: 0,
    totalCommission: 0
  });

  /* --------------------------------------------------------------
     FILTERED DATA
     -------------------------------------------------------------- */
  const filteredReferrals = useMemo(() => {
    // Backend handles filtering, but we can do additional client-side filtering if needed
    return referrals;
  }, [referrals]);

  /* --------------------------------------------------------------
     HANDLERS
     -------------------------------------------------------------- */
  const openAddModal = () => {
    setForm({ ...defaultForm, date: todayISO() });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (referral) => {
    setForm({
      ...defaultForm,
      ...referral,
      date: referral.date ? new Date(referral.date).toISOString().slice(0, 10) : todayISO()
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.referrer.trim() || !form.referred.trim() || !form.phone.trim()) {
      toast("Please fill required fields.", "error");
      return;
    }

    try {
      if (isEditing && form._id) {
        await axios.put(`${API_BASE_URL}/referrals/${form._id}`, form);
        toast("Referral updated.", "success");
      } else {
        await axios.post(`${API_BASE_URL}/referrals`, form);
        toast("Referral added.", "success");
      }

      setModalOpen(false);
      setForm(defaultForm);
      fetchReferrals();
      fetchSummary();
    } catch (error) {
      console.error("Error saving referral:", error);
      toast("Failed to save referral", "error");
    }
  };

  const markAsBooked = async (id) => {
    try {
      await axios.patch(`${API_BASE_URL}/referrals/${id}/book`, { rewardValue });
      toast("Marked as Booked. Reward & commission applied.", "success");
      fetchReferrals();
      fetchSummary();
    } catch (error) {
      console.error("Error marking as booked:", error);
      toast("Failed to mark as booked", "error");
    }
  };

  const deleteReferral = async (id) => {
    if (!window.confirm("Are you sure you want to delete this referral?")) return;

    try {
      await axios.delete(`${API_BASE_URL}/referrals/${id}`);
      toast("Referral deleted.", "success");
      fetchReferrals();
      fetchSummary();
    } catch (error) {
      console.error("Error deleting referral:", error);
      toast("Failed to delete referral", "error");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setDateFrom("");
    setDateTo("");
    fetchReferrals();
  };

  const applyFilters = () => {
    fetchReferrals();
  };

  /* --------------------------------------------------------------
     RENDER
     -------------------------------------------------------------- */
  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Commission Program</h2>
          <p className="text-gray-600">Manage Commission leads, commissions & rewards.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            placeholder="Search name / phone / venture / director / executive"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {(search || filterStatus || dateFrom || dateTo) && (
            <button
              onClick={clearFilters}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
              title="Clear filters"
            >
              <IClose />
            </button>
          )}
          <button
            onClick={applyFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
          >
            <IRefresh /> Apply Filters
          </button>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1"
          >
            <IPlus /> Add Commission
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add Form (visible on lg) */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Add Commission</h3>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <Field label="Name *">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.referrer}
                  onChange={(e) => handleFormChange("referrer", e.target.value)}
                />
              </Field>
              <Field label="Client name *">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.referred}
                  onChange={(e) => handleFormChange("referred", e.target.value)}
                />
              </Field>
              <Field label="Contact Number *">
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                />
              </Field>
              <Field label="Relationship">
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.relation}
                  onChange={(e) => handleFormChange("relation", e.target.value)}
                >
                  <option value="">Select relationship</option>
                  <option>Friend</option>
                  <option>Family</option>
                  <option>Colleague</option>
                  <option>Neighbor</option>
                </select>
              </Field>
              <Field label="Status">
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Reporting">
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.executive}
                  onChange={(e) => handleFormChange("executive", e.target.value)}
                >
                  <option value="">Management</option>

                </select>
              </Field>
              <Field label="Venture (optional)">
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.venture}
                  onChange={(e) => handleFormChange("venture", e.target.value)}
                />
              </Field>
              <Field label={`Original Price (${currencySymbol})`}>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.originalPrice}
                  onChange={(e) => handleFormChange("originalPrice", e.target.value)}
                />
              </Field>
              <Field label="Commission %">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.commissionPct}
                  onChange={(e) => handleFormChange("commissionPct", e.target.value)}
                />
              </Field>
              <Field label="Notes">
                <textarea
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  value={form.notes}
                  onChange={(e) => handleFormChange("notes", e.target.value)}
                />
              </Field>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                {isEditing ? "Update Referral" : "Add Referral"}
              </button>
            </form>
          </div>
        </div>

        {/* Referral List */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Commission List</h3>
              {loading && <span className="text-sm text-gray-500">Loading...</span>}
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Reporting</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reward</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Comm %</th>
                  <th className="py-3 px-4">Comm Amt</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredReferrals.length ? (
                  filteredReferrals.map((referral) => {
                    const commissionAmt = calcCommissionAmt(referral);
                    return (
                      <tr key={referral._id} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4 whitespace-nowrap">{referral.referrer}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{referral.referred}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{referral.phone}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{referral.executive || "-"}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[referral.status] || "bg-gray-100 text-gray-700"}`}>
                            {referral.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {referral.status === "Booked" ? formatCurrency(parseCurrency(referral.reward) || rewardValue, currencySymbol) : "Pending"}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">{referral.originalPrice ? formatCurrency(parseCurrency(referral.originalPrice), currencySymbol) : "-"}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{referral.commissionPct ? `${parsePct(referral.commissionPct)}%` : "-"}</td>
                        <td className="py-3 px-4 whitespace-nowrap">{commissionAmt ? formatCurrency(commissionAmt, currencySymbol) : "-"}</td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex gap-2 items-center">
                            <button
                              onClick={() => openEditModal(referral)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Edit"
                            >
                              <IEdit />
                            </button>
                            {referral.status !== "Booked" && (
                              <button
                                onClick={() => markAsBooked(referral._id)}
                                className="text-green-600 hover:text-green-800 text-xs font-medium flex items-center gap-1"
                              >
                                <IBooked /> Booked
                              </button>
                            )}
                            <button
                              onClick={() => deleteReferral(referral._id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <IClose />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-6 text-gray-500 italic">
                      {loading ? "Loading referrals..." : "No referrals found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <SummaryCard label="Total Referrals" value={summary.totalReferrals} color="blue" />
            <SummaryCard label="Booked" value={summary.totalBooked} color="green" />
            <SummaryCard label="Total Rewards" value={formatCurrency(summary.totalRewards, currencySymbol)} color="purple" />
            <SummaryCard label="Total Commission" value={formatCurrency(summary.totalCommission, currencySymbol)} color="indigo" />
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Edit Referral" : "Add Referral"}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <Field label="Referrer Name *">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.referrer}
              onChange={(e) => handleFormChange("referrer", e.target.value)}
            />
          </Field>
          <Field label="Client name *">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.referred}
              onChange={(e) => handleFormChange("referred", e.target.value)}
            />
          </Field>
          <Field label="Contact Number *">
            <input
              type="tel"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Relationship">
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.relation}
                onChange={(e) => handleFormChange("relation", e.target.value)}
              >
                <option value="">Select relationship</option>
                <option>Friend</option>
                <option>Family</option>
                <option>Colleague</option>
                <option>Neighbor</option>
              </select>
            </Field>
            <Field label="Status">
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Director Name">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.director}
              onChange={(e) => handleFormChange("director", e.target.value)}
            />
          </Field>
          <Field label="Executive Name">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.executive}
              onChange={(e) => handleFormChange("executive", e.target.value)}
            />
          </Field>
          <Field label="Venture (optional)">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.venture}
              onChange={(e) => handleFormChange("venture", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={`Original Price (${currencySymbol})`}>
              <input
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.originalPrice}
                onChange={(e) => handleFormChange("originalPrice", e.target.value)}
              />
            </Field>
            <Field label="Commission %">
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.commissionPct}
                onChange={(e) => handleFormChange("commissionPct", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              rows="2"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={form.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
            />
          </Field>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            {isEditing ? "Save Changes" : "Add Referral"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------
   SMALL SUBCOMPONENTS
   ------------------------------------------------------------------ */
function Field({ label, children }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  const colorMap = {
    blue: "bg-blue-50",
    green: "bg-green-50",
    purple: "bg-purple-50",
    indigo: "bg-indigo-50",
    gray: "bg-gray-50",
  };
  return (
    <div className={`${colorMap[color] || colorMap.gray} p-4 rounded-lg text-center`}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}