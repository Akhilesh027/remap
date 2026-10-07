import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import Modal from "../components/Modal";
import { toast } from "../components/Toast.jsx";

const API_URL = "http://localhost:5000/api/cabs";
const DRIVER_API = "http://localhost:5000/api/driver";

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Cancelled"];
const statusClasses = {
  Pending: "bg-yellow-100 text-yellow-700",
  "In Progress": "bg-indigo-100 text-indigo-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const user = JSON.parse(localStorage.getItem("user"));

const emptyForm = {
  id: null,
  executive: user?.name || "Unknown",
  pickup: "",
  destination: "",
  date: "",
  time: "",
  purpose: "",
  driver: "",
};

function CabBookings() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const isDriver = user?.role?.toLowerCase() === "driver";
  const myName = user?.name;

  useEffect(() => {
    fetchBookings();
    fetchDrivers();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(API_URL);
      setBookings(res.data);
    } catch {
      toast("Failed to fetch cab bookings", "error");
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(DRIVER_API);
      setDrivers(res.data);
    } catch {
      toast("Failed to fetch drivers", "error");
    }
  };

  const visibleBookings = useMemo(() => {
    let list = bookings;

    if (user && !isDriver) {
      list = list.filter((b) => b.executive === myName);
    }

    const s = search.trim().toLowerCase();
    if (s) {
      list = list.filter(
        (b) =>
          b.pickup.toLowerCase().includes(s) ||
          b.destination.toLowerCase().includes(s) ||
          b.executive.toLowerCase().includes(s)
      );
    }

    if (filterStatus) {
      list = list.filter((b) => b.status === filterStatus);
    }

    return list.slice().sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [bookings, user, isDriver, myName, search, filterStatus]);

  const openRequestModal = () => {
    setForm({
      ...emptyForm,
      date: new Date().toISOString().slice(0, 10),
      time: "09:00",
      purpose: "Client Meeting",
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (bk) => {
    setForm({
      id: bk._id,
      executive: myName,
      pickup: bk.pickup,
      destination: bk.destination,
      date: bk.date || bk.time.slice(0, 10),
      time: bk.time.slice(11, 16),
      purpose: bk.purpose || "",
      driver: bk.driver?._id || "",
    });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleFormChange = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pickup.trim() || !form.destination.trim() || !form.date || !form.time) {
      toast("Please fill required fields.", "error");
      return;
    }

    const payload = {
      executive: myName || "Unknown",
      pickup: form.pickup,
      destination: form.destination,
      date: form.date,
      time: `${form.date}T${form.time}`,
      purpose: form.purpose,
      driver: form.driver || null,
    };

    try {
      if (isEditing && form.id) {
        await axios.put(`${API_URL}/${form.id}`, payload);
        toast("Cab booking updated.", "success");
      } else {
        await axios.post(API_URL, payload);
        toast("Cab requested.", "success");
      }
      setModalOpen(false);
      fetchBookings();
    } catch {
      toast("Error saving cab booking", "error");
    }
  };

  const cancelBooking = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/status`, { status: "Cancelled" });
      toast("Cab booking cancelled.", "info");
      fetchBookings();
    } catch {
      toast("Error cancelling booking", "error");
    }
  };

  const driverStart = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/status`, {
        status: "In Progress",
        driver: user?._id,
      });
      toast("Ride started.", "success");
      fetchBookings();
    } catch {
      toast("Error starting ride", "error");
    }
  };

  const driverComplete = async (id) => {
    try {
      await axios.patch(`${API_URL}/${id}/status`, { status: "Completed" });
      toast("Ride completed.", "success");
      fetchBookings();
    } catch {
      toast("Error completing ride", "error");
    }
  };

  const RowActions = ({ bk }) => {
    if (!isDriver) {
      return (
        <div className="flex items-center gap-2">
          {bk.status === "Pending" && (
            <>
              <button onClick={() => openEditModal(bk)} className="text-blue-500 hover:text-blue-700">
                <i className="fas fa-edit" />
              </button>
              <button onClick={() => cancelBooking(bk._id)} className="text-red-600 hover:text-red-800 text-xs font-medium">
                Cancel
              </button>
            </>
          )}
          {bk.status === "In Progress" && <span className="text-xs text-gray-500 italic">En route</span>}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        {bk.status === "Pending" && (
          <button
            onClick={() => driverStart(bk._id)}
            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
          >
            Start
          </button>
        )}
        {bk.status === "In Progress" && (
          <button
            onClick={() => driverComplete(bk._id)}
            className="text-green-600 hover:text-green-800 text-xs font-medium"
          >
            Complete
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Cab Bookings</h2>
          <p className="text-gray-600">{isDriver ? "View and manage rides assigned to you." : "Request and track your cab bookings."}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search pickup / destination"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="relative">
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
            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          </div>
          {!isDriver && (
            <button
              onClick={openRequestModal}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center"
            >
              <i className="fas fa-plus mr-2" /> Request Cab
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="py-3 px-4">Pickup</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time</th>
                {isDriver && <th className="py-3 px-4">Executive</th>}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleBookings.length ? (
                visibleBookings.map((bk) => {
                  const driverName = drivers.find((d) => d._id === bk.driver)?.firstName || "—";

                  return (
                    <tr key={bk._id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4">{bk.pickup}</td>
                      <td className="py-3 px-4">{bk.destination}</td>
                      <td className="py-3 px-4">{bk.date}</td>
                      <td className="py-3 px-4">{bk.time.slice(11, 16)}</td>
                      {isDriver && <td className="py-3 px-4">{bk.executive}</td>}
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[bk.status] || "bg-gray-100 text-gray-700"
                          }`}>
                          {bk.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{driverName}</td>
                      <td className="py-3 px-4">
                        <RowActions bk={bk} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={isDriver ? 8 : 7} className="py-6 text-center text-gray-500 italic">
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={isEditing ? "Edit Cab Booking" : "Request Cab"}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *{myName}</label>
            <input type="text" value={form.executive} readOnly className="w-full border border-gray-300 rounded-lg px-4 py-2" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location *</label>
            <input
              type="text"
              value={form.pickup}
              onChange={(e) => handleFormChange("pickup", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => handleFormChange("destination", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => handleFormChange("time", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <select
              value={form.purpose}
              onChange={(e) => handleFormChange("purpose", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select purpose</option>
              <option>Client Meeting</option>
              <option>Property Visit</option>
              <option>Office Transfer</option>
              <option>Other</option>
            </select>
          </div>

          {user?.role?.toLowerCase() === "executive" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
              <select
                value={form.driver}
                onChange={(e) => handleFormChange("driver", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select driver</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.firstName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
            {isEditing ? "Save Changes" : "Submit Request"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default CabBookings;
