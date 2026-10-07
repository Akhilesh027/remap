import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../components/Toast.jsx';
import Modal from '../components/Modal';
import axios from 'axios';

const STATUS_COLORS = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Upcoming: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-gray-200 text-gray-700',
  Issues: 'bg-red-100 text-red-700',
  Review: 'bg-blue-100 text-blue-700',
};

const emptyProperty = {
  id: null,
  title: '',
  date: '',
  rdoContact: '',
  collector: '',
  status: 'Active',
  activity: '',
  update: '',
  lat: '',
  lng: '',
  category: '',
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Inventory = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view | edit | add
  const [form, setForm] = useState(emptyProperty);

  // Fetch properties from backend
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/properties`);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast('Failed to fetch properties', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ------------ Derived ------------ */
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return properties.filter((p) => {
      const matchSearch =
        !s ||
        p.property_title.toLowerCase().includes(s) ||
        (p.collector_name && p.collector_name.toLowerCase().includes(s)) ||
        (p.rdo_contact && p.rdo_contact.toLowerCase().includes(s));
      // Default to show only 'Approved' if no explicit filter set
      const matchStatus = statusFilter
        ? p.property_status === statusFilter
        : p.approval_status === "approved";
      return matchSearch && matchStatus;
    });
  }, [properties, search, statusFilter]);

  const closeModal = () => setModalOpen(false);

  const openView = (prop) => {
    setForm({
      id: prop._id,
      title: prop.property_title,
      date: prop.created_at ? new Date(prop.created_at).toLocaleDateString() : '',
      rdoContact: prop.rdo_contact,
      collector: prop.collector_name,
      status: prop.property_status,
      activity: prop.property_synopsis,
      update: prop.updated_at ? new Date(prop.updated_at).toLocaleDateString() : '',
      lat: prop.latitude,
      lng: prop.longitude,
      category: prop.zone
    });
    setModalMode('view');
    setModalOpen(true);
    toast(`Viewing ${prop.property_title}`, 'info');
  };

  const openEdit = (prop) => {
    setForm({
      id: prop._id,
      title: prop.property_title,
      date: prop.created_at ? new Date(prop.created_at).toLocaleDateString() : '',
      rdoContact: prop.rdo_contact,
      collector: prop.collector_name,
      status: prop.property_status,
      activity: prop.property_synopsis,
      update: prop.updated_at ? new Date(prop.updated_at).toLocaleDateString() : '',
      lat: prop.latitude,
      lng: prop.longitude,
      category: prop.zone
    });
    setModalMode('edit');
    setModalOpen(true);
    toast(`Editing ${prop.property_title}`, 'info');
  };

  const openAdd = () => {
    setForm({ ...emptyProperty });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const prop = properties.find((p) => p._id === id);
    if (!prop) return;

    if (window.confirm(`Delete "${prop.property_title}"?`)) {
      try {
        await axios.delete(`${API_BASE_URL}/api/properties/${id}`);
        setProperties((list) => list.filter((p) => p._id !== id));
        toast('Property deleted successfully.', 'success');
      } catch (error) {
        console.error('Error deleting property:', error);
        toast('Failed to delete property', 'error');
      }
    }
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const formValid = () => form.title.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid()) {
      toast('Property title is required.', 'error');
      return;
    }

    try {
      if (modalMode === 'add') {
        // Prepare data for backend
        const propertyData = {
          property_title: form.title,
          property_status: form.status,
          property_synopsis: form.activity,
          collector_name: form.collector,
          rdo_contact: form.rdoContact,
          latitude: form.lat,
          longitude: form.lng,
          zone: form.category
        };

        const response = await axios.post(`${API_BASE_URL}/api/properties`, propertyData);
        setProperties((list) => [...list, response.data.property]);
        toast('Property added.', 'success');
      } else if (modalMode === 'edit') {
        // Prepare data for backend
        const propertyData = {
          property_title: form.title,
          property_status: form.status,
          property_synopsis: form.activity,
          collector_name: form.collector,
          rdo_contact: form.rdoContact,
          latitude: form.lat,
          longitude: form.lng,
          zone: form.category
        };

        const response = await axios.put(`${API_BASE_URL}/api/properties/${form.id}`, propertyData);
        setProperties((list) => list.map((p) => p._id === form.id ? response.data.property : p));
        toast('Property updated.', 'success');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving property:', error);
      toast('Failed to save property', 'error');
    }
  };

  const openMap = (p) => {
    if (p.latitude != null && p.longitude != null && p.latitude !== '' && p.longitude !== '') {
      const q = `${p.latitude},${p.longitude}`;
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`);
    } else {
      toast('No map coordinates for this property.', 'info');
    }
  };

  const statusBadge = (status) =>
    `px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
    }`;

  /* ------------ Render ------------ */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Property Inventory</h2>
          <p className="text-gray-600">Manage your real estate land bank & projects</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search title, collector, contact..."
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
            <option value="Issues">Issues</option>
            <option value="Review">Review</option>
          </select>

          {/* Add via Modal */}
          <button
            onClick={openAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center"
          >
            <i className="fas fa-plus mr-2" /> Add Property
          </button>

          {/* OR: route-based add page */}
          <Link to="/add-property" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <i className="fas fa-plus-circle mr-2" /> Add Detailed Property
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          {/* Table (md+) */}
          <div className="hidden md:block">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 z-10 text-gray-600">
                    <tr>
                      <th className="py-3 px-6 text-left">Title</th>
                      <th className="py-3 px-6 text-left">Collector</th>
                      <th className="py-3 px-6 text-left">Status</th>
                      <th className="py-3 px-6 text-left">Last Update</th>
                      <th className="py-3 px-6 text-left">Map</th>
                      <th className="py-3 px-6 text-left">Zone</th>
                      <th className="py-3 px-6 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length ? (
                      filtered.map((p) => (
                        <tr key={p._id} className="border-t hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium">
                            <div className="text-indigo-600 cursor-pointer" onClick={() => openView(p)}>
                              {p.property_title}
                            </div>
                            <div className="text-xs text-gray-500">
                              {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                            </div>
                          </td>
                          <td className="py-4 px-6">{p.collector_name || '—'}</td>
                          <td className="py-4 px-6">
                            <span className={statusBadge(p.property_status)}>{p.property_status}</span>
                          </td>
                          <td className="py-4 px-6">
                            {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : '—'}
                            {p.property_synopsis && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {p.property_synopsis}
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
                          <td className="py-4 px-6">{p.zone || '—'}</td>
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
                                title="Edit Property"
                              >
                                <i className="fas fa-edit" />
                              </button>
                              <button
                                onClick={() => handleDelete(p._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete Property"
                              >
                                <i className="fas fa-trash" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="py-6 text-center text-gray-500 italic"
                        >
                          No properties found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Cards (mobile) */}
          <div className="md:hidden space-y-4">
            {filtered.length ? (
              filtered.map((p) => (
                <div
                  key={p._id}
                  className="bg-white rounded-lg shadow p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{p.property_title}</p>
                      <p className="text-xs text-gray-500">
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <span className={statusBadge(p.property_status)}>{p.property_status}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Collector:</strong> {p.collector_name || '—'}
                  </div>

                  <div className="text-sm text-gray-700">
                    <strong>Zone:</strong> {p.zone || '—'}
                  </div>
                  {p.property_synopsis && (
                    <div className="text-xs text-gray-500">{p.property_synopsis}</div>
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
                      onClick={() => handleDelete(p._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-gray-500 italic">
                No properties found.
              </p>
            )}
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={
          modalMode === 'add'
            ? 'Add Property'
            : modalMode === 'edit'
              ? 'Edit Property'
              : 'Property Details'
        }
      >
        <div className="w-full max-w-[500px] max-h-[80vh] overflow-y-auto bg-white rounded-lg p-6">
          {modalMode === 'view' ? (
            <div className="space-y-4 text-sm">
              <p><strong>Title:</strong> {form.title}</p>
              <p><strong>Date:</strong> {form.date || '—'}</p>
              <p><strong>Status:</strong> {form.status}</p>
              <p><strong>Collector:</strong> {form.collector || '—'}</p>
              <p><strong>RDO Contact:</strong> {form.rdoContact || '—'}</p>
              <p><strong>Last Update:</strong> {form.update || '—'}</p>
              <p><strong>Zone:</strong> {form.category || '—'}</p>
              {form.activity && (
                <p><strong>Synopsis:</strong> {form.activity}</p>
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
                  Edit Property
                </button>
              </div>
              <div className="pt-4">
                <Link to={`/property-detail/${form.id}`}>
                  <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                    View More Details
                  </button>
                </Link>
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
                <label className="block text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleFormChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Issues">Issues</option>
                  <option value="Review">Review</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Collector</label>
                <input
                  type="text"
                  value={form.collector}
                  onChange={(e) => handleFormChange('collector', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
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
                <label className="block text-gray-700 mb-1">Zone</label>
                <select
                  value={form.category}
                  onChange={(e) => handleFormChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Zone</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Property Synopsis</label>
                <textarea
                  rows="3"
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
                {modalMode === 'add' ? 'Save Property' : 'Update Property'}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Inventory;