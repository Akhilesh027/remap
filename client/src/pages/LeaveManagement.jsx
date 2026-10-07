// src/pages/LeaveManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "../components/DataTable.jsx";
import Modal from "../components/Modal.js";

const LeaveManagement = () => {
  const [filter, setFilter] = useState("All");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch leave requests from backend
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/leaves"); // GET all leaves
      setLeaveRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // ------------------------------------------------------------------
  // Counts for filter dropdown
  // ------------------------------------------------------------------
  const counts = useMemo(() => {
    const base = { All: leaveRequests.length, Pending: 0, Approved: 0, Rejected: 0 };
    leaveRequests.forEach((r) => {
      if (base[r.status] !== undefined) base[r.status] += 1;
    });
    return base;
  }, [leaveRequests]);

  // ------------------------------------------------------------------
  // Filtered leaves based on status
  // ------------------------------------------------------------------
  const filteredRequests = useMemo(() => {
    if (filter === "All") return leaveRequests;
    return leaveRequests.filter((r) => r.status === filter);
  }, [filter, leaveRequests]);

  // ------------------------------------------------------------------
  // Approve/Reject action
  // ------------------------------------------------------------------
  const handleApproveReject = (leaveObj, action) => {
    setSelectedLeave(leaveObj);
    setConfirmAction(action);
  };

  const confirmDecision = async () => {
    if (selectedLeave && confirmAction) {
      try {
        await axios.put(`/api/leaves/${selectedLeave._id}`, {
          status: confirmAction === "Approve" ? "Approved" : "Rejected",
        });
        fetchLeaves(); // refresh list
      } catch (err) {
        console.error("Failed to update leave:", err);
      }
    }
    setConfirmAction(null);
    setSelectedLeave(null);
  };

  // ------------------------------------------------------------------
  // Table Headers & Data
  // ------------------------------------------------------------------
  const headers = ["Employee Name", "Department", "Leave Type", "Dates", "Status", "Actions"];

  const tableData = filteredRequests.map((request) => ({
    "Employee Name": request.name,
    Department: request.department,
    "Leave Type": request.type,
    Dates: request.dates,
    Status: (
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          request.status === "Approved"
            ? "bg-green-100 text-green-800"
            : request.status === "Rejected"
            ? "bg-red-100 text-red-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {request.status}
      </span>
    ),
    Actions:
      request.status === "Pending" ? (
        <div className="flex space-x-2">
          <button
            onClick={() => handleApproveReject(request, "Approve")}
            className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
          >
            Approve
          </button>
          <button
            onClick={() => handleApproveReject(request, "Reject")}
            className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
          >
            Reject
          </button>
        </div>
      ) : (
        <span className="text-gray-400 text-xs italic">No actions</span>
      ),
  }));

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="leave-filter" className="text-sm font-medium text-gray-700">
            Filter:
          </label>
          <select
            id="leave-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            <option value="All">All ({counts.All})</option>
            <option value="Pending">Pending ({counts.Pending})</option>
            <option value="Approved">Approved ({counts.Approved})</option>
            <option value="Rejected">Rejected ({counts.Rejected})</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading leave requests...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DataTable headers={headers} data={tableData} striped />
        </div>
      )}

      <Modal
        isOpen={confirmAction !== null}
        onClose={() => {
          setConfirmAction(null);
          setSelectedLeave(null);
        }}
        title={`${confirmAction || ""} Leave Request`}
      >
        <p className="text-gray-700 mb-6">
          {selectedLeave ? (
            <>
              Are you sure you want to {confirmAction?.toLowerCase()} the leave request for{" "}
              <span className="font-semibold">{selectedLeave.name}</span> ({selectedLeave.dates})?
            </>
          ) : (
            "Are you sure you want to perform this action?"
          )}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setConfirmAction(null);
              setSelectedLeave(null);
            }}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDecision}
            className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
              confirmAction === "Approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            Confirm {confirmAction}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LeaveManagement;
