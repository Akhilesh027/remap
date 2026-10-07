import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

/**************************  STATUS METADATA  ***************************/
const STATUS_META = {
  available: { label: "Available", color: "#4CAF50" },
  booked: { label: "Booked", color: "#FF9800" },
  sold: { label: "Sold", color: "#F44336" },
  default: { label: "Unknown", color: "#9e9e9e" },
};
const getStatusMeta = (status) => STATUS_META[status] || STATUS_META.default;

/**************************  COMPONENT  ***************************/
const VenturePlots = () => {
  const navigate = useNavigate();
  const { ventureId } = useParams();

  // State for fetched data
  const [ventureData, setVentureData] = useState(null);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ number: "", facing: "", status: "", vaastu: "" });

  // Modal control state
  const [selectedPlot, setSelectedPlot] = useState(null);

  // --- API Fetching Logic ---
  useEffect(() => {
    if (!ventureId) {
      setError("Venture ID not provided in the URL.");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:5000/api/ventures/${ventureId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch venture details (Status: ${response.status}).`);
        }

        const json = await response.json();
        const dataToUse = json.data || json;

        setVentureData(dataToUse);

      } catch (err) {
        console.error("Fetch Error:", err);
        setError(err.message || "An unexpected error occurred while loading data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ventureId]);

  // --- Derived Data: Extract plots from the fetched ventureData ---
  const plotsData = useMemo(() => {
    return ventureData?.plots || [];
  }, [ventureData]);

  // --- Memoized Calculations ---
  const counts = useMemo(() => {
    const total = plotsData.length;
    let booked = 0, sold = 0;
    plotsData.forEach((p) => {
      if (p.status === "booked") booked++;
      if (p.status === "sold") sold++;
    });
    return { total, booked, sold, available: total - booked - sold };
  }, [plotsData]);

  const filteredPlots = useMemo(() => {
    return plotsData.filter((plot) => {
      const matchNumber = filter.number ? String(plot.plotNumber).includes(filter.number.trim()) : true;
      const matchFacing = filter.facing ? plot.plotFacing?.toLowerCase() === filter.facing.toLowerCase() : true;
      const matchStatus = filter.status ? plot.status?.toLowerCase() === filter.status.toLowerCase() : true;
      const matchVaastu = filter.vaastu ? plot.plotVaastu?.toLowerCase() === filter.vaastu.toLowerCase() : true;
      return matchNumber && matchFacing && matchStatus && matchVaastu;
    });
  }, [filter, plotsData]);

  const clearFilters = () => setFilter({ number: "", facing: "", status: "", vaastu: "" });

  // --- Conditional Rendering for Loading/Error States ---
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Loading Venture Plots...</h2>
        <p className="text-gray-500">Fetching data for Venture ID: {ventureId}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-semibold text-red-600 mb-2">Data Error</h2>
        <p className="text-gray-700">{error}</p>
      </div>
    );
  }

  if (!ventureData) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-semibold text-orange-600 mb-2">Venture Not Found</h2>
        <p className="text-gray-700">The venture with ID {ventureId} could not be loaded.</p>
      </div>
    );
  }

  // --- Main Render ---
  const {
    name,
    location,
    highlights,
    pricing,
    brochure,
    layout,
    contact
  } = ventureData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Modal */}
      {selectedPlot && (
        <PlotDetailsModal
          plot={selectedPlot}
          onClose={() => setSelectedPlot(null)}
          ventureId={ventureId}
        />
      )}

      {/* Venture Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="venture-info">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{name || 'Unknown Venture'}</h2>
            <p className="text-lg text-gray-600 mb-4">{location || 'Location Not Specified'}</p>
            <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
              {(highlights || []).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-3">
              <a href={brochure || '#'} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium">
                Venture Brochure
              </a>
              <a href={layout || '#'} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium">
                Venture Layout
              </a>
            </div>
          </div>

          <div className="venture-stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoCard label="Total" value={counts.total} color="#4CAF50" />
              <InfoCard label="Available" value={counts.available} color="#4CAF50" />
              <InfoCard label="Booked" value={counts.booked} color="#FF9800" />
              <InfoCard label="Sold" value={counts.sold} color="#F44336" />
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-800 font-semibold text-lg">
                Starting Price: {pricing || 'Price N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search Plot No."
            value={filter.number}
            onChange={(e) => setFilter({ ...filter, number: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filter.facing}
            onChange={(e) => setFilter({ ...filter, facing: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Facing</option>
            <option value="East">East</option>
            <option value="West">West</option>
            <option value="North">North</option>
            <option value="South">South</option>
          </select>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Status</option>
            <option value="available">Available</option>
            <option value="booked">Booked</option>
            <option value="sold">Sold</option>
          </select>
          <select
            value={filter.vaastu}
            onChange={(e) => setFilter({ ...filter, vaastu: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Vaastu</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
          <button
            onClick={clearFilters}
            className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Plots Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-3">
          Plots ({filteredPlots.length} of {counts.total} shown)
        </h3>
        <PlotGrid
          filteredPlots={filteredPlots}
          onPlotClick={(plot) => {
            if (plot.status === "available") {
              setSelectedPlot(plot);
            } else {
              const statusMeta = getStatusMeta(plot.status);
              alert(`This plot is ${statusMeta.label.toLowerCase()}. ${plot.buyer ? `Buyer: ${plot.buyer}` : ''} ${plot.bookingRef ? `Booking Ref: ${plot.bookingRef}` : ''}`);
            }
          }}
        />
        <div className="flex flex-wrap gap-6 mt-6">
          <Legend color="#4CAF50" label="Available" />
          <Legend color="#FF9800" label="Booked" />
          <Legend color="#F44336" label="Sold" />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">FAQs</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>What is the starting price of plots? – {pricing || 'Not specified'}</li>
          <li>Are plots RERA approved? – Yes, all plots have necessary approvals.</li>
          <li>Can I book a plot online? – Yes, you can send an enquiry or booking request online.</li>
        </ul>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h3>
        <div className="text-gray-700 space-y-2">
          <p className="font-medium">{ventureData.contact?.name || 'Sales Team'}</p>
          <p>Phone: <a href={`tel:${ventureData.contact?.phone}`} className="text-blue-500 hover:text-blue-600">{ventureData.contact?.phone || 'N/A'}</a></p>
          <p>Email: <a href={`mailto:${ventureData.contact?.email}`} className="text-blue-500 hover:text-blue-600">{ventureData.contact?.email || 'N/A'}</a></p>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// SUBCOMPONENTS 
// ----------------------------------------------------------------------

const PlotDetailsModal = ({ plot, onClose, ventureId }) => {
  if (!plot) return null;

  const meta = getStatusMeta(plot.status);

  const handleBookNow = () => {
    alert(`Booking process initiated for Plot No. ${plot.plotNumber} in Venture ${ventureId}.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-6">
          <h3 className="text-2xl font-semibold text-gray-800">Plot Details: #{plot.plotNumber}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <p><strong>Status:</strong> <span style={{ color: meta.color }} className="font-semibold">{meta.label}</span></p>
          <p><strong>Facing:</strong> {plot.plotFacing || 'Not available'}</p>
          <p><strong>Vaastu:</strong> {plot.plotVaastu || 'N/A'}</p>
          <p><strong>Location Details:</strong> {plot.plotLocation || 'Not specified'}</p>
          <p><strong>Additional Info:</strong> {plot.additionalDetails || 'None'}</p>
        </div>
        <div className="flex justify-end gap-3 border-t p-6">
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200">
            Close
          </button>
          {plot.status === 'available' && (
            <button onClick={handleBookNow} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200">
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value, color }) => (
  <div className="bg-white border-l-4 rounded-lg p-4 shadow-sm transition-transform duration-200 hover:transform hover:-translate-y-1" style={{ borderLeftColor: color, backgroundColor: `${color}20` }}>
    <p className="text-2xl font-bold mb-1" style={{ color }}>{value}</p>
    <p className="text-gray-600 text-sm">{label}</p>
  </div>
);

const Legend = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded" style={{ backgroundColor: color }}></div>
    <span className="text-gray-700">{label}</span>
  </div>
);

const PlotGrid = ({ filteredPlots, onPlotClick }) => (
  <div className="mb-4">
    {filteredPlots.length > 0 ? (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {filteredPlots.map((plot) => {
          const meta = getStatusMeta(plot.status);
          return (
            <button
              key={plot.plotNumber}
              onClick={() => onPlotClick(plot)}
              className="aspect-square rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center text-lg"
              style={{
                backgroundColor: meta.color,
                boxShadow: `0 4px 8px ${meta.color}40`,
                cursor: plot.status === 'available' ? 'pointer' : 'not-allowed',
                opacity: plot.status === 'available' ? 1 : 0.7
              }}
            >
              {plot.plotNumber}
            </button>
          );
        })}
      </div>
    ) : (
      <div className="text-center py-8 text-gray-500 italic">
        No plots match your filters.
      </div>
    )}
  </div>
);

export default VenturePlots;