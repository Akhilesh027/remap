import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import './style.css'
// Fix for leaflet marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const PlotDetail = () => {
  const { plotNumber } = useParams();
  const [plot, setPlot] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState({
  name: "",
  phone: "",
  email: "",
  aadhaar: "",
  address: ""
});

  useEffect(() => {
    // Simulate API fetch
    const fetchPlotData = () => {
      const dummyPlot = {
        number: plotNumber,
        status: "Available",
        size: "200 sq. yds",
        price: "₹15,000 / sq. yd",
        facing: "East",
        vaastu: "Vaastu Compliant",
        buyer: null,
        latitude: 17.385,
        longitude: 78.4867,
        notes: "Premium corner plot near amenities with excellent road connectivity. Ideal for residential construction with scenic views.",
        documents: ["PlotLayout.pdf", "ApprovalLetter.pdf", "TitleDeed.pdf", "LocationMap.pdf"],
        amenities: ["Main Road Facing", "Park View", "Underground Electricity", "Water Connection"],
        plotType: "Residential"
      };
      setPlot(dummyPlot);
    };

    fetchPlotData();
  }, [plotNumber]);

  useEffect(() => {
    if (plot && mapRef.current) {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const map = L.map(mapRef.current).setView([plot.latitude, plot.longitude], 16);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      L.marker([plot.latitude, plot.longitude])
        .addTo(map)
        .bindPopup(`<div class="font-bold">Plot #${plot.number}</div><div>${plot.size}</div><div>${buyer ? 'Booked' : plot.status}</div>`)
        .openPopup();

      mapInstance.current = map;

      return () => {
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    }
  }, [plot, buyer]);

  const handleBookNow = () => {
    const bookingData = {
      name: "Akhilesh", // In real case you might fetch user name
      date: new Date().toLocaleDateString()
    };
    setBuyer(bookingData);
  };

  if (!plot) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Loading plot details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Congratulations Banner */}
        {buyer && (
          <div className="mb-6 text-center text-white font-bold bg-green-600 py-4 px-6 rounded-xl animate-bounce">
            🎉 Congratulations! Plot successfully booked by {buyer.name}! 🎉
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Plot <span className="text-blue-600">#{plot.number}</span>
            </h1>
            <p className="text-gray-600 mt-1">Detailed information about this residential plot</p>
          </div>
          <Link
            to="/ventureplotes"
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-medium px-5 py-3 rounded-xl shadow transition-all duration-200 border border-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Venture
          </Link>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details + Amenities */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Plot Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <DetailItem label="Status">
                    {buyer ? (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Booked</span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Available</span>
                    )}
                  </DetailItem>

                  {buyer ? (
                    <DetailItem label="Buyer Name">
                      <span>{buyer.name}</span>
                    </DetailItem>
                  ) : null}

                  {buyer ? (
                    <DetailItem label="Booking Date">
                      <span>{buyer.date}</span>
                    </DetailItem>
                  ) : (
                    <>
                      <DetailItem label="Plot Type">{plot.plotType}</DetailItem>
                      <DetailItem label="Price">
                        <div className="text-xl font-bold text-blue-600">{plot.price}</div>
                      </DetailItem>
                    </>
                  )}
                </div>

                {!buyer && (
                  <div className="space-y-4">
                    <DetailItem label="Size">{plot.size}</DetailItem>
                    <DetailItem label="Facing">{plot.facing}</DetailItem>
                    <DetailItem label="Vaastu">{plot.vaastu}</DetailItem>
                  </div>
                )}
              </div>

              {!buyer && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">Plot Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">{plot.notes}</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Amenities & Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plot.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {!buyer && (
  <>
    <button
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
      onClick={() => setShowModal(true)}
    >
      Book Now
    </button>

    {showModal && (
      <BookingModal
        formData={formData}
        setFormData={setFormData}
        setShowModal={setShowModal}
        setBuyer={setBuyer}
      />
    )}
  </>
)}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <DocumentsCard plot={plot} />
            <LocationCard plot={plot} mapRef={mapRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable subsections
const DetailItem = ({ label, children }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <div className="mt-1 text-gray-900">{children}</div>
  </div>
);

const DocumentsCard = ({ plot }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Plot Documents</h2>
    <div className="space-y-3">
      {plot.documents.map((doc, index) => (
        <a key={index} href="#" className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <span className="font-medium text-gray-700">{doc}</span>
        </a>
      ))}
    </div>
  </div>
);

const LocationCard = ({ plot, mapRef }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Location</h2>
    <div className="h-72 rounded-xl overflow-hidden border border-gray-200" ref={mapRef}></div>
    <div className="mt-4 flex flex-wrap gap-2">
      <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1.5 rounded-full">
        Lat: {plot.latitude.toFixed(4)}
      </div>
      <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1.5 rounded-full">
        Lng: {plot.longitude.toFixed(4)}
      </div>
    </div>
  </div>
);
const BookingModal = ({ formData, setFormData, setShowModal, setBuyer }) => {
  const handleConfirm = () => {
    setBuyer({
      ...formData,
      date: new Date().toLocaleDateString(),
    });
    setShowModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <h2 className="modal-title">Booking Details</h2>

        {/* Close button */}
        <button className="close-btn" onClick={() => setShowModal(false)}>
          ×
        </button>

        {/* FORM */}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="text"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Aadhaar Number</label>
          <input
            type="text"
            value={formData.aadhaar}
            onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Pan Number</label>
          <input
            type="text"
            value={formData.pan} // Fixed from previous duplicate
            onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            rows={2}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          ></textarea>
        </div>

        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default PlotDetail;
