import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import { toast } from "../components/Toast.jsx";

const STATUS_OPTIONS = ["Scheduled", "Completed", "Cancelled"];

const statusClasses = {
  Scheduled: "bg-indigo-100 text-indigo-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const emptyForm = {
  id: null,
  client: "",
  date: "",
  time: "",
  executiveId: "",
  executiveName: "",
  property: "",
  status: "Scheduled",
  notes: "",
};

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [executives, setExecutives] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  /* ---------- Fetch Appointments & Executives ---------- */
  useEffect(() => {
    fetchAppointments();
    fetchExecutives();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/appointments");
      setAppointments(res.data);
    } catch (err) {
      toast("Error fetching appointments", "error");
    }
  };

  const fetchExecutives = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/executives");
      setExecutives(res.data);
    } catch (err) {
      toast("Error fetching executives", "error");
    }
  };

  /* ---------- Derived ---------- */
  const filteredAppointments = useMemo(() => {
    const s = search.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchSearch =
        !s ||
        a.client?.toLowerCase().includes(s) ||
        a.executiveName?.toLowerCase().includes(s) ||
        a.property?.toLowerCase().includes(s);
      const matchStatus = filterStatus ? a.status === filterStatus : true;
      return matchSearch && matchStatus;
    });
  }, [appointments, search, filterStatus]);

  /* ---------- Helpers ---------- */
  const todayISO = () => new Date().toISOString().slice(0, 10);

  const openAddModal = () => {
    setForm({
      ...emptyForm,
      date: todayISO(),
      time: "09:00",
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (appt) => {
    setForm({ ...emptyForm, ...appt, id: appt._id });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  /* ---------- Submit ---------- */
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.client.trim() ||
      !form.date ||
      !form.time ||
      !form.executiveId ||
      !form.property.trim()
    ) {
      toast("Please fill all required fields.", "error");
      return;
    }

    try {
      const userId = localStorage.getItem("userId"); // or from auth context
      const payload = { ...form, id: userId };

      if (isEditing && form.id) {
        await axios.put(`http://localhost:5000/api/appointments/${form.id}`, payload);
        toast("Appointment updated successfully.", "success");
      } else {
        await axios.post("http://localhost:5000/api/appointments", payload);
        toast("Appointment scheduled and notification sent to executive.", "success");
      }

      fetchAppointments();
      setModalOpen(false);
    } catch (err) {
      toast("Error saving appointment", "error");
    }
  };

  /* ---------- Actions ---------- */
  const markCompleted = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        status: "Completed",
      });
      fetchAppointments();
      toast("Appointment marked completed.", "success");
    } catch (err) {
      toast("Error updating appointment", "error");
    }
  };

  const confirmDelete = (id) => setDeleteId(id);
  const cancelDelete = () => setDeleteId(null);

  const doDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${deleteId}`);
      fetchAppointments();
      toast("Appointment deleted.", "info");
      setDeleteId(null);
    } catch (err) {
      toast("Error deleting appointment", "error");
    }
  };

  /* ---------- Render ---------- */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Appointments</h2>
          <p className="text-gray-600">View and manage all scheduled appointments</p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search client / executive / property"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Schedule Appointment
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="py-4 px-6">Client</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Time</th>
                <th className="py-4 px-6">Executive</th>
                <th className="py-4 px-6">Property</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length ? (
                filteredAppointments.map((app) => (
                  <tr key={app._id} className="border-t hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-medium">{app.client}</td>
                    <td className="py-4 px-6">{app.date}</td>
                    <td className="py-4 px-6">{app.time}</td>
                    <td className="py-4 px-6">{app.executiveName}</td>
                    <td className="py-4 px-6">{app.property}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[app.status] || "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          title="Edit"
                          onClick={() => openEditModal(app)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        {app.status !== "Completed" && (
                          <button
                            title="Mark Completed"
                            onClick={() => markCompleted(app._id)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            Done
                          </button>
                        )}
                        <button
                          title="Delete"
                          onClick={() => confirmDelete(app._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      {deleteId === app._id && (
                        <div className="mt-2 text-xs text-gray-600 flex gap-2 items-center">
                          Delete?
                          <button
                            onClick={doDelete}
                            className="px-2 py-0.5 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={cancelDelete}
                            className="px-2 py-0.5 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            No
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500 italic">
                    No appointments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Edit Appointment" : "Schedule Appointment"}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client *
            </label>
            <input
              type="text"
              value={form.client}
              onChange={(e) => handleFormChange("client", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date / Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleFormChange("time", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Executive Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Executive *
            </label>
            <select
              value={form.executiveId}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedExec = executives.find((ex) => ex._id === selectedId);
                handleFormChange("executiveId", selectedId);
                handleFormChange("executiveName", selectedExec ? selectedExec.name : "");
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">-- Select Executive --</option>
              {executives.map((ex) => (
                <option key={ex._id} value={ex._id}>
                  {ex.name}
                </option>
              ))}
            </select>
          </div>

          {/* Property */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property *
            </label>
            <input
              type="text"
              value={form.property}
              onChange={(e) => handleFormChange("property", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            {isEditing ? "Save Changes" : "Schedule"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
