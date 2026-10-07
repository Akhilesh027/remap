// src/pages/Recruitment.jsx
import React, { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import Modal from "../components/Modal";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

const Recruitment = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    contact: "",
    status: "Pending",
  });

  // ✅ Fetch candidates from backend
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/recruitments`);
        setCandidates(res.data);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  // ✅ Input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add candidate
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/recruitments`, formData);
      setCandidates([...candidates, res.data]);
      setIsModalOpen(false);
      setFormData({ name: "", position: "", contact: "", status: "Pending" });
    } catch (error) {
      console.error("Error adding candidate:", error);
    }
  };

  // ✅ Update status
  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/recruitments/${id}`, {
        status: newStatus,
      });
      setCandidates(
        candidates.map((c) =>
          c._id === id ? { ...c, status: res.data.status } : c
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Recruitment & Staffing
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none shadow"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Recruitment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-4">
        {loading ? (
          <p className="text-gray-600">Loading candidates...</p>
        ) : candidates.length === 0 ? (
          <p className="text-gray-600">No candidates found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Candidate Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Position Applied
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <tr key={candidate._id}>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {candidate.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {candidate.position}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {candidate.contact}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {candidate.status}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={candidate.status}
                      onChange={(e) =>
                        updateStatus(candidate._id, e.target.value)
                      }
                      className="block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Interview Scheduled">
                        Interview Scheduled
                      </option>
                      <option value="Hired">Hired</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add New Recruitment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Recruitment"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Candidate Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position Applied
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Information
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
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
