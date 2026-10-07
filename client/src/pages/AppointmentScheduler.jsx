import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../components/Modal';
import { toast } from '../components/Toast.jsx';

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled'];
const statusClasses = {
  Scheduled: 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};
const userId = localStorage.getItem("userId");

const emptyForm = {
  id: userId,
  client: '',
  date: '',
  time: '',
  assignedTo: '', // changed from Admin
  property: '',
  status: 'Scheduled',
};

const API_URL = 'http://localhost:5000/api/appointments';
const EMPLOYEE_API_URL = 'http://localhost:5000/api/employees';

const AppointmentScheduler = () => {
  const [appointments, setAppointments] = useState([]);
  const [employees, setEmployees] = useState([]); // renamed from admins
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetch(EMPLOYEE_API_URL)
      .then(res => res.json())
      .then(setEmployees)
      .catch(() => toast('Failed to load employees', 'error'));
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let url = API_URL;
      const params = [];
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (filterStatus) params.push(`status=${encodeURIComponent(filterStatus)}`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await fetch(url);
      const data = await res.json();
      setAppointments(data);
    } catch {
      toast('Failed to fetch appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [search, filterStatus]);

  const filteredAppointments = useMemo(() => appointments, [appointments]);

  const todayISO = () => new Date().toISOString().slice(0, 10);

  const openAddModal = () => {
    setForm({ ...emptyForm, date: todayISO(), time: '10:00' });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = app => {
    setForm({ ...app, id: app._id }); // MongoDB _id to id
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.client.trim() || !form.date || !form.time) {
      toast('Client name, date, and time are required.', 'error');
      return;
    }

    try {
      if (isEditing && form.id) {
        const res = await fetch(`${API_URL}/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast('Appointment updated successfully.', 'success');
      } else {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast('Appointment scheduled successfully.', 'success');
      }
      setModalOpen(false);
      fetchAppointments();
    } catch {
      toast('Failed to save appointment.', 'error');
    }
  };

  const cancelAppointment = async id => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });
      toast('Appointment cancelled.', 'info');
      fetchAppointments();
    } catch {
      toast('Error cancelling appointment.', 'error');
    }
  };

  const markCompleted = async id => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });
      toast('Appointment marked as completed.', 'success');
      fetchAppointments();
    } catch {
      toast('Error marking appointment completed.', 'error');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Appointment Scheduler</h2>
          <p className="text-gray-600">Schedule and manage appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search client, assigned to, property"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="relative">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          </div>
          <button
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            className="bg-gray-200 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
          >
            {viewMode === 'list' ? 'Calendar View' : 'List View'}
          </button>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center"
          >
            <i className="fas fa-plus mr-2" /> Schedule
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <th className="py-4 px-6">Client</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Time</th>
                  <th className="py-4 px-6">Assigned To</th>
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-500 italic">
                      Loading...
                    </td>
                  </tr>
                ) : filteredAppointments.length ? (
                  filteredAppointments.map(app => (
                    <tr key={app._id || app.id} className="border-t hover:bg-gray-50">
                      <td className="py-4 px-6">{app.client}</td>
                      <td className="py-4 px-6">{app.date}</td>
                      <td className="py-4 px-6">{app.time}</td>
                      <td className="py-4 px-6">{app.assignedTo}</td>
                      <td className="py-4 px-6">{app.property}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[app.status] || 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {app.status === 'Scheduled' && (
                            <>
                              <button
                                onClick={() => markCompleted(app._id || app.id)}
                                className="text-green-600 hover:text-green-800 text-xs font-medium"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => cancelAppointment(app._id || app.id)}
                                className="text-red-600 hover:text-red-800 text-xs font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => openEditModal(app)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <i className="fas fa-edit" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-500 italic">
                      No appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments.map(app => (
              <div key={app._id || app.id} className="border rounded-lg p-4 hover:shadow-md">
                <p className="font-semibold">{app.client}</p>
                <p className="text-sm text-gray-600">{app.date} at {app.time}</p>
                <p className="text-sm">{app.assignedTo}</p>
                <p className="text-xs text-gray-500">{app.property}</p>
                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${statusClasses[app.status] || 'bg-gray-100 text-gray-700'
                    }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Appointment' : 'Schedule Appointment'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client *
            </label>
            <input
              type="text"
              value={form.client}
              onChange={e => handleFormChange('client', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={e => handleFormChange('date', e.target.value)}
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
                onChange={e => handleFormChange('time', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Employee
            </label>
            <select
              value={form.assignedTo}
              onChange={e => handleFormChange('assignedTo', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp.firstName}>
                  {emp.firstName} ({emp.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property
            </label>
            <input
              type="text"
              value={form.property}
              onChange={e => handleFormChange('property', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={form.status}
              onChange={e => handleFormChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            {isEditing ? 'Save Changes' : 'Schedule'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default AppointmentScheduler;
