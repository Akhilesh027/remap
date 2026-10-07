import React, { useState, useEffect, useMemo } from 'react';
import { mockData } from '../utils/data';
import { toast } from '../components/Toast.jsx';

/* -------------------------------------------------------------
 * Helpers / constants
 * ------------------------------------------------------------- */
const STATUS_COLORS = {
  New: 'bg-indigo-100 text-indigo-800',
  'Follow-up': 'bg-yellow-100 text-yellow-800',
  Interested: 'bg-green-100 text-green-800',
  Booked: 'bg-red-100 text-red-800',
};

const emptyContact = {
  id: null,
  name: '',
  phone: '',
  email: '',
  status: 'New',
  assigned: '',
  source: '',
  campaign: '',
  notes: '',
};

/* -------------------------------------------------------------
 * Component
 * ------------------------------------------------------------- */
const CustomerContacts = () => {
  /* ---------------- State ---------------- */
  // All contacts: we seed from leads, but allow user-added contacts too.
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Export dropdown
  const [exportOpen, setExportOpen] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view | edit | add
  const [form, setForm] = useState(emptyContact);

  /* ---------------- Effects ---------------- */
  // Seed from leads one time
  useEffect(() => {
    const seeded = mockData.leads.map((l) => ({
      id: l.id, // share id; user-added contacts will get new ids > max
      name: l.name,
      phone: l.phone,
      email: l.email || '',
      status: l.status,
      assigned: l.assigned || '',
      source: l.source || '',
      campaign: l.campaign || '',
      notes: l.notes || '',
      // allow extension
    }));
    setContacts(seeded);
  }, []);

  /* ---------------- Derived ---------------- */
  const assignedOptions = useMemo(() => {
    // gather distinct assigned values from contacts + mockData.users
    const fromContacts = contacts.map((c) => c.assigned).filter(Boolean);
    const fromUsers = Object.values(mockData.users || {}).map((u) => u.name);
    return Array.from(new Set([...fromContacts, ...fromUsers])).filter(Boolean);
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    const s = search.toLowerCase();
    return contacts.filter((c) => {
      const matchSearch =
        !s ||
        c.name.toLowerCase().includes(s) ||
        c.phone.toLowerCase().includes(s) ||
        (c.email && c.email.toLowerCase().includes(s)) ||
        (c.source && c.source.toLowerCase().includes(s)) ||
        (c.campaign && c.campaign.toLowerCase().includes(s));
      const matchStatus = statusFilter ? c.status === statusFilter : true;
      const matchAssigned = assignedFilter ? c.assigned === assignedFilter : true;
      return matchSearch && matchStatus && matchAssigned;
    });
  }, [contacts, search, statusFilter, assignedFilter]);

  /* Pagination */
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage) || 1;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirst, indexOfLast);

  /* ---------------- Handlers ---------------- */
  const resetForm = () => setForm({ ...emptyContact });
  
  const openEdit = (contact) => {
    setForm({ ...contact });
    setModalMode('edit');
    setModalOpen(true);
    toast(`Editing ${contact.name}`, 'info');
  };
  
  const openAdd = () => {
    resetForm();
    setModalMode('add');
    setModalOpen(true);
    toast('Adding new contact', 'info');
  };

  const closeModal = () => {
    setModalOpen(false);
    resetForm();
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple validation
    if (!form.name.trim() || !form.phone.trim()) {
      toast('Name and phone are required fields.', 'error');
      return;
    }

    if (modalMode === 'add') {
      const newId = contacts.length > 0 ? Math.max(...contacts.map(c => c.id)) + 1 : 1;
      const newContact = { ...form, id: newId };
      setContacts(prev => [...prev, newContact]);
      toast('Contact added successfully!', 'success');
    } else if (modalMode === 'edit') {
      setContacts(prev => prev.map(c => c.id === form.id ? form : c));
      toast('Contact updated successfully!', 'success');
    }
    
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this contact?')) {
      setContacts((list) => list.filter((c) => c.id !== id));
      toast('Contact deleted.', 'success');
    }
  };

  const handleExport = (type) => {
    // simple demo: convert to CSV / JSON string
    const rows = filteredContacts.map(
      ({ name, phone, email, status, assigned, source, campaign }) => ({
        name,
        phone,
        email,
        status,
        assigned,
        source,
        campaign,
      })
    );

    if (type === 'csv' || type === 'xlsx') {
      const csvHeader = 'Name,Phone,Email,Status,Assigned,Source,Campaign\n';
      const csvBody = rows
        .map((r) =>
          [
            r.name,
            r.phone,
            r.email,
            r.status,
            r.assigned,
            r.source,
            r.campaign,
          ]
            .map((v) => `"${(v ?? '').toString().replace(/"/g, '""')}"`)
            .join(',')
        )
        .join('\n');
      const blob = new Blob([csvHeader + csvBody], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer_contacts.${type === 'xlsx' ? 'csv' : 'csv'}`; // lightweight fallback
      a.click();
      URL.revokeObjectURL(url);
      toast('Exported CSV (use Excel to open).', 'success');
    } else if (type === 'pdf' || type === 'docx') {
      const txt = JSON.stringify(rows, null, 2);
      const blob = new Blob([txt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer_contacts.${type}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`Exported ${type.toUpperCase()} (plain text demo).`, 'success');
    }

    setExportOpen(false);
  };

  const goPage = (p) => setCurrentPage(p);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const nextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);

  /* ---------------- Render ---------------- */
  return (
    <div className="container-fluid mx-auto px-4 py-6">
      {/* Header / Breadcrumbs */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-800">Customer Contacts</h1>
            <nav className="flex mt-2">
              <ol className="flex items-center space-x-2 text-sm">
                <li className="text-blue-600 font-medium">
                  <span>Contacts</span>
                </li>
                <li className="text-gray-500">/</li>
                <li className="text-blue-600 font-medium">
                  <span>Customers</span>
                </li>
              </ol>
            </nav>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Interested">Interested</option>
              <option value="Booked">Booked</option>
            </select>

            {/* Assigned Filter */}
            <select
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={assignedFilter}
              onChange={(e) => {
                setAssignedFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Assigned</option>
              {assignedOptions.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>

            {/* Refresh */}
            <button
              className="p-2 bg-white border rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setAssignedFilter('');
                setCurrentPage(1);
              }}
              title="Clear filters"
            >
              <i className="fas fa-sync-alt"></i>
            </button>

            {/* Export */}
            <div className="relative">
              <button
                className="px-4 py-2 bg-white border rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                onClick={() => setExportOpen((o) => !o)}
              >
                Export <span className="ml-1">▾</span>
              </button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-40 bg-white shadow-lg rounded-md py-1 z-10">
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleExport('xlsx')}
                  >
                    Excel (.xlsx)
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleExport('pdf')}
                  >
                    PDF (.pdf)
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleExport('docx')}
                  >
                    Word (.docx)
                  </button>
                </div>
              )}
            </div>

            {/* Add Contact */}
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={openAdd}
            >
              + Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
     {modalOpen && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
    <div
      className="bg-white rounded-lg shadow-xl w-full max-w-md"
      style={{ height: '700px', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b p-4">
        <h3 className="text-lg font-semibold">
          {modalMode === 'add' ? 'Add New Contact' : 'Edit Contact'}
        </h3>
        <button
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          onClick={closeModal}
        >
          &times;
        </button>
      </div>

      {/* Scrollable Form */}
      <div className="flex-1 overflow-y-auto">
        <form className="p-4 space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Customer Name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              placeholder="+91..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              placeholder="customer@example.com"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={(e) => handleFormChange('status', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>New</option>
              <option>Follow-up</option>
              <option>Interested</option>
              <option>Booked</option>
            </select>
          </div>

          {/* Assigned */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Executive
            </label>
            <select
              name="assigned"
              value={form.assigned}
              onChange={(e) => handleFormChange('assigned', e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {assignedOptions.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Source */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <input
              type="text"
              name="source"
              value={form.source}
              onChange={(e) => handleFormChange('source', e.target.value)}
              placeholder="Website, Referral, Walk-in..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Campaign */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign
            </label>
            <input
              type="text"
              name="campaign"
              value={form.campaign}
              onChange={(e) => handleFormChange('campaign', e.target.value)}
              placeholder="Summer Promo, Facebook Ads..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              rows="2"
              value={form.notes}
              onChange={(e) => handleFormChange('notes', e.target.value)}
              placeholder="Additional context..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>

      {/* Actions (Sticky Footer) */}
      <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
        <button
          type="button"
          className="px-4 py-2 border rounded-md hover:bg-gray-100"
          onClick={closeModal}
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {modalMode === 'add' ? 'Save Contact' : 'Update Contact'}
        </button>
      </div>
    </div>
  </div>
)}


      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentContacts.length ? (
                currentContacts.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {c.name?.[0] || '?'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">{c.name}</div>
                          {c.campaign && (
                            <div className="text-gray-500 text-xs">{c.campaign}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.email || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {c.assigned || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{c.source || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-right">
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-4 text-center text-gray-500 italic"
                  >
                    No contacts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredContacts.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{indexOfFirst + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLast, filteredContacts.length)}
                </span>{' '}
                of <span className="font-medium">{filteredContacts.length}</span>{' '}
                contacts
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-2 py-1 border rounded-l-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-chevron-left text-xs"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goPage(p)}
                  className={`px-3 py-1 border text-sm ${
                    currentPage === p
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 border rounded-r-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerContacts;