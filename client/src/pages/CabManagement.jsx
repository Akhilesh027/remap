// src/pages/CabManagement.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import { toast } from "../components/Toast.jsx";

const STATUS_OPTIONS = ["Pending", "Confirmed", "Completed"];
const userId = localStorage.getItem("userId");
const statusClasses = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-indigo-100 text-indigo-700",
  Completed: "bg-green-100 text-green-700",
};

const defaultForm = {
  id: userId,
  executive: "",
  pickup: "",
  destination: "",
  time: "",
  status: "Pending",
  driver: "",
};

const CabManagement = () => {
  const [cabs, setCabs] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  /* ----------------- Fetch Data ----------------- */
  useEffect(() => {
    fetchCabs();
    fetchDrivers();
  }, []);

  const fetchCabs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/cabs");
      setCabs(res.data);
    } catch (err) {
      toast("Failed to load cab bookings.", "error");
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/drivers");
      setDrivers(res.data);
      console.log("Drivers fetched:", res.data);
    } catch (err) {
      toast("Failed to load drivers.", "error");
    }
  };

  /* ----------------- Filtered List ----------------- */
  const filteredCabs = useMemo(() => {
    const s = search.toLowerCase();
    return cabs.filter((c) => {
      const matchSearch =
        !s ||
        c.executive.toLowerCase().includes(s) ||
        c.pickup.toLowerCase().includes(s) ||
        c.destination.toLowerCase().includes(s);
      const matchStatus = filterStatus ? c.status === filterStatus : true;
      return matchSearch && matchStatus;
    });
  }, [cabs, search, filterStatus]);

  /* ----------------- Form Helpers ----------------- */
  const openAddModal = () => {
    setForm({
      ...defaultForm,
      time: new Date().toISOString().slice(0, 16),
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (cab) => {
    const cleanTime = cab.time?.slice(0, 16) || "";
    setForm({
      ...cab,
      time: cleanTime,
      driver: cab.driver?._id ? String(cab.driver._id) : String(cab.driver || ""),
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.executive.trim() ||
      !form.pickup.trim() ||
      !form.destination.trim() ||
      !form.time
    ) {
      toast("Please fill all required fields.", "error");
      return;
    }

    try {
      // Extract date from the time field to satisfy backend validation
      const payload = {
        ...form,
        date: form.time.split('T')[0], // Get YYYY-MM-DD from datetime string
      };

      let response;
      if (isEditing && form._id) {
        response = await axios.put(`http://localhost:5000/api/cabs/${form._id}`, payload);
        toast("Booking updated.", "success");
      } else {
        response = await axios.post("http://localhost:5000/api/cabs", payload);
        toast("Booking added.", "success");

        // If you want to do something with the notification
        if (response.data.notification) {
          console.log("Notification created:", response.data.notification);
        }
      }

      setModalOpen(false);
      fetchCabs();
    } catch (err) {
      toast("Failed to save booking.", "error");
      console.error("Submission error:", err);
    }
  };

  /* ----------------- Actions ----------------- */
  const changeStatus = async (id, nextStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/cabs/${id}/status`, {
        status: nextStatus,
      });
      toast(`Status changed to ${nextStatus}.`, "success");
      fetchCabs();
    } catch (err) {
      toast("Failed to update status.", "error");
    }
  };

  const deleteBooking = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/cabs/${id}`);
      toast("Booking deleted.", "info");
      fetchCabs();
    } catch (err) {
      toast("Failed to delete booking.", "error");
    }
  };

  /* ----------------- Render ----------------- */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cab Management</h2>
          <p className="text-gray-600">Manage cab bookings for executives</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by executive / pickup / destination"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <i className="fas fa-plus mr-2"></i> Add Booking
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Pickup</th>
                <th className="py-4 px-6">Destination</th>
                <th className="py-4 px-6">Time</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Driver</th>
                <th className="py-4 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCabs.length ? (
                filteredCabs.map((cab) => {
                  let driverName = "Unassigned";

                  if (cab.driver && typeof cab.driver === "object") {
                    driverName = `${cab.driver.firstName} ${cab.driver.lastName}`;
                  } else if (cab.driver) {
                    const found = drivers.find(
                      (d) => d._id.toString() === cab.driver.toString()
                    );
                    if (found) driverName = `${found.name}`;
                  }

                  return (
                    <tr key={cab._id} className="border-t hover:bg-gray-50">
                      <td className="py-4 px-6">{cab.executive}</td>
                      <td className="py-4 px-6">{cab.pickup}</td>
                      <td className="py-4 px-6">{cab.destination}</td>
                      <td className="py-4 px-6">
                        {cab.time ? new Date(cab.time).toLocaleString() : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[cab.status] ||
                            "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {cab.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">{driverName}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(cab)}
                            title="Edit"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {cab.status === "Pending" && (
                            <button
                              onClick={() => changeStatus(cab._id, "Confirmed")}
                              className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                            >
                              Confirm
                            </button>
                          )}
                          {cab.status === "Confirmed" && (
                            <button
                              onClick={() => changeStatus(cab._id, "Completed")}
                              className="text-green-600 hover:text-green-800 text-xs font-medium"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => deleteBooking(cab._id)}
                            title="Delete"
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? "Edit Cab Booking" : "Add Cab Booking"}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Executive Name *
            </label>
            <input
              type="text"
              value={form.executive}
              onChange={(e) => handleFormChange("executive", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter executive name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location *
              </label>
              <input
                type="text"
                value={form.pickup}
                onChange={(e) => handleFormChange("pickup", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter pickup location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <input
                type="text"
                value={form.destination}
                onChange={(e) => handleFormChange("destination", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter destination"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.time}
              onChange={(e) => handleFormChange("time", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign Driver
            </label>
            <select
              value={form.driver}
              onChange={(e) => handleFormChange("driver", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select driver</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              {isEditing ? "Update Booking" : "Add Booking"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CabManagement;