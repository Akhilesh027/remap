import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../components/Modal';
import { toast } from '../components/Toast.jsx';
import { mockData } from '../utils/data';

const STATUS_OPTIONS = ['Visited', 'Converted'];
const statusClasses = {
  Visited: 'bg-blue-100 text-blue-700',
  Converted: 'bg-green-100 text-green-700',
};
const emptyForm = {
  id: null,
  name: '',
  phone: '',
  purpose: '',
  status: 'Visited',
  notes: '',
  assigned: '',
};

const API_URL = 'http://localhost:5000/api/walkins'; // Change this base URL if needed

const Walkins = () => {
  const [walkins, setWalkins] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [employees, setEmployees] = useState([]);

  // Fetch employees on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/employees')
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch(() => toast('Failed to load employees', 'error'));
  }, []);
  // ---------- Fetch Walk-ins ----------
  const fetchWalkins = async () => {
    setLoading(true);
    try {
      let url = API_URL;
      const params = [];
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      if (filterStatus) params.push(`status=${encodeURIComponent(filterStatus)}`);
      if (params.length) url += `?${params.join('&')}`;
      const res = await fetch(url);
      const data = await res.json();
      setWalkins(data);
    } catch (err) {
      toast('Failed to fetch walk-ins.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalkins();
    // eslint-disable-next-line
  }, [search, filterStatus]);

  // ---------- Derived ----------
  const filteredWalkins = useMemo(() => walkins, [walkins]);
  const totalWalkins = walkins.length;
  const convertedCount = walkins.filter(w => w.status === 'Converted').length;
  const conversionRate = totalWalkins ? ((convertedCount / totalWalkins) * 100).toFixed(1) : 0;

  // ---------- Modal helpers ----------
  const openAddModal = () => {
    setForm({ ...emptyForm });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = w => {
    setForm({ ...w, id: w._id }); // Assuming MongoDB `_id`
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  // ---------- Submit ----------
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast('Name and phone are required.', 'error');
      return;
    }
    try {
      if (isEditing && form.id) {
        // Update
        const res = await fetch(`${API_URL}/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast('Walk-in updated successfully.', 'success');
      } else {
        // Create
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast('Walk-in added successfully.', 'success');
      }
      setModalOpen(false);
      fetchWalkins();
    } catch (err) {
      toast('Failed to save walk-in.', 'error');
    }
  };

  // ---------- Actions ----------
  const markConverted = async id => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Converted' }),
      });
      toast('Marked as converted.', 'success');
      fetchWalkins();
    } catch (err) {
      toast('Failed to mark converted.', 'error');
    }
  };

  const deleteWalkin = async id => {
    if (!window.confirm('Delete this walk-in?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      toast('Walk-in deleted.', 'info');
      fetchWalkins();
    } catch (err) {
      toast('Failed to delete walk-in.', 'error');
    }
  };

  // ---------- Export CSV ----------
  const exportCSV = () => {
    if (!filteredWalkins.length) {
      toast('No data to export.', 'warning');
      return;
    }
    const headers = ['Name', 'Phone', 'Purpose', 'Status', 'Notes', 'Assigned'];
    const rows = filteredWalkins.map(w => [
      w.name,
      w.phone,
      w.purpose,
      w.status,
      w.notes,
      w.assigned || '',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'walkins.csv';
    link.click();
    toast('Exported as CSV.', 'success');
  };

  // ---------- Render ----------
  return (
    <div>
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Total Walk-ins</p>
          <p className="text-3xl font-bold">{totalWalkins}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Converted</p>
          <p className="text-3xl font-bold">{convertedCount}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-3xl font-bold">{conversionRate}%</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Walk-ins</h2>
          <p className="text-gray-600">Track and log walk-in clients</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search name or phone"
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
            onClick={exportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center"
          >
            <i className="fas fa-file-export mr-2" /> Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center"
          >
            <i className="fas fa-plus mr-2" /> Add Walk-in
          </button>
        </div>
      </div>

      {/* Walk-ins Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-left">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Phone</th>
                <th className="py-4 px-6">Purpose</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Notes</th>
                <th className="py-4 px-6">Assigned To</th>
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
              ) : filteredWalkins.length ? (
                filteredWalkins.map(w => (
                  <tr key={w._id || w.id} className="border-t hover:bg-gray-50">
                    <td className="py-4 px-6">{w.name}</td>
                    <td className="py-4 px-6">{w.phone}</td>
                    <td className="py-4 px-6">{w.purpose || '—'}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[w.status] || 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">{w.notes || '—'}</td>
                    <td className="py-4 px-6">{w.assigned || 'Unassigned'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {w.status === 'Visited' && (
                          <button
                            onClick={() => markConverted(w._id || w.id)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium"
                          >
                            Convert
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(w)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          onClick={() => deleteWalkin(w._id || w.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-gray-500 italic">
                    No walk-ins found.
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
        title={isEditing ? 'Edit Walk-in' : 'Add Walk-in'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleFormChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone *
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={e => handleFormChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <input
              type="text"
              value={form.purpose}
              onChange={e => handleFormChange('purpose', e.target.value)}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows="2"
              value={form.notes}
              onChange={e => handleFormChange('notes', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Staff
            </label>
            <select
              value={form.assigned}
              onChange={e => handleFormChange('assigned', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select staff</option>
              {employees
                .filter(emp => emp.role !== "Driver")
                .map(emp => (
                  <option key={emp._id} value={emp.firstName}>
                    {emp.firstName} ({emp.role})
                  </option>
                ))}
            </select>

          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
          >
            {isEditing ? 'Save Changes' : 'Add Walk-in'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Walkins;
