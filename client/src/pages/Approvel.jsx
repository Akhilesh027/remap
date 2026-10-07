import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Search,
  Filter,
  User,
  Building,
  Calendar,
  Clock,
  DollarSign,
} from "lucide-react";

const ApprovalPage = () => {
  const [activeTab, setActiveTab] = useState("employees");
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState({ employees: [], properties: [] });
  const [loading, setLoading] = useState(false);

  const employeeRequestTypes = [
    "all",
    "termination",
    "sick leave",
    "vacation",
    "promotion",
    "transfer",
  ];
  const propertyRequestTypes = ["all", "new listing", "price change", "status update"];

  // Fetch requests from backend API
  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const [employeesRes, propertiesRes] = await Promise.all([
          fetch("http://localhost:5000/api"),
          fetch("http://localhost:5000/api/properties"),
        ]);
        const employeesData = employeesRes.ok ? await employeesRes.json() : [];
        const propertiesData = propertiesRes.ok ? await propertiesRes.json() : [];
        // Adjust fields to match UI if needed (e.g. status capital case)
        const employeesFormatted = employeesData.map((emp) => ({
          ...emp,
          status: emp.status.charAt(0).toUpperCase() + emp.status.slice(1),
          type: emp.type.toLowerCase(),
        }));
        const propertiesFormatted = propertiesData.map((prop) => ({
          id: prop._id || prop.id,
          title: prop.property_title,
          location: prop.location || prop.zone || "N/A",
          price: prop.price || "N/A",
          status: prop.approval_status
            ? prop.approval_status.charAt(0).toUpperCase() + prop.approval_status.slice(1)
            : "Pending",
          type: prop.type ? prop.type.toLowerCase() : "new listing",
          details: prop.details || "No details",
          date: prop.date || new Date().toISOString().slice(0, 10),
          submittedBy: prop.submittedBy || "Unknown",
        }));
        setRequests({ employees: employeesFormatted, properties: propertiesFormatted });
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      }
      setLoading(false);
    };
    fetchRequests();
  }, []);

  // Handle Approve/Reject status update with backend sync
  const handleAction = async (type, id, action) => {
    try {
      const apiUrl =
        type === "properties"
          ? `http://localhost:5000/api/properties/${id}/status`
          : `http://localhost:5000/api/employees/requests/${id}/status`;
      const res = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action.toLowerCase() }), // backend expects lowercase
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updatedItem = await res.json();

      setRequests((prev) => ({
        ...prev,
        [type]: prev[type].map((item) =>
          (item.id === id || item._id === id) ? { ...item, status: action } : item
        ),
      }));
    } catch (error) {
      console.error("Update status error:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  // Filter and search logic
  const filteredData = (type) => {
    const s = search.toLowerCase();
    return requests[type].filter((item) => {
      const matchesSearch =
        type === "employees"
          ? item.name.toLowerCase().includes(s) ||
          item.role.toLowerCase().includes(s) ||
          item.type.toLowerCase().includes(s)
          : item.title.toLowerCase().includes(s) ||
          item.location.toLowerCase().includes(s) ||
          item.type.toLowerCase().includes(s);

      const matchesFilter = activeFilter === "all" || item.type.toLowerCase() === activeFilter;

      return matchesSearch && matchesFilter;
    });
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "termination":
      case "transfer":
        return <User className="w-4 h-4" />;
      case "sick leave":
      case "vacation":
        return <Clock className="w-4 h-4" />;
      case "promotion":
      case "price change":
        return <DollarSign className="w-4 h-4" />;
      case "new listing":
        return <Building className="w-4 h-4" />;
      case "status update":
        return <Check className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "termination":
        return "bg-red-100 text-red-700";
      case "sick leave":
        return "bg-orange-100 text-orange-700";
      case "vacation":
        return "bg-blue-100 text-blue-700";
      case "promotion":
        return "bg-green-100 text-green-700";
      case "transfer":
        return "bg-purple-100 text-purple-700";
      case "new listing":
        return "bg-indigo-100 text-indigo-700";
      case "price change":
        return "bg-amber-100 text-amber-700";
      case "status update":
        return "bg-cyan-100 text-cyan-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Approval Requests</h1>
          <p className="text-gray-500 text-sm">
            Approve or reject employee & property submissions
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {["employees", "properties"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setActiveFilter("all");
            }}
            className={`px-4 py-2 font-medium text-sm capitalize ${activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-indigo-600"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center mb-6 gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-500">Filter by:</span>
        {(activeTab === "employees" ? employeeRequestTypes : propertyRequestTypes).map(
          (filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 text-xs rounded-full capitalize ${activeFilter === filter
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {filter}
            </button>
          )
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-lg shadow p-4 min-h-[200px]">
        {loading ? (
          <p className="text-center text-gray-500">Loading requests...</p>
        ) : filteredData(activeTab).length === 0 ? (
          <p className="text-gray-500 text-center italic py-6">
            No {activeFilter !== "all" ? activeFilter : ""} requests found.
          </p>
        ) : (
          filteredData(activeTab).map((item) => (
            <div key={item.id} className="border-b last:border-b-0 py-4">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(item.type)}`}>
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {activeTab === "employees" ? item.name : item.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activeTab === "employees"
                          ? item.role
                          : `${item.location} – ₹${item.price}`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 ml-11">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mt-1">{item.details}</p>

                    <div className="text-xs text-gray-500 mt-2">
                      {activeTab === "employees" ? (
                        <>Requested by: <span className="font-medium">{item.initiator}</span></>
                      ) : (
                        <>Submitted by: <span className="font-medium">{item.submittedBy}</span></>
                      )}
                      {item.days && <> • <span className="font-medium">{item.days}</span> days</>}
                      {item.oldPrice && <> • Previous price: <span className="font-medium">₹{item.oldPrice}</span></>}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className="flex flex-col items-end gap-3 ml-11 md:ml-0">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${item.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : item.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                  >
                    {item.status}
                  </span>

                  {/* Actions */}
                  {item.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(activeTab, item.id, "Approved")}
                        className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(activeTab, item.id, "Rejected")}
                        className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;
