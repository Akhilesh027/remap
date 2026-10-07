import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../components/Toast.jsx';
import Modal from '../components/Modal';

// Hardcoded hidden property data
const initialHidden = [
  {
    id: 1,
    title: "Gachibowli Greens",
    date: "23rd Dec, 2024",
    rdoContact: "9849000001",
    status: "Active",
    link: "/gachibowli",
    activity: "Karan Mehta conducted site visit and explained layout details to clients.",
    update: "Survey Completed",
    lat: 17.4375,
    lng: 78.3826,
    category: "Land"
  },
  {
    id: 2,
    title: "Madhapur Meadows",
    date: "12th Nov, 2024",
    rdoContact: "9911223344",
    status: "Pending",
    link: "/madhapur",
    activity: "Awaiting approval from RDO office.",
    update: "Documents Submitted",
    lat: 17.4483,
    lng: 78.3915,
    category: "Land"
  },
  {
    id: 3,
    title: "Financial District Plot",
    date: "05th Oct, 2024",
    rdoContact: "9977665544",
    status: "Upcoming",
    link: "/financial-district",
    activity: "Site clearance planned next month.",
    update: "Site Marking Done",
    lat: 17.4240,
    lng: 78.3783,
    category: "Land"
  }
];

const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Upcoming: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-gray-200 text-gray-700',
};

const emptyProperty = {
  id: null,
  title: '',
  date: '',
  rdoContact: '',
  status: 'Active',
  activity: '',
  update: '',
  lat: '',
  lng: '',
  link: '',
  category: ''
};

const HiddenInventory = () => {
  const [properties, setProperties] = useState(initialHidden);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view | edit | add
  const [form, setForm] = useState(emptyProperty);

const filtered = useMemo(() => {
  const s = search.toLowerCase();
  return properties.filter((p) => {
    const matchSearch =
      !s ||
      p.title.toLowerCase().includes(s) ||
      (p.rdoContact && p.rdoContact.toLowerCase().includes(s));
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    const visibleToManagement = p.management_visibility === "Management";
    return matchSearch && matchStatus && visibleToManagement;
  });
}, [properties, search, statusFilter]);

  const closeModal = () => setModalOpen(false);
  const openView = (prop) => {
    setForm({ ...prop });
    setModalMode('view');
    setModalOpen(true);
    toast(`Viewing ${prop.title}`, 'info');
  };
  const openEdit = (prop) => {
    setForm({ ...prop });
    setModalMode('edit');
    setModalOpen(true);
    toast(`Editing ${prop.title}`, 'info');
  };
  const openAdd = () => {
    setForm({ ...emptyProperty });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    const prop = properties.find((p) => p.id === id);
    if (!prop) return;
    if (window.confirm(`Delete "${prop.title}"?`)) {
      setProperties((list) => list.filter((p) => p.id !== id));
      toast('Property deleted successfully.', 'success');
    }
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const formValid = () => form.title.trim();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formValid()) {
      toast('Property title is required.', 'error');
      return;
    }

    if (modalMode === 'add') {
      const newId = properties.length
        ? Math.max(...properties.map((p) => p.id)) + 1
        : 1;
      const newProp = { ...form, id: newId };
      setProperties((list) => [...list, newProp]);
      toast('Property added.', 'success');
    } else if (modalMode === 'edit') {
      setProperties((list) =>
        list.map((p) => (p.id === form.id ? { ...form } : p))
      );
      toast('Property updated.', 'success');
    }
    setModalOpen(false);
  };

  const openMap = (p) => {
    if (p.lat != null && p.lng != null && p.lat !== '' && p.lng !== '') {
      const q = `${p.lat},${p.lng}`;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          q
        )}`
      );
    } else {
      toast('No map coordinates for this property.', 'info');
    }
  };

  const statusBadge = (status) =>
    `px-3 py-1 rounded-full text-xs font-medium ${
      STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
    }`;

  /* ------------ Render ------------ */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Hidden Property</h2>
          <p className="text-gray-600">Manage your hidden property records</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search title or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>

          <Link
            to="/add-property"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <i className="fas fa-plus mr-2" /> Add Hidden
          </Link>
        </div>
      </div>

      {/* Table (md+) */}
      {(filtered && filtered.length > 0) && (
      <div className="hidden md:block">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10 text-gray-600">
                <tr>
                  <th className="py-3 px-6 text-left">Title</th>
                  <th className="py-3 px-6 text-left">Status</th>
                  <th className="py-3 px-6 text-left">Last Update</th>
                  <th className="py-3 px-6 text-left">Map</th>
                  <th className="py-3 px-6 text-left">Category</th>
                  <th className="py-3 px-6 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium">
                      <Link
                        to={p.link || '#'}
                        className="text-indigo-600 hover:underline"
                      >
                        {p.title}
                      </Link>
                      <div className="text-xs text-gray-500">{p.date}</div>
                    </td>

                    <td className="py-4 px-6">
                      <span className={statusBadge(p.status)}>{p.status}</span>
                    </td>

                    <td className="py-4 px-6">
                      {p.update || '—'}
                      {p.activity && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {p.activity}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => openMap(p)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Open in Google Maps"
                      >
                        <i className="fas fa-map-marker-alt" />
                      </button>
                    </td>

                    <td className="py-4 px-6">{p.category || '—'}</td>

                    <td className="py-4 px-6">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => openView(p)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <i className="fas fa-eye" />
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* Cards (mobile) */}
      <div className="md:hidden space-y-4">
        {filtered.length ? (
          filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.date}</p>
                </div>
                <span className={statusBadge(p.status)}>{p.status}</span>
              </div>

              {p.activity && (
                <div className="text-xs text-gray-500">{p.activity}</div>
              )}
              <div className="flex justify-end gap-4 text-lg pt-2">
                <button
                  onClick={() => openMap(p)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Map"
                >
                  <i className="fas fa-map-marker-alt" />
                </button>
                <button
                  onClick={() => openView(p)}
                  className="text-blue-600 hover:text-blue-800"
                  title="View"
                >
                  <i className="fas fa-eye" />
                </button>
                <button
                  onClick={() => openEdit(p)}
                  className="text-green-600 hover:text-green-800"
                  title="Edit"
                >
                  <i className="fas fa-edit" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-gray-500 italic">No items found.</p>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          modalMode === 'add'
            ? 'Add Hidden'
            : modalMode === 'edit'
            ? 'Edit Hidden'
            : 'Hidden Details'
        }
      >
        <div className="w-full max-w-[500px] max-h-[80vh] overflow-y-auto bg-white rounded-lg p-6">
          {modalMode === 'view' ? (
            <div className="space-y-4 text-sm">
              <p><strong>Title:</strong> {form.title}</p>
              <p><strong>Date:</strong> {form.date || '—'}</p>
              <p><strong>Status:</strong> {form.status}</p>
              <p><strong>RDO Contact:</strong> {form.rdoContact || '—'}</p>
              <p><strong>Last Update:</strong> {form.update || '—'}</p>
              <p><strong>Category:</strong> {form.category || '—'}</p>

              {form.activity && (
                <p><strong>Recent Activity:</strong> {form.activity}</p>
              )}
              {(form.lat || form.lng) && (
                <button
                  onClick={() => openMap(form)}
                  className="mt-2 w-full bg-indigo-100 text-indigo-700 py-2 rounded-lg hover:bg-indigo-200 text-sm font-medium"
                >
                  Open in Google Maps
                </button>
              )}

              <div className="pt-4">
                <button
                  onClick={() => setModalMode('edit')}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Edit Hidden
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={form.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  placeholder="e.g., 23rd Dec, 2024"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Upcoming</option>
                  <option>Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">RDO Contact</label>
                <input
                  type="text"
                  value={form.rdoContact}
                  onChange={(e) => handleFormChange('rdoContact', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Last Update</label>
                <input
                  type="text"
                  value={form.update}
                  onChange={(e) => handleFormChange('update', e.target.value)}
                  placeholder="Survey Completed, Docs Submitted..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Recent Activity</label>
                <textarea
                  rows="2"
                  value={form.activity}
                  onChange={(e) => handleFormChange('activity', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={(e) => handleFormChange('lat', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={(e) => handleFormChange('lng', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                {modalMode === 'add' ? 'Save Hidden' : 'Update Hidden'}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default HiddenInventory;
