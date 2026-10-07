import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '../components/Toast.jsx';
import Modal from '../components/Modal';
import axios from 'axios';

// Rename to VENUTURE_STATUS_COLORS for clarity, though it reuses the property statuses
const VENUTURE_STATUS_COLORS = {
  Active: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Upcoming: 'bg-indigo-100 text-indigo-700',
  Completed: 'bg-gray-200 text-gray-700',
  Issues: 'bg-red-100 text-red-700',
  Review: 'bg-blue-100 text-blue-700',
};

const emptyVenture = {
  id: null,
  name: '', // Maps to venture.name
  location: '', // Maps to venture.location
  registered: '', // Maps to venture.registered
  approvedBy: '', // Maps to venture.approvedBy
  googleMapLink: '', // Maps to venture.googleMapLink
  units: 0, // Maps to venture.units
  // The status is inferred or defaulted, as it's not directly in the API object
  status: 'Active',
  brochure: '', // Maps to venture.brochure
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const VenturesInventory = () => {
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Note: The provided venture data doesn't have an explicit 'status' field. 
  // We'll keep the filter for future use or assuming a custom status can be added.
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // view | edit | add
  const [form, setForm] = useState(emptyVenture);

  // Fetch ventures from backend
  useEffect(() => {
    fetchVentures();
  }, []);

  const fetchVentures = async () => {
    try {
      setLoading(true);
      // Changed endpoint from /api/properties to /api/ventures
      const response = await axios.get(`${API_BASE_URL}/api/ventures`);
      // The API response is an object with a 'data' array of ventures
      setVentures(response.data.data || []);
    } catch (error) {
      console.error('Error fetching ventures:', error);
      toast('Failed to fetch ventures', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ------------ Derived ------------ */
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return ventures.filter((v) => {
      const matchSearch =
        !s ||
        v.name.toLowerCase().includes(s) || // Search by venture name
        (v.location && v.location.toLowerCase().includes(s)) || // Search by location
        (v.approvedBy && v.approvedBy.toLowerCase().includes(s)); // Search by approval contact (similar to collector/rdo)

      // **Important:** Since the API data doesn't have a 'property_status' or 'approval_status',
      // we'll disable the status filter logic until a 'status' field is added to the venture data.
      // For now, it matches if the status filter is empty.
      const matchStatus = !statusFilter; // Always true for now, unless status is added to API

      // If you decide to add an artificial status field to the venture object for filtering:
      // const ventureStatus = v.status || 'Active'; // Assume a default or fetch from a different field
      // const matchStatus = statusFilter ? ventureStatus === statusFilter : true;

      return matchSearch && matchStatus;
    });
  }, [ventures, search, statusFilter]);

  const closeModal = () => setModalOpen(false);

  // Helper to map API fields to form fields
  const mapVentureToForm = (venture) => ({
    id: venture._id,
    name: venture.name,
    location: venture.location,
    registered: venture.registered,
    approvedBy: venture.approvedBy,
    googleMapLink: venture.googleMapLink,
    units: venture.units,
    brochure: venture.brochure,
    // Defaulting status and date fields not available in the provided API snippet
    status: 'Active',
    date: venture.createdAt ? new Date(venture.createdAt).toLocaleDateString() : '',
    update: venture.updatedAt ? new Date(venture.updatedAt).toLocaleDateString() : '',
  });

  const openView = (venture) => {
    setForm(mapVentureToForm(venture));
    setModalMode('view');
    setModalOpen(true);
    toast(`Viewing ${venture.name}`, 'info');
  };

  const openEdit = (venture) => {
    setForm(mapVentureToForm(venture));
    setModalMode('edit');
    setModalOpen(true);
    toast(`Editing ${venture.name}`, 'info');
  };

  const openAdd = () => {
    setForm({ ...emptyVenture });
    setModalMode('add');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const venture = ventures.find((v) => v._id === id);
    if (!venture) return;

    if (window.confirm(`Delete venture "${venture.name}"?`)) {
      try {
        // Changed endpoint
        await axios.delete(`${API_BASE_URL}/api/ventures/${id}`);
        setVentures((list) => list.filter((v) => v._id !== id));
        toast('Venture deleted successfully.', 'success');
      } catch (error) {
        console.error('Error deleting venture:', error);
        toast('Failed to delete venture', 'error');
      }
    }
  };

  const handleFormChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const formValid = () => form.name.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formValid()) {
      toast('Venture name is required.', 'error');
      return;
    }

    try {
      // Map form data back to API structure
      const ventureData = {
        name: form.name,
        location: form.location,
        registered: form.registered,
        approvedBy: form.approvedBy,
        googleMapLink: form.googleMapLink,
        units: parseInt(form.units, 10) || 0, // Ensure units is a number
        // status is not included as it's not in the provided API model
      };

      if (modalMode === 'add') {
        const response = await axios.post(`${API_BASE_URL}/api/ventures`, ventureData);
        // Assuming response.data is the newly created venture object
        setVentures((list) => [...list, response.data]);
        toast('Venture added.', 'success');
      } else if (modalMode === 'edit') {
        const response = await axios.put(`${API_BASE_URL}/api/ventures/${form.id}`, ventureData);
        // Assuming response.data is the updated venture object
        setVentures((list) => list.map((v) => v._id === form.id ? response.data : v));
        toast('Venture updated.', 'success');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving venture:', error);
      toast('Failed to save venture', 'error');
    }
  };

  const openMap = (v) => {
    const mapLink = v.googleMapLink || form.googleMapLink;
    if (mapLink) {
      // Check if it's a full URL or just coordinates for safe opening
      const url = mapLink.startsWith('http') ? mapLink : `https://maps.google.com/?q=${encodeURIComponent(mapLink)}`;
      window.open(url);
    } else {
      toast('No map link for this venture.', 'info');
    }
  };

  const statusBadge = (status) =>
    `px-3 py-1 rounded-full text-xs font-medium ${VENUTURE_STATUS_COLORS[status] || 'bg-gray-100 text-gray-700'
    }`;

  /* ------------ Render ------------ */
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Venture Inventory</h2>
          <p className="text-gray-600">Manage your real estate ventures and projects</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search name, location, approved by..."
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
            {/* Kept options for future use, but filter is currently non-functional */}
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Issues">Issues</option>
            <option value="Review">Review</option>
          </select>

          {/* Add via Modal */}

          {/* OR: route-based add page (Updated Link) */}
          <Link to="/add-property" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center">
            <i className="fas fa-plus-circle mr-2" /> Add Detailed Venture
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
                      <th className="py-3 px-6 text-left">Name</th>
                      <th className="py-3 px-6 text-left">Location</th>
                      <th className="py-3 px-6 text-left">Units/Plots</th>
                      <th className="py-3 px-6 text-left">Registered</th>
                      <th className="py-3 px-6 text-left">Approved By</th>
                      <th className="py-3 px-6 text-left">Map</th>
                      <th className="py-3 px-6 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length ? (
                      filtered.map((v) => (
                        <tr key={v._id} className="border-t hover:bg-gray-50">
                          <td className="py-4 px-6 font-medium">
                            <div className="text-indigo-600 cursor-pointer" onClick={() => openView(v)}>
                              {v.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—'}
                            </div>
                          </td>
                          <td className="py-4 px-6">{v.location || '—'}</td>
                          <td className="py-4 px-6">{v.units > 0 ? v.units : (v.plots ? v.plots.length : '—')}</td>
                          <td className="py-4 px-6">{v.registered || '—'}</td>
                          <td className="py-4 px-6">{v.approvedBy || '—'}</td>
                          <td className="py-4 px-6">
                            {v.googleMapLink && (
                              <button
                                onClick={() => openMap(v)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Open in Google Maps"
                              >
                                <i className="fas fa-map-marker-alt" />
                              </button>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-3">
                              <button
                                onClick={() => openView(v)}
                                className="text-blue-600 hover:text-blue-800"
                                title="View Details"
                              >
                                <i className="fas fa-eye" />
                              </button>
                              <button
                                onClick={() => openEdit(v)}
                                className="text-green-600 hover:text-green-800"
                                title="Edit Venture"
                              >
                                <i className="fas fa-edit" />
                              </button>
                              <button
                                onClick={() => handleDelete(v._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete Venture"
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
                          No ventures found.
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
              filtered.map((v) => (
                <div
                  key={v._id}
                  className="bg-white rounded-lg shadow p-4 flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-xs text-gray-500">
                        {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    {/* Status badge is omitted as status is missing in API data */}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Location:</strong> {v.location || '—'}
                  </div>
                  <div className="text-sm text-gray-700">
                    <strong>Units/Plots:</strong> {v.units > 0 ? v.units : (v.plots ? v.plots.length : '—')}
                  </div>
                  {v.approvedBy && (
                    <div className="text-xs text-gray-500">Approved By: {v.approvedBy}</div>
                  )}
                  <div className="flex justify-end gap-4 text-lg pt-2">
                    {v.googleMapLink && (
                      <button
                        onClick={() => openMap(v)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Map"
                      >
                        <i className="fas fa-map-marker-alt" />
                      </button>
                    )}
                    <button
                      onClick={() => openView(v)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <i className="fas fa-eye" />
                    </button>
                    <button
                      onClick={() => openEdit(v)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
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
                No ventures found.
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
            ? 'Add Venture'
            : modalMode === 'edit'
              ? 'Edit Venture'
              : 'Venture Details'
        }
      >
        <div className="w-full max-w-[500px] max-h-[80vh] overflow-y-auto bg-white rounded-lg p-6">
          {modalMode === 'view' ? (
            <div className="space-y-4 text-sm">
              <p><strong>Name:</strong> {form.name}</p>
              <p><strong>Location:</strong> {form.location || '—'}</p>
              <p><strong>Date Created:</strong> {form.date || '—'}</p>
              <p><strong>Units/Plots:</strong> {form.units || '—'}</p>
              <p><strong>Registered:</strong> {form.registered || '—'}</p>
              <p><strong>Approved By:</strong> {form.approvedBy || '—'}</p>
              <p><strong>Last Update:</strong> {form.update || '—'}</p>
              {form.googleMapLink && (
                <button
                  onClick={() => openMap(form)}
                  className="mt-2 w-full bg-indigo-100 text-indigo-700 py-2 rounded-lg hover:bg-indigo-200 text-sm font-medium"
                >
                  Open Map Link
                </button>
              )}
              {form.brochure && (
                <a
                  href={`${API_BASE_URL}/uploads/brochures/${form.brochure}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 w-full bg-green-100 text-green-700 py-2 text-center rounded-lg hover:bg-green-200 text-sm font-medium"
                >
                  View Brochure
                </a>
              )}
              <div className="pt-4">
                <button
                  onClick={() => setModalMode('edit')}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
                >
                  Edit Venture
                </button>
              </div>
              <div className="pt-4">
                <Link to={`/ventureplotes/${form.id}`}> {/* <--- UPDATED LINK PATH */}
                  <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                    View Plot Details
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-4 text-sm" onSubmit={handleSubmit}>
              <div>
                <label className="block text-gray-700 mb-1">Venture Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Registered</label>
                <input
                  type="text"
                  value={form.registered}
                  onChange={(e) => handleFormChange('registered', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Approved By</label>
                <input
                  type="text"
                  value={form.approvedBy}
                  onChange={(e) => handleFormChange('approvedBy', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Units/Plots Count</label>
                <input
                  type="number"
                  value={form.units}
                  onChange={(e) => handleFormChange('units', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Google Map Link/Coordinates</label>
                <input
                  type="text"
                  value={form.googleMapLink}
                  onChange={(e) => handleFormChange('googleMapLink', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {/* Omitted Brochure field for simplicity, as it usually involves file upload logic */}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
              >
                {modalMode === 'add' ? 'Save Venture' : 'Update Venture'}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default VenturesInventory;