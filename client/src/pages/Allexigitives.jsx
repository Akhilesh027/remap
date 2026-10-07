import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const ExecutivesDashboard = () => {
  const [viewMode, setViewMode] = useState("card"); // 'card' or 'row'
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExecutives = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/executives");

        const mapped = res.data.map(e => ({
          id: e._id,
          name: `${e.firstName} ${e.lastName}`,
          email: e.email,
          phone: e.phoneNumber,
          role: e.role || "Executive",
          image: e.files?.length ? `http://localhost:5000/${e.files[0]}` : null,
          status: "active", // default until backend supports status
        }));

        setExecutives(mapped);
        setError(null);
      } catch (err) {
        console.error("Error fetching executives:", err);
        setError("Failed to load executives. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExecutives();
  }, []);

  const [q, setQ] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [terminationModal, setTerminationModal] = useState({
    isOpen: false,
    executive: null
  });

  // Role color mapping
  const roleColorMap = {
    Executive: "bg-indigo-100 text-indigo-800",
    Manager: "bg-green-100 text-green-800",
    Lead: "bg-purple-100 text-purple-800",
    Default: "bg-gray-100 text-gray-800",
  };

  // Get initials from name
  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .map((n) => n[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2);

  // Filter Executives
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return executives.filter(
      (e) =>
        e.name.toLowerCase().includes(s) ||
        e.email.toLowerCase().includes(s) ||
        e.phone.toLowerCase().includes(s)
    );
  }, [q, executives]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
  };

  // Role badge class
  const roleBadgeClass = (role) => roleColorMap[role] || roleColorMap.Default;

  // Termination handlers
  const openTerminationModal = (exec) => {
    setTerminationModal({ isOpen: true, executive: exec });
  };

  const closeTerminationModal = () => {
    setTerminationModal({ isOpen: false, executive: null });
  };

  const confirmTermination = async () => {
    if (terminationModal.executives) {
      try {
        await axios.post("http://localhost:5000/api/termination-requests", {
          userId: terminationModal.executives._id, // now this is userId, regardless of role
          reason: "Requested via dashboard",
        });

        alert("Termination request sent to admin for approval.");
        closeTerminationModal();
      } catch (error) {
        alert("Failed to send termination request.");
      }
    }
  };


  // Render icons for actions
  const renderActionIcons = (exec) => (
    <div className="flex items-center space-x-3">
      <a
        href={`tel:${exec.phone}`}
        className="text-gray-500 hover:text-green-600 transition-colors"
        title="Call"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
        </svg>
      </a>
      <a
        href={`mailto:${exec.email}`}
        className="text-gray-500 hover:text-blue-600 transition-colors"
        title="Email"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
        </svg>
      </a>
      {exec.status === "active" && (
        <button
          onClick={() => openTerminationModal(exec)}
          className="text-gray-500 hover:text-red-600 transition-colors"
          title="Terminate"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading executives...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Termination Modal */}
      {terminationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Confirm Termination
              </h3>
              <button
                onClick={closeTerminationModal}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  {terminationModal.executive?.image ? (
                    <img
                      src={terminationModal.executive.image}
                      alt={terminationModal.executive.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="font-semibold">
                      {getInitials(terminationModal.executive?.name)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">
                    {terminationModal.executive?.name}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    {terminationModal.executive?.role}
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm">
                <p className="font-medium text-red-800">
                  ⚠️ This action will terminate this executive
                </p>
                <p className="mt-2 text-red-700">
                  All associated data will be archived according to company policy
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeTerminationModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmTermination}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Termination
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Executives Management</h1>
              <nav className="text-sm text-gray-500 mt-1">
                <ol className="flex items-center space-x-2">
                  <li>
                    <span className="text-indigo-600">All Executives</span>
                  </li>
                  <li>/</li>
                  <li>Executives Dashboard</li>
                </ol>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("card")}
                  className={`px-3 py-1 rounded-md text-sm ${viewMode === "card"
                      ? "bg-white shadow"
                      : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Card View
                </button>

                <button
                  onClick={() => setViewMode("row")}
                  className={`px-3 py-1 rounded-md text-sm ${viewMode === "row"
                      ? "bg-white shadow"
                      : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Row View
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Executives..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
              </div>

              <Link to='/add-employee'>
                <button className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Executive
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-indigo-500">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Executives</p>
                <p className="text-2xl font-bold">{executives.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Active</p>
                <p className="text-2xl font-bold">
                  {executives.filter(e => e.status === "active").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-lg mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Terminated</p>
                <p className="text-2xl font-bold">
                  {executives.filter(e => e.status === "terminated").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Executives List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {viewMode === "card" ? "Executive Cards" : "Executive List"}
            </h2>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages} • {filtered.length} Executives
            </div>
          </div>

          {/* Content */}
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700">No Executives found</h3>
              <p className="text-gray-500 mt-1">
                Try adjusting your search query or add new executives
              </p>
            </div>
          ) : viewMode === "card" ? (
            // Card View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {pageItems.map((exec) => (
                <div
                  key={exec.id}
                  className={`border rounded-xl overflow-hidden transition-all hover:shadow-md ${exec.status === "terminated"
                      ? "border-red-200 bg-red-50"
                      : "border-gray-200"
                    }`}
                >
                  <div className="p-5">
                    <div className="flex items-start">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center mr-4">
                        {exec.image ? (
                          <img
                            src={exec.image}
                            alt={exec.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="font-semibold">
                            {getInitials(exec.name)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {exec.name}
                          {exec.status === "terminated" && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Terminated
                            </span>
                          )}
                        </h3>
                        <span
                          className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${roleBadgeClass(
                            exec.role
                          )}`}
                        >
                          {exec.role}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{exec.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{exec.phone}</span>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        {exec.status === "active" && (
                          <div className="flex items-center text-green-600 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
                            Active
                          </div>
                        )}
                        {exec.status === "terminated" && (
                          <div className="flex items-center text-red-600 text-sm">
                            <div className="w-2 h-2 rounded-full bg-red-600 mr-2"></div>
                            Terminated
                          </div>
                        )}
                      </div>
                      {renderActionIcons(exec)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Row View
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Executive
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageItems.map((exec) => (
                    <tr
                      key={exec.id}
                      className={exec.status === "terminated" ? "bg-red-50" : "hover:bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-medium mr-3">
                            {exec.image ? (
                              <img
                                src={exec.image}
                                alt={exec.name}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <span>{getInitials(exec.name)}</span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{exec.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeClass(exec.role)}`}>
                          {exec.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{exec.email}</div>
                        <div className="text-sm text-gray-500">{exec.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${exec.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}>
                          {exec.status === "active" ? "Active" : "Terminated"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {renderActionIcons(exec)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filtered.length)}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span> executives
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm ${currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNum
                        ? "bg-indigo-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="px-2 text-gray-500">...</span>
              )}

              {totalPages > 5 && currentPage > totalPages - 3 && (
                <button
                  onClick={() => goToPage(totalPages - 1)}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages - 1
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {totalPages - 1}
                </button>
              )}

              {totalPages > 1 && (
                <button
                  onClick={() => goToPage(totalPages)}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {totalPages}
                </button>
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutivesDashboard;