import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const DriverDashboard = () => {
  const driverName = "Rajesh Kumar"; // Example driver
  const [bookings, setBookings] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem('userId');         // string

  // Fetch bookings for driver
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/bookings/driver/${userId}`);
        setBookings(res.data);
        setError("");
      } catch (err) {
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchBookings();
  }, [userId]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-gray-100 text-gray-700 line-through";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setCurrentLocation(mapsLink);
        alert("Location shared successfully!");
      },
      () => alert("Unable to fetch location.")
    );
  };

  // Start ride: mark booking as 'In Progress' and open navigation
  const startRide = async (booking) => {
    try {
      await axios.put(`${API_BASE_URL}/cabbookings/${booking._id}/status`, {
        status: "In Progress",
      });
      setBookings((prev) =>
        prev.map((b) =>
          b._id === booking._id ? { ...b, status: "In Progress" } : b
        )
      );
      // Open Google Maps directions
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        booking.pickup
      )}&destination=${encodeURIComponent(booking.destination)}`;
      window.open(url, "_blank");
    } catch {
      alert("Failed to start the ride.");
    }
  };

  // Complete ride: mark booking as 'Completed'
  const completeRide = async (bookingId) => {
    try {
      await axios.put(`${API_BASE_URL}/cabbookings/${bookingId}/status`, {
        status: "Completed",
      });
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: "Completed" } : b))
      );
      alert("Ride marked as completed.");
    } catch {
      alert("Failed to update ride status.");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading dashboard...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Calculate quick stats dynamically
  const pendingCount = bookings.filter((b) => b.status === "Pending").length;
  const inProgressCount = bookings.filter((b) => b.status === "In Progress").length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;
  const earnings = completedCount * 1500; // Replace with real data if available

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {driverName}. Manage your rides efficiently.
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button
            onClick={shareLocation}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 flex items-center"
            aria-label="Share Location"
          >
            <i className="fas fa-location-arrow mr-2"></i> Share Location
          </button>
        </div>
      </div>

      {/* Current Location */}
      {currentLocation && (
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-gray-700 text-sm">
            Current Location:{" "}
            <a
              href={currentLocation}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open in Maps
            </a>
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Pending Rides</p>
            <h2 className="text-2xl font-bold">{pendingCount}</h2>
          </div>
          <i className="fas fa-clock text-yellow-500 text-3xl"></i>
        </div>
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">In Progress</p>
            <h2 className="text-2xl font-bold">{inProgressCount}</h2>
          </div>
          <i className="fas fa-road text-blue-500 text-3xl"></i>
        </div>
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Completed Rides</p>
            <h2 className="text-2xl font-bold">{completedCount}</h2>
          </div>
          <i className="fas fa-check-circle text-green-500 text-3xl"></i>
        </div>
        <div className="bg-white shadow rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Earnings</p>
            <h2 className="text-2xl font-bold">₹{earnings.toLocaleString()}</h2>
          </div>
          <i className="fas fa-rupee-sign text-indigo-500 text-3xl"></i>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700">My Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-left">
                <th className="px-6 py-3">Executive</th>
                <th className="px-6 py-3">Pickup</th>
                <th className="px-6 py-3">Destination</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{b.executive}</td>
                  <td className="px-6 py-3">{b.pickup}</td>
                  <td className="px-6 py-3">{b.destination}</td>
                  <td className="px-6 py-3">{b.time}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(b.status)}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex gap-3">
                      {b.status === "Pending" && (
                        <button
                          onClick={() => startRide(b)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                          aria-label={`Start ride from ${b.pickup} to ${b.destination}`}
                        >
                          Start Ride
                        </button>
                      )}
                      {b.status === "In Progress" && (
                        <button
                          onClick={() => completeRide(b._id)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium"
                          aria-label="Complete Ride"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No bookings available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
