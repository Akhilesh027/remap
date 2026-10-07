import React, { useState, useEffect } from 'react';

// Mock API service functions
const apiService = {
  getLeads: async () => {
    const response = await fetch('http://localhost:5000/api/leads');
    return await response.json();
  },
  createLead: async (lead) => {
    const response = await fetch('http://localhost:5000/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
    return await response.json();
  },
  updateLead: async (id, updates) => {
    const response = await fetch(`http://localhost:5000/api/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await response.json();
  },
  getTeamMembers: async () => {
    const response = await fetch('http://localhost:5000/api/team-members');
    return await response.json();
  },
  deleteLead: async (id) => {
    const response = await fetch(`http://localhost:5000/api/leads/${id}`, {
      method: 'DELETE',
    });
    return await response.json();
  },
  assignLeads: async (leadIds, memberId) => {
    const response = await fetch('http://localhost:5000/api/leads/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadIds, memberId, assignedBy: 'currentUserId' })
    });
    return await response.json();
  },
  // Add a function to get current user info
  getCurrentUser: async () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;
      return JSON.parse(userData); // { _id, name, role, ... }
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
      return null;
    }
  }

};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-md shadow-lg`}>
      {message}
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Lead Management Component
const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [assignedFilter, setAssignedFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const statusOptions = ['New', 'Contacted', 'Interested', 'Closed', 'Lost'];
  const sourceOptions = ['Website', 'Referral', 'Social Media', 'Advertisement', 'Other'];

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    try {
      await apiService.deleteLead(id);
      setLeads(leads.filter(lead => lead._id !== id));
      showToast("Lead deleted successfully", "success");
    } catch (error) {
      showToast("Failed to delete lead", "error");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchLeads();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, sourceFilter, assignedFilter]);

  const fetchCurrentUser = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      showToast('Failed to fetch user info', 'error');
    }
  };

  const fetchLeads = async () => {
    try {
      const data = await apiService.getLeads();
      setLeads(data);
    } catch (error) {
      showToast('Failed to fetch leads', 'error');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const data = await apiService.getTeamMembers();
      setTeamMembers(data);
    } catch (error) {
      showToast('Failed to fetch team members', 'error');
    }
  };

  // Filter team members based on current user's role
  const getFilteredTeamMembers = () => {
    if (!currentUser) return [];

    switch (currentUser.role) {
      case 'management':
        // Management can assign to admin, director, and telecaller
        return teamMembers.filter(member =>
          member.role === 'admin' || member.role === 'director' || member.role === 'telecaller' || member.role === 'executive'
        );
      case 'admin':
        // Admin can assign to director and telecaller
        return teamMembers.filter(member =>
          member.role === 'director' || member.role === 'telecaller' || member.role === 'executive'
        );
      case 'director':
        // Director can assign only to telecaller
        return teamMembers.filter(member => member.role === 'telecaller');
      default:
        return [];
    }
  };

  const filterLeads = () => {
    let result = leads;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lead =>
        lead.name.toLowerCase().includes(term) ||
        lead.contact.toLowerCase().includes(term) ||
        lead.email.toLowerCase().includes(term) ||
        lead.project.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter(lead => lead.status === statusFilter);
    }

    // Apply source filter
    if (sourceFilter !== 'All') {
      result = result.filter(lead => lead.source === sourceFilter);
    }

    // Apply assigned filter
    if (assignedFilter !== 'All') {
      if (assignedFilter === 'Assigned') {
        result = result.filter(lead => lead.assignedTo);
      } else if (assignedFilter === 'Unassigned') {
        result = result.filter(lead => !lead.assignedTo);
      }
    }

    setFilteredLeads(result);
  };
  const userId = localStorage.getItem('userId') || null; // Fallback to null if user not loaded
  const handleCreateLead = async (leadData) => {
    try {
      const user = apiService.getCurrentUser(); // fetch current user from localStorage

      const newLead = await apiService.createLead({
        ...leadData,
        createdBy: userId || null, // 👈 send logged-in user ID
      });

      setLeads([...leads, newLead]);
      setIsAddModalOpen(false);
      showToast('Lead created successfully!', 'success');
    } catch (error) {
      console.error('Error creating lead:', error);
      showToast('Failed to create lead.', 'error');
    }
  };


  const handleUpdateLead = async (id, updates) => {
    try {
      const updatedLead = await apiService.updateLead(id, updates);
      setLeads(leads.map(lead => lead._id === id ? updatedLead : lead));
      setIsEditModalOpen(false);
      setCurrentLead(null);
      showToast('Lead updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update lead', 'error');
    }
  };

  const handleAssignLeads = async () => {
    if (!selectedMemberId) {
      showToast('Please select a team member', 'error');
      return;
    }

    try {
      await apiService.assignLeads(selectedLeads, selectedMemberId);
      // Refresh leads to get updated assignments
      fetchLeads();
      setSelectedLeads([]);
      setSelectedMemberId('');
      setIsAssignModalOpen(false);
      showToast('Leads assigned successfully', 'success');
    } catch (error) {
      showToast('Failed to assign leads', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const openEditModal = (lead) => {
    setCurrentLead(lead);
    setIsEditModalOpen(true);
  };

  const handleSelectLead = (id) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(filteredLeads.map(lead => lead._id));
    } else {
      setSelectedLeads([]);
    }
  };

  const filteredTeamMembers = getFilteredTeamMembers();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Lead Management System</h1>

      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="All">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="All">All Sources</option>
              {sourceOptions.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assignment</label>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="All">All</option>
              <option value="Assigned">Assigned</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">
              Showing {filteredLeads.length} of {leads.length} leads
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add Lead
            </button>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              disabled={selectedLeads.length === 0}
              className={`px-4 py-2 rounded-md ${selectedLeads.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}`}
            >
              Assign Selected ({selectedLeads.length})
            </button>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLeads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedLeads.includes(lead._id)}
                    onChange={() => handleSelectLead(lead._id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                  <div className="text-sm text-gray-500">{lead.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.contact}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.project}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'Interested' ? 'bg-green-100 text-green-800' :
                          lead.status === 'Closed' ? 'bg-purple-100 text-purple-800' :
                            'bg-red-100 text-red-800'}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {lead.assignedTo ? lead.assignedTo.name : 'Unassigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openEditModal(lead)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLead(lead._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No leads found matching your criteria
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Lead"
      >
        <LeadForm
          onSubmit={handleCreateLead}
          onCancel={() => setIsAddModalOpen(false)}
          teamMembers={filteredTeamMembers}
        />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Lead"
      >
        {currentLead && (
          <LeadForm
            lead={currentLead}
            onSubmit={(updates) => handleUpdateLead(currentLead._id, updates)}
            onCancel={() => setIsEditModalOpen(false)}
            teamMembers={filteredTeamMembers}
          />
        )}
      </Modal>

      {/* Assign Leads Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedMemberId('');
        }}
        title="Assign Leads"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Assign {selectedLeads.length} selected leads to:
          </p>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
          >
            <option value="">Select a team member</option>
            {filteredTeamMembers.map(member => (
              <option key={member._id} value={member._id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setIsAssignModalOpen(false);
                setSelectedMemberId('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignLeads}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Assign
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: '' })}
        />
      )}
    </div>
  );
};

// Lead Form Component
const LeadForm = ({ lead, onSubmit, onCancel, teamMembers }) => {
  const [formData, setFormData] = useState({
    name: lead?.name || '',
    contact: lead?.contact || '',
    email: lead?.email || '',
    project: lead?.project || '',
    source: lead?.source || '',
    status: lead?.status || 'New',
    assignedTo: lead?.assignedTo?._id || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
        <input
          type="text"
          name="contact"
          value={formData.contact}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
        <input
          type="text"
          name="project"
          value={formData.project}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
        <select
          name="source"
          value={formData.source}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Select Source</option>
          <option value="Website">Website</option>
          <option value="Referral">Referral</option>
          <option value="Social Media">Social Media</option>
          <option value="Advertisement">Advertisement</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Interested">Interested</option>
          <option value="Closed">Closed</option>
          <option value="Lost">Lost</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
        <select
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Unassigned</option>
          {teamMembers.map(member => (
            <option key={member._id} value={member._id}>
              {member.name} ({member.role})
            </option>
          ))}
        </select>
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {lead ? 'Update' : 'Create'} Lead
        </button>
      </div>
    </form>
  );
};

export default LeadManagement;