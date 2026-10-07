// src/pages/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'yesterday', 'custom'
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: '',
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/attendance');
      const formattedData = response.data.map((record) => {
        const login = new Date(record.loginTime);
        const logout = record.logoutTime ? new Date(record.logoutTime) : null;

        let workingHours = '-';
        if (logout) {
          const diffMs = logout - login;
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          workingHours = `${hours}h ${minutes}m`;
        }

        return {
          id: record._id,
          name: record.userId?.name || 'Unknown',
          email: record.userId?.email || '-',
          role: record.userId?.role || '-',
          loginTime: login,
          logoutTime: logout,
          checkIn: login.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          checkOut: logout
            ? logout.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : '-',
          workingHours,
          status: logout ? 'Completed' : 'In Progress',
        };
      });
      setAttendanceData(formattedData);
      setFilteredData(formattedData);
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Filter based on search and date
  useEffect(() => {
    let data = [...attendanceData];

    // Search filter
    if (searchTerm) {
      data = data.filter((emp) =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date filter
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateFilter === 'today') {
      data = data.filter(
        (emp) =>
          emp.loginTime >= today &&
          emp.loginTime <= new Date(today.getTime() + 24 * 60 * 60 * 1000)
      );
    } else if (dateFilter === 'yesterday') {
      data = data.filter(
        (emp) =>
          emp.loginTime >= yesterday &&
          emp.loginTime < today
      );
    } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
      const start = new Date(customDateRange.start);
      const end = new Date(customDateRange.end);
      end.setHours(23, 59, 59, 999);
      data = data.filter(
        (emp) => emp.loginTime >= start && emp.loginTime <= end
      );
    }

    setFilteredData(data);
  }, [searchTerm, dateFilter, customDateRange, attendanceData]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Tracking</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex top-3 pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Predefined Date Filters */}
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 rounded-lg ${dateFilter === 'today' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
              }`}
            onClick={() => setDateFilter('today')}
          >
            Today
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${dateFilter === 'yesterday' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
              }`}
            onClick={() => setDateFilter('yesterday')}
          >
            Yesterday
          </button>
          <button
            className={`px-3 py-1 rounded-lg ${dateFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200'
              }`}
            onClick={() => setDateFilter('all')}
          >
            All
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="flex space-x-2">
          <input
            type="date"
            value={customDateRange.start}
            onChange={(e) => {
              setCustomDateRange({ ...customDateRange, start: e.target.value });
              setDateFilter('custom');
            }}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={customDateRange.end}
            onChange={(e) => {
              setCustomDateRange({ ...customDateRange, end: e.target.value });
              setDateFilter('custom');
            }}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">Loading attendance...</div>
        ) : (
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-3 px-6 text-left">#</th>
                <th className="py-3 px-6 text-left">Employee Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-left">Check-in Time</th>
                <th className="py-3 px-6 text-left">Check-out Time</th>
                <th className="py-3 px-6 text-left">Working Hours</th>
                <th className="py-3 px-6 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-4 px-6 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                filteredData.map((employee, index) => (
                  <tr key={employee.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-6">{index + 1}</td>
                    <td className="py-3 px-6 font-medium">{employee.name}</td>
                    <td className="py-3 px-6">{employee.email}</td>
                    <td className="py-3 px-6">{employee.role}</td>
                    <td className="py-3 px-6">{employee.checkIn}</td>
                    <td className="py-3 px-6">{employee.checkOut}</td>
                    <td className="py-3 px-6">{employee.workingHours}</td>
                    <td className="py-3 px-6">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${employee.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Attendance;
