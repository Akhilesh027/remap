import React, { useState } from "react";

const PropertyForm = () => {
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ventureDetails, setVentureDetails] = useState({
    name: "",
    location: "",
    registered: "",
    approvedBy: "",
    googleMapLink: "",
    brochure: null, // File object
    layout: null,   // File object
    highlights: [], // Array of File objects
    units: "",
  });

  // Store all plot details in an object with plot numbers (keys) as identifiers
  const [allPlotDetails, setAllPlotDetails] = useState({});
  const [ventureId, setVentureId] = useState(null);

  // API Base URL
  // NOTE: This will be hit by the new combined endpoint: /api/ventures/combined
  const API_BASE = "http://localhost:5000/api";

  // --- File/Detail Handlers (Keep the same) ---
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    setVentureDetails({ ...ventureDetails, [field]: file });
  };

  const handleImageChange = (e, field) => {
    const files = Array.from(e.target.files);
    setVentureDetails({ ...ventureDetails, [field]: files });
  };

  const handlePlotFileChange = (e, field) => {
    const file = e.target.files[0];
    if (selectedPlot) {
      setAllPlotDetails(prev => ({
        ...prev,
        [selectedPlot]: {
          ...prev[selectedPlot] || {},
          [field]: file
        }
      }));
    }
  };

  const handlePlotImageChange = (e, field) => {
    const files = Array.from(e.target.files);
    if (selectedPlot) {
      setAllPlotDetails(prev => ({
        ...prev,
        [selectedPlot]: {
          ...prev[selectedPlot] || {},
          [field]: files
        }
      }));
    }
  };

  const handlePlotDetailChange = (field, value) => {
    if (selectedPlot) {
      setAllPlotDetails(prev => ({
        ...prev,
        [selectedPlot]: {
          ...prev[selectedPlot] || {},
          [field]: value
        }
      }));
    }
  };

  // --- Core Logic Change: Combine all data into one request ---

  // Removed saveVenture and savePlot functions.

  const plotNumbers = ventureDetails.units && parseInt(ventureDetails.units) > 0 ?
    Array.from({ length: parseInt(ventureDetails.units) }, (_, i) => i + 1) : [];

  // New combined function to save all data in one go
  const handleSaveAll = async () => {
    // 1. Basic Validation
    if (!ventureDetails.name || !ventureDetails.location || !ventureDetails.units) {
      alert("Please fill in all required fields (Venture Name, Location, and Number of Plots)");
      return;
    }

    if (parseInt(ventureDetails.units) <= 0) {
      alert("Number of plots must be greater than 0");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    const plotsDataArray = [];

    try {
      // 2. Append Static Venture Details
      formData.append('name', ventureDetails.name);
      formData.append('location', ventureDetails.location);
      formData.append('registered', ventureDetails.registered || '');
      formData.append('approvedBy', ventureDetails.approvedBy || '');
      formData.append('googleMapLink', ventureDetails.googleMapLink || '');
      formData.append('units', ventureDetails.units);

      // 3. Append Venture Files
      if (ventureDetails.brochure) {
        formData.append('brochure', ventureDetails.brochure);
      }
      if (ventureDetails.layout) {
        formData.append('layout', ventureDetails.layout);
      }
      if (ventureDetails.highlights && ventureDetails.highlights.length > 0) {
        ventureDetails.highlights.forEach(file => {
          formData.append('highlights', file);
        });
      }

      // 4. Collect Plot Data and Files
      plotNumbers.forEach(plotNumber => {
        const plot = allPlotDetails[plotNumber] || {};

        // Collect plot details for JSON serialization
        plotsDataArray.push({
          plotNumber: plotNumber.toString(),
          plotLocation: plot.plotLocation || '',
          plotFacing: plot.plotFacing || '',
          plotVaastu: plot.plotVaastu || '',
          status: plot.status || 'available',
          additionalDetails: plot.additionalDetails || '',
          // Use filename placeholders for the backend to fill in later
          documents: plot.documents ? plot.documents.name : null,
          images: plot.images ? plot.images.map(f => f.name) : []
        });

        // Append Plot Files to FormData with unique dynamic keys
        if (plot.documents) {
          formData.append(`plot_documents_${plotNumber}`, plot.documents);
        }
        if (plot.images && plot.images.length > 0) {
          plot.images.forEach((file, index) => {
            formData.append(`plot_images_${plotNumber}_${index}`, file);
          });
        }
      });

      // 5. Append Serialized Plot Details JSON
      formData.append('plotsData', JSON.stringify(plotsDataArray));

      console.log("Starting to save combined property data...");

      // 6. Send Single Request to the New Combined Endpoint
      const response = await fetch(`${API_BASE}/ventures/combined`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save combined data');
      }

      const result = await response.json();
      setVentureId(result.venture._id);

      alert("All property details saved successfully!");
      console.log("Complete Property Data saved to backend with ID:", result.venture._id);

    } catch (error) {
      console.error("Error saving property:", error);
      alert(`Error saving property details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };


  // --- Helper Functions (Keep the same) ---
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        const data = await response.json();
        alert(`Backend connection successful! Server status: ${data.status}`);
      } else {
        alert('Backend connection failed!');
      }
    } catch (error) {
      alert('Backend connection failed! Make sure the server is running on port 5000.');
    }
  };

  const updatePlotStatus = (plotNumber, status) => {
    setAllPlotDetails(prev => ({
      ...prev,
      [plotNumber]: {
        ...prev[plotNumber] || {},
        status: status
      }
    }));
  };

  const getPlotColor = (plotNumber) => {
    const plot = allPlotDetails[plotNumber];
    if (!plot || plot.status === "available") return "bg-green-400 hover:bg-green-500 border-2 border-green-600";
    if (plot.status === "booked") return "bg-orange-400 hover:bg-orange-500 border-2 border-orange-600";
    if (plot.status === "sold") return "bg-red-400 hover:bg-red-500 border-2 border-red-600";
    return "bg-gray-200 hover:bg-gray-300 border-2 border-gray-300";
  };

  const getPlotStatus = (plotNumber) => {
    const plot = allPlotDetails[plotNumber];
    return plot?.status || "available";
  };

  const openPlotForm = (plotNumber) => {
    setSelectedPlot(plotNumber);
    setShowPlotForm(true);
  };

  const closePlotForm = () => {
    setShowPlotForm(false);
    setSelectedPlot(null);
  };

  const savePlotDetails = () => {
    // This function only closes the modal and confirms local save. 
    closePlotForm();
    alert(`Plot ${selectedPlot} details saved locally!`);
  };

  const handleReset = () => {
    setVentureDetails({
      name: "",
      location: "",
      registered: "",
      approvedBy: "",
      googleMapLink: "",
      brochure: null,
      layout: null,
      highlights: [],
      units: "",
    });
    setAllPlotDetails({});
    setSelectedPlot(null);
    setShowPlotForm(false);
    setVentureId(null);
  };

  // --- JSX (Keep the same, minor adjustment to button text) ---

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-2xl shadow-md mt-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Property Management</h1>
        <button
          onClick={testBackendConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Test Backend Connection
        </button>
      </div>

      {/* Venture Details Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Venture Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Venture Name *"
              className="w-full p-2 border rounded"
              value={ventureDetails.name}
              onChange={(e) =>
                setVentureDetails({ ...ventureDetails, name: e.target.value })
              }
            />
            {!ventureDetails.name && <p className="text-red-500 text-sm mt-1">Required</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Venture Location *"
              className="w-full p-2 border rounded"
              value={ventureDetails.location}
              onChange={(e) =>
                setVentureDetails({ ...ventureDetails, location: e.target.value })
              }
            />
            {!ventureDetails.location && <p className="text-red-500 text-sm mt-1">Required</p>}
          </div>
          <input
            type="text"
            placeholder="Venture Registered"
            className="w-full p-2 border rounded"
            value={ventureDetails.registered}
            onChange={(e) =>
              setVentureDetails({
                ...ventureDetails,
                registered: e.target.value,
              })
            }
          />
          <input
            type="text"
            placeholder="Approved by (HMD, RERA, etc)"
            className="w-full p-2 border rounded"
            value={ventureDetails.approvedBy}
            onChange={(e) =>
              setVentureDetails({
                ...ventureDetails,
                approvedBy: e.target.value,
              })
            }
          />
          <input
            type="url"
            placeholder="Google Map Location Link"
            className="w-full p-2 border rounded"
            value={ventureDetails.googleMapLink}
            onChange={(e) =>
              setVentureDetails({
                ...ventureDetails,
                googleMapLink: e.target.value,
              })
            }
          />
          <div>
            <input
              type="number"
              placeholder="Number of Plots *"
              className="w-full p-2 border rounded"
              value={ventureDetails.units}
              onChange={(e) =>
                setVentureDetails({ ...ventureDetails, units: e.target.value })
              }
              min="1"
            />
            {!ventureDetails.units && <p className="text-red-500 text-sm mt-1">Required</p>}
          </div>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block font-medium mb-1">Venture Brochure</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "brochure")}
              className="w-full"
              accept=".pdf,.doc,.docx"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Venture Layout</label>
            <input
              type="file"
              onChange={(e) => handleFileChange(e, "layout")}
              className="w-full"
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Venture Highlights</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleImageChange(e, "highlights")}
              className="w-full"
              accept=".jpg,.jpeg,.png"
            />
          </div>
        </div>
      </div>

      {/* Plots Grid Section */}
      {ventureDetails.units && parseInt(ventureDetails.units) > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Plots Management</h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded"></div>
                <span>Sold</span>
              </div>
            </div>
          </div>

          {/* Quick Status Actions */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => plotNumbers.forEach(plot => updatePlotStatus(plot, "available"))}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Mark All Available
            </button>
            <button
              onClick={() => plotNumbers.forEach(plot => updatePlotStatus(plot, "booked"))}
              className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
            >
              Mark All Booked
            </button>
            <button
              onClick={() => plotNumbers.forEach(plot => updatePlotStatus(plot, "sold"))}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Mark All Sold
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {plotNumbers.map((plotNumber) => {
              const plot = allPlotDetails[plotNumber] || {};
              return (
                <div
                  key={plotNumber}
                  className={`p-4 text-center text-white rounded-lg cursor-pointer transition-all hover:scale-105 ${getPlotColor(plotNumber)}`}
                  onClick={() => openPlotForm(plotNumber)}
                >
                  <div className="font-bold text-lg">Plot {plotNumber}</div>
                  <div className="text-sm mt-1 capitalize">
                    {getPlotStatus(plotNumber)}
                  </div>
                  {plot.plotFacing && (
                    <div className="text-xs mt-1">
                      {plot.plotFacing}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plot Form Popup */}
      {showPlotForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Plot {selectedPlot} Details</h3>
                <button
                  onClick={closePlotForm}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Plot Number</label>
                    <input
                      type="text"
                      placeholder="Plot Number"
                      className="w-full p-2 border rounded bg-gray-100"
                      value={selectedPlot} // Use selectedPlot directly (the key)
                      readOnly // Make it read-only
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Plot Location in Venture</label>
                    <input
                      type="text"
                      placeholder="Plot Location in Venture"
                      className="w-full p-2 border rounded"
                      value={allPlotDetails[selectedPlot]?.plotLocation || ""}
                      onChange={(e) => handlePlotDetailChange("plotLocation", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Plot Facing</label>
                    <input
                      type="text"
                      placeholder="Plot Facing"
                      className="w-full p-2 border rounded"
                      value={allPlotDetails[selectedPlot]?.plotFacing || ""}
                      onChange={(e) => handlePlotDetailChange("plotFacing", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Plot Vaastu</label>
                    <input
                      type="text"
                      placeholder="Plot Vaastu"
                      className="w-full p-2 border rounded"
                      value={allPlotDetails[selectedPlot]?.plotVaastu || ""}
                      onChange={(e) => handlePlotDetailChange("plotVaastu", e.target.value)}
                    />
                  </div>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block font-medium mb-2">Plot Status</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={allPlotDetails[selectedPlot]?.status || "available"}
                    onChange={(e) => handlePlotDetailChange("status", e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Plot Documents</label>
                    <input
                      type="file"
                      onChange={(e) => handlePlotFileChange(e, "documents")}
                      className="w-full"
                      accept=".pdf,.doc,.docx"
                    />
                  </div>
                  <div>
                    <label className="block font-medium mb-1">Plot Images</label>
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handlePlotImageChange(e, "images")}
                      className="w-full"
                      accept=".jpg,.jpeg,.png"
                    />
                  </div>
                </div>

                {/* Additional Plot Details */}
                <div>
                  <label className="block font-medium mb-2">Additional Plot Details</label>
                  <textarea
                    placeholder="Enter any additional details about this plot..."
                    className="w-full p-2 border rounded"
                    rows="4"
                    value={allPlotDetails[selectedPlot]?.additionalDetails || ""}
                    onChange={(e) => handlePlotDetailChange("additionalDetails", e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={closePlotForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={savePlotDetails}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  disabled={loading}
                >
                  Save Plot Details (Local)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-between items-center">
        <button
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          onClick={handleReset}
          disabled={loading}
        >
          Reset Form
        </button>

        <div className="flex gap-4 items-center">
          {ventureId && (
            <span className="text-green-600 font-medium text-sm">
              Venture ID: {ventureId}
            </span>
          )}
          <button
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-400"
            onClick={handleSaveAll}
            disabled={loading || !ventureDetails.name || !ventureDetails.location || !ventureDetails.units}
          >
            {loading ? "Saving to Database..." : "Save All Property Details"}
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="text-lg font-medium">Saving property details...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyForm;