import React, { useState, useEffect } from "react";
import WalkInForm from "./Walkinform";
import AppointmentForm from "./Apointmentform";
import axios from "axios";
import { toast } from "../components/Toast.jsx";

const ReceptionistDashboard = ({ STATUS_OPTIONS = [], mockData = { users: {} } }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id || null;

  const [isWalkinModalOpen, setWalkinModalOpen] = useState(false);
  const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [walkins, setWalkins] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingWalkins, setLoadingWalkins] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Fetch walk-ins filtered to current user
  const fetchWalkins = async () => {
    if (!userId) return;
    setLoadingWalkins(true);
    try {
      const res = await axios.get("http://localhost:5000/api/walkins");
      const filtered = res.data.filter(w => w.createdBy === userId);
      setWalkins(filtered);
    } catch {
      toast("Failed to fetch walk-ins", "error");
    } finally {
      setLoadingWalkins(false);
    }
  };

  const fetchAppointments = async () => {
    if (!userId) return;
    setLoadingAppointments(true);
    try {
      const res = await axios.get("http://localhost:5000/api/appointments");
      const filtered = res.data.filter(appt => appt.createdBy === userId);
      setAppointments(filtered);
    } catch {
      toast("Failed to fetch appointments", "error");
    } finally {
      setLoadingAppointments(false);
    }
  };

  useEffect(() => {
    fetchWalkins();
    fetchAppointments();
  }, [userId]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Visited":
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Converted":
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Receptionist Dashboard</h1>
          <p className="text-gray-600">Manage walk-ins and appointments efficiently</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 flex items-center"
            onClick={() => setWalkinModalOpen(true)}
          >
            <i className="fas fa-plus mr-2"></i>
            Add Walk-in
          </button>

          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 flex items-center"
            onClick={() => setAppointmentModalOpen(true)}
          >
            <i className="fas fa-calendar-alt mr-2"></i>
            Schedule Appointment
          </button>
        </div>

        {/* Walk-in and Appointment Modals */}
        {isWalkinModalOpen && (
          <WalkInForm
            STATUS_OPTIONS={STATUS_OPTIONS}
            mockData={mockData}
            onClose={() => setWalkinModalOpen(false)}
            onRefresh={fetchWalkins}
          />
        )}
        {isAppointmentModalOpen && (
          <AppointmentForm
            STATUS_OPTIONS={STATUS_OPTIONS}
            onClose={() => setAppointmentModalOpen(false)}
            onRefresh={fetchAppointments}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Walk-ins</p>
            <h2 className="text-2xl font-bold">{walkins.length}</h2>
          </div>
          <i className="fas fa-user-plus text-blue-500 text-3xl"></i>
        </div>
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Today’s Appointments</p>
            <h2 className="text-2xl font-bold">{appointments.length}</h2>
          </div>
          <i className="fas fa-calendar text-indigo-500 text-3xl"></i>
        </div>
        {/* Add other stats if needed */}
      </div>

      {/* Walk-ins Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Your Walk-ins</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Purpose</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Notes</th>
                <th className="px-6 py-3">Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {loadingWalkins ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500 italic">Loading...</td>
                </tr>
              ) : walkins.length > 0 ? (
                walkins.map(w => (
                  <tr key={w._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3">{w.name}</td>
                    <td className="px-6 py-3">{w.phone}</td>
                    <td className="px-6 py-3">{w.purpose}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(w.status)}`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{w.notes || "—"}</td>
                    <td className="px-6 py-3">{w.assigned || "Unassigned"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-gray-500 italic">No walk-ins found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">Your Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left">
                <th className="px-6 py-3">Client</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Executive</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingAppointments ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500 italic">Loading...</td>
                </tr>
              ) : appointments.length > 0 ? (
                appointments.map(({ _id, client, date, time, executive, status }) => (
                  <tr key={_id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3">{client}</td>
                    <td className="px-6 py-3">{date}</td>
                    <td className="px-6 py-3">{time}</td>
                    <td className="px-6 py-3">{executive}</td>
                    <td className="px-6 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500 italic">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
