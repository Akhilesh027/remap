// src/pages/MyBookings.js
import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { toast } from '../components/Toast.jsx';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

const statusClasses = {
  Pending: 'bg-yellow-100 text-yellow-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
};

const MyBookings = ({ user }) => {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch driver bookings from backend
  useEffect(() => {
    const userId = localStorage.getItem('userId');         // string

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/cabs/driver/${userId}`);
        setBookings(res.data); // ✅ bookings from backend
      } catch (err) {
        console.error(err);
        toast('Failed to load your bookings.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?._id]);

  // 🔹 Filter bookings (search + status)
  const filteredBookings = useMemo(() => {
    const s = search.toLowerCase();
    return bookings.filter(b => {
      const matchSearch =
        !s ||
        b.executive?.toLowerCase().includes(s) ||
        b.pickup?.toLowerCase().includes(s) ||
        b.destination?.toLowerCase().includes(s);
      const matchStatus = filterStatus ? b.status === filterStatus : true;
      return matchSearch && matchStatus;
    });
  }, [bookings, search, filterStatus]);

  // 🔹 Update booking status
  const updateStatus = async (bookingId, newStatus, successMsg, errorMsg) => {
    try {
      await axios.put(`http://localhost:5000/api/cabs/${bookingId}`, { status: newStatus });
      setBookings(prev =>
        prev.map(b => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
      toast(successMsg, 'success');
    } catch (err) {
      console.error(err);
      toast(errorMsg, 'error');
    }
  };

  const startRide = bookingId =>
    updateStatus(bookingId, 'In Progress', 'Ride started.', 'Failed to start ride.');

  const completeRide = bookingId =>
    updateStatus(bookingId, 'Completed', 'Ride completed.', 'Failed to complete ride.');

  // 🔹 Open Map
  const openMap = (pickup, destination) => {
    let url = '';
    if (currentLocation) {
      url = `https://www.google.com/maps/dir/${encodeURIComponent(
        currentLocation
      )}/${encodeURIComponent(pickup)}/${encodeURIComponent(destination)}`;
    } else {
      url = `https://www.google.com/maps/dir/${encodeURIComponent(
        pickup
      )}/${encodeURIComponent(destination)}`;
    }
    window.open(url, '_blank');
  };

  // 🔹 Get current driver location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        setCurrentLocation(`${pos.coords.latitude},${pos.coords.longitude}`);
      },
      err => {
        console.error(err);
        // fallback handled in openMap
      }
    );
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">My Bookings</h1>

      {/* 🔎 Search + Filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search bookings..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border border-gray-300 rounded-lg px-4 py-2"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* 📋 Bookings Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">

        <table className="min-w-full table-auto text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Executive</th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Pickup</th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Destination</th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Time</th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
              <th className="px-6 py-3 text-left font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b._id} className="border-t">
                <td className="px-6 py-4">{b.executive}</td>
                <td className="px-6 py-4">{b.pickup}</td>
                <td className="px-6 py-4">{b.destination}</td>
                <td className="px-6 py-4">{new Date(b.time).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[b.status]
                      }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  {b.status === 'Pending' && (
                    <button
                      onClick={() => startRide(b._id)}
                      className="bg-blue-500 text-white px-3 py-1 rounded"
                    >
                      Start
                    </button>
                  )}
                  {b.status === 'In Progress' && (
                    <button
                      onClick={() => completeRide(b._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => openMap(b.pickup, b.destination)}
                    className="bg-gray-500 text-white px-3 py-1 rounded"
                  >
                    Map
                  </button>
                </td>
              </tr>
            ))}
            {!loading && filteredBookings.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center py-4 text-gray-500">
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default MyBookings;
