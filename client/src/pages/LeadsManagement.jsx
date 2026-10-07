import React, { useMemo, useState } from "react";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.js";

const assignLeadsToMember = async (leadIds, member) => {
  console.log(`Assign leads [${leadIds.join(", ")}] -> ${member}`);
};

const updateLeadStatus = async (leadId, newStatus) => {
  console.log(`Lead #${leadId} status -> ${newStatus}`);
};

const LeadsManagement = () => {
  const [filter, setFilter] = useState("All");
  const [selectedLeadForStatus, setSelectedLeadForStatus] = useState(null);
  const [nextStatus, setNextStatus] = useState(null);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignedMember, setAssignedMember] = useState("");
  const [assignedRole, setAssignedRole] = useState("Telecaller");

  // Mock team members with different roles
  const teamMembers = [
    { id: 1, name: "Pooja Reddy", role: "Telecaller" },
    { id: 2, name: "Ravi Verma", role: "Executive" },
    { id: 3, name: "Karan Mehta", role: "Manager" },
    { id: 4, name: "Akhilesh Sharma", role: "Director" },
    { id: 5, name: "Priya Singh", role: "Executive" },
    { id: 6, name: "David Wilson", role: "Director" },
  ];

  // Mock Lead Data
  const leads = [
    {
      id: 1,
      name: "Suresh Kumar",
      contact: "+91 98765 11111",
      project: "Green Meadows Villas",
      source: "Website Form",
      status: "New",
      assignedTo: "--",
      created: "Jul 20, 2025",
    },
    {
      id: 2,
      name: "Akhilesh Reddy",
      contact: "+91 95503 79505",
      project: "Skyline Heights",
      source: "Walk-in",
      status: "Contacted",
      assignedTo: "Pooja Reddy (Telecaller)",
      created: "Jul 18, 2025",
    },
    {
      id: 3,
      name: "Ravi Verma",
      contact: "+91 98765 43210",
      project: "Lakeview Residency",
      source: "Facebook Ad",
      status: "Interested",
      assignedTo: "Karan Mehta (Manager)",
      created: "Jul 19, 2025",
    },
    {
      id: 4,
      name: "Anita Desai",
      contact: "+91 91234 56789",
      project: "Palm County",
      source: "Referral",
      status: "Lost",
      assignedTo: "--",
      created: "Jul 10, 2025",
    },
    {
      id: 5,
      name: "Rajesh Kumar",
      contact: "+91 90000 00000",
      project: "Metro Enclave",
      source: "Cold Call",
      status: "New",
      assignedTo: "--",
      created: "Jul 22, 2025",
    },
    {
      id: 6,
      name: "Pooja Reddy",
      contact: "+91 88888 88888",
      project: "Sunrise Apartments",
      source: "Website Form",
      status: "Closed",
      assignedTo: "Akhilesh Sharma (Director)",
      created: "Jul 01, 2025",
    },
  ];

  const filteredLeads = useMemo(() => {
    if (filter === "All") return leads;
    return leads.filter((l) => l.status === filter);
  }, [filter, leads]);

  const counts = useMemo(() => {
    const base = { All: leads.length, New: 0, Contacted: 0, Interested: 0, Closed: 0, Lost: 0 };
    leads.forEach((l) => {
      if (base[l.status] !== undefined) base[l.status] += 1;
    });
    return base;
  }, [leads]);

  const openStatusModal = (leadObj, next) => {
    setSelectedLeadForStatus(leadObj);
    setNextStatus(next);
  };

  const confirmStatusChange = async () => {
    if (selectedLeadForStatus && nextStatus) {
      await updateLeadStatus(selectedLeadForStatus.id, nextStatus);
    }
    setSelectedLeadForStatus(null);
    setNextStatus(null);
  };

  const handleSelect = (id) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map((l) => l.id));
    }
  };

  const openAssignModal = (ids = null) => {
    if (ids && ids.length) setSelectedLeads(ids);
    setIsAssignModalOpen(true);
  };

  const assignSelectedLeads = async () => {
    if (!assignedMember) return;
    await assignLeadsToMember(selectedLeads, assignedMember);
    setIsAssignModalOpen(false);
    setAssignedMember("");
    setAssignedRole("Telecaller");
    setSelectedLeads([]);
  };

  const headers = [
    "Select",
    "Lead Name",
    "Contact",
    "Project",
    "Source",
    "Status",
    "Assigned To",
    "Actions",
  ];

  const tableData = filteredLeads.map((lead) => {
    let quickActionLabel = null;
    let quickActionTarget = null;
    switch (lead.status) {
      case "New":
        quickActionLabel = "Mark Contacted";
        quickActionTarget = "Contacted";
        break;
      case "Contacted":
        quickActionLabel = "Mark Interested";
        quickActionTarget = "Interested";
        break;
      case "Interested":
        quickActionLabel = "Mark Closed";
        quickActionTarget = "Closed";
        break;
      default:
        quickActionLabel = null;
        quickActionTarget = null;
    }

    return {
      Select: (
        <input
          type="checkbox"
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
          checked={selectedLeads.includes(lead.id)}
          onChange={() => handleSelect(lead.id)}
        />
      ),
      "Lead Name": <span className="font-medium">{lead.name}</span>,
      Contact: lead.contact,
      Project: lead.project,
      Source: lead.source,
      Status: (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            lead.status === "Closed"
              ? "bg-green-100 text-green-800"
              : lead.status === "Lost"
              ? "bg-red-100 text-red-800"
              : lead.status === "Interested"
              ? "bg-blue-100 text-blue-800"
              : lead.status === "Contacted"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {lead.status}
        </span>
      ),
      "Assigned To": <span className="text-sm">{lead.assignedTo}</span>,
      Actions: (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openAssignModal([lead.id])}
            className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200 transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Assign
          </button>
          {quickActionLabel && (
            <button
              onClick={() => openStatusModal(lead, quickActionTarget)}
              className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {quickActionLabel}
            </button>
          )}
        </div>
      ),
    };
  });

  // Filter team members by selected role
  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter(member => member.role === assignedRole);
  }, [assignedRole]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leads Management</h1>
          <p className="text-sm text-gray-600">Manage and assign leads to your team members</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="lead-filter" className="text-sm font-medium text-gray-700 mr-2">
              Filter:
            </label>
            <div className="relative">
              <select
                id="lead-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none"
              >
                <option value="All">All ({counts.All})</option>
                <option value="New">New ({counts.New})</option>
                <option value="Contacted">Contacted ({counts.Contacted})</option>
                <option value="Interested">Interested ({counts.Interested})</option>
                <option value="Closed">Closed ({counts.Closed})</option>
                <option value="Lost">Lost ({counts.Lost})</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center">
          <label className="inline-flex items-center text-sm text-gray-700 select-none cursor-pointer">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-blue-600"
              checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
              onChange={handleSelectAll}
            />
            <span className="ml-2">Select All</span>
          </label>
        </div>

        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">
              {selectedLeads.length} lead{selectedLeads.length > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => openAssignModal()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Assign to Team Member
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <DataTable headers={headers} data={tableData} striped />
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={nextStatus !== null}
        onClose={() => {
          setNextStatus(null);
          setSelectedLeadForStatus(null);
        }}
        title={`Change Lead Status`}
      >
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  {selectedLeadForStatus ? (
                    <>Change status for <span className="font-semibold">{selectedLeadForStatus.name}</span> to <span className="font-semibold">{nextStatus}</span>?</>
                  ) : (
                    "Are you sure you want to change the lead status?"
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setNextStatus(null);
                setSelectedLeadForStatus(null);
              }}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmStatusChange}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Confirm Change
            </button>
          </div>
        </div>
      </Modal>

      {/* Assign Team Member Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Selected Leads"
      >
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Assigning {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} to:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Role
                </label>
                <select
                  value={assignedRole}
                  onChange={(e) => {
                    setAssignedRole(e.target.value);
                    setAssignedMember("");
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Telecaller">Telecaller</option>
                  <option value="Executive">Executive</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Team Member
                </label>
                <select
                  value={assignedMember}
                  onChange={(e) => setAssignedMember(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Select Team Member --</option>
                  {filteredTeamMembers.map(member => (
                    <option key={member.id} value={member.name}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Team Members:</h3>
              <div className="flex flex-wrap gap-2">
                {filteredTeamMembers.map(member => (
                  <div 
                    key={member.id}
                    onClick={() => setAssignedMember(member.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all ${
                      assignedMember === member.name 
                        ? 'bg-blue-100 border border-blue-300 text-blue-700' 
                        : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {member.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!assignedMember}
              onClick={assignSelectedLeads}
              className={`px-4 py-2 text-sm font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                assignedMember 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Assign Leads
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadsManagement;