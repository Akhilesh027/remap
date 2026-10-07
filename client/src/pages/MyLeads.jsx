// src/pages/TelecallerLeads.js
import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../components/Modal.js';
import { toast } from '../components/Toast.jsx';

const STATUS_OPTIONS = ['New', 'Follow-up', 'Interested', 'Booked'];

const statusClasses = {
  New: 'bg-blue-100 text-blue-700',
  'Follow-up': 'bg-yellow-100 text-yellow-700',
  Interested: 'bg-indigo-100 text-indigo-700',
  Booked: 'bg-green-100 text-green-700',
};

const emptyForm = {
  _id: null,
  name: '',
  contact: '',
  email: '',
  source: '',
  project: '',
  status: 'New',
  assignedTo: null,
};

const MyLeads = () => {
  const user = JSON.parse(localStorage.getItem('user')); // object
  const userId = localStorage.getItem('userId');         // string
  const token = localStorage.getItem('token');           // string
  const userRole = localStorage.getItem('role');         // Get user role

  const [allLeads, setAllLeads] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------- Fetch leads from backend ---------- */
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('http://localhost:5000/api/leads', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch leads');

        const data = await res.json();

        // For ALL users, only show leads assigned to them
        const filteredLeads = data.filter(lead =>
          lead.assignedTo && lead.assignedTo._id === userId
        );
        setAllLeads(filteredLeads || []);
      } catch (err) {
        console.error(err);
        toast('Error fetching leads', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) fetchLeads();
  }, [token, userId]);

  /* ---------- Filter & Search ---------- */
  const filteredLeads = useMemo(() => {
    const s = search.toLowerCase();
    return allLeads.filter(l => {
      const matchSearch =
        !s ||
        l.name.toLowerCase().includes(s) ||
        (l.contact && l.contact.includes(s)) ||
        (l.email && l.email.toLowerCase().includes(s));
      const matchStatus = filterStatus ? l.status === filterStatus : true;
      return matchSearch && matchStatus;
    });
  }, [allLeads, search, filterStatus]);

  /* ---------- Modal Helpers ---------- */
  const openAddModal = () => {
    setForm({
      ...emptyForm,
      assignedTo: { _id: userId, name: user.name, role: userRole }
    });
    setIsEditing(false);
    setModalOpen(true);
  };

  const openEditModal = lead => {
    setForm({ ...lead });
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) {
      toast('Name and Phone are required.', 'error');
      return;
    }

    try {
      if (isEditing && form._id) {
        // Update existing lead
        const res = await fetch(`http://localhost:5000/api/leads/${form._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed to update lead');
        toast('Lead updated successfully.', 'success');
      } else {
        // Add new lead - ensure assignedTo is properly formatted
        const leadData = {
          ...form,
          assignedTo: { _id: userId, name: user.name, role: userRole }
        };

        const res = await fetch(`http://localhost:5000/api/leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(leadData),
        });
        if (!res.ok) throw new Error('Failed to add lead');
        toast('Lead added successfully.', 'success');
      }

      // Refresh leads
      const res = await fetch('http://localhost:5000/api/leads', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to refresh leads');

      const data = await res.json();

      // Filter to show only leads assigned to the current user
      const filteredLeads = data.filter(lead =>
        lead.assignedTo && lead.assignedTo._id === userId
      );
      setAllLeads(filteredLeads || []);

      setModalOpen(false);
    } catch (err) {
      console.error(err);
      toast('Error saving lead', 'error');
    }
  };
  const makeCall = async (lead) => {
    toast(`Calling ${lead.contact}...`, 'info');
    window.open(`tel:${lead.contact}`);

    try {
      // Create call log
      const callLog = {
        leadId: lead._id,
        userId: userId,
        timestamp: new Date().toISOString(),
      };
      const res = await fetch('http://localhost:5000/api/calllogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(callLog),
      });
      if (!res.ok) throw new Error('Failed to log call');

      const createdCallLog = await res.json();
      toast('Call logged successfully.', 'success');

      // Here you can update the call log after getting call duration
      // For example, after call ends or on user input
      // await updateCallLog(createdCallLog._id, { duration: callDurationSeconds });

    } catch (error) {
      console.error(error);
      toast('Failed to log call.', 'error');
    }
  };


  const sendEmail = email => {
    toast(`Opening email to ${email}...`, 'info');
    window.open(`mailto:${email}`);
  };

  /* ---------- Render ---------- */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Leads</h2>
          <p className="text-gray-600">Leads assigned to {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, phone, or email"
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
            onClick={openAddModal}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center"
          >
            <i className="fas fa-plus mr-2" /> Add Lead
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Leads Table */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-left">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Source</th>
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Created Date</th>
                  <th className="py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length ? (
                  filteredLeads.map(lead => (
                    <tr key={lead._id} className="border-t hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium">{lead.name}</td>
                      <td className="py-4 px-6">{lead.contact}</td>
                      <td className="py-4 px-6">{lead.email}</td>
                      <td className="py-4 px-6">{lead.source}</td>
                      <td className="py-4 px-6">{lead.project}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[lead.status] || 'bg-gray-100 text-gray-700'
                            }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => makeCall(lead.contact)}
                            title="Call"
                            className="text-green-600 hover:text-green-800"
                          >
                            <i className="fas fa-phone" />
                          </button>
                          {lead.email && (
                            <button
                              onClick={() => sendEmail(lead.email)}
                              title="Email"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <i className="fas fa-envelope" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(lead)}
                            title="Edit"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            <i className="fas fa-edit" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-6 text-center text-gray-500 italic"
                    >
                      No leads assigned to you.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal (Add/Edit) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Lead' : 'Add Lead'}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleFormChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="text"
              value={form.contact}
              onChange={e => handleFormChange('contact', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => handleFormChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <input
              type="text"
              value={form.source}
              onChange={e => handleFormChange('source', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <input
              type="text"
              value={form.project}
              onChange={e => handleFormChange('project', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
            {isEditing ? 'Save Changes' : 'Add Lead'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default MyLeads;