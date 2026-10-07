import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';

const API_URL = 'http://localhost:3001/candidates';

const Recruitment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    position: '',
    contact: '',
    status: 'Pending',
  });

  // Fetch candidates on mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setCandidates(data);
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add candidate to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const newCandidate = await res.json();
      setCandidates([...candidates, newCandidate]);
      setIsModalOpen(false);
      setFormData({ name: '', position: '', contact: '', status: 'Pending' });
    } catch (err) {
      console.error('Failed to add candidate:', err);
    }
  };

  // Update candidate status in backend
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedCandidate = await res.json();
      setCandidates(
        candidates.map((candidate) =>
          candidate._id === id ? updatedCandidate : candidate
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const tableData = candidates.map((candidate) => ({
    _id: candidate._id,
    name: candidate.name,
    position: candidate.position,
    status: candidate.status,
    actions: (
      <select
        value={candidate.status}
        onChange={(e) => updateStatus(candidate._id, e.target.value)}
        className="block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      >
        <option value="Pending">Pending</option>
        <option value="Interview Scheduled">Interview Scheduled</option>
        <option value="Hired">Hired</option>
      </select>
    ),
  }));

  const headers = ['Candidate Name', 'Position Applied', 'Status', 'Actions'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Recruitment & Staffing</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none shadow"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Recruitment
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <DataTable headers={headers} data={tableData} />
      </div>

      {/* Add New Recruitment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Recruitment">
        <form onSubmit={handleSubmit}>
          {/* Candidate Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Position Applied */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Position Applied</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Contact Information */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Pending">Pending</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
              <option value="Hired">Hired</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add Candidate
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Recruitment;
