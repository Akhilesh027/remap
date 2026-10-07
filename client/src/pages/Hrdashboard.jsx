// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HomeIcon, DocumentTextIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import StatCard from '../components/StatCard.jsx';
import BarChart from '../components/BarChart.jsx';
import RecruitmentPipeline from '../components/RecruitmentPipeline.jsx';

const HrDashboard = () => {
  const [stats, setStats] = useState([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch HR dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await axios.get('http://localhost:5000/api/hr/stats');
      setStats([
        { title: 'Total Employees', value: statsRes.data.totalEmployees, icon: <HomeIcon className="h-6 w-6 text-white" />, color: 'bg-indigo-500' },
        { title: 'Pending Leave Requests', value: statsRes.data.pendingLeaves, icon: <DocumentTextIcon className="h-6 w-6 text-white" />, color: 'bg-yellow-500' },
        { title: 'Active Recruitment', value: statsRes.data.activeRecruitments, icon: <BriefcaseIcon className="h-6 w-6 text-white" />, color: 'bg-green-500' },
      ]);

      // Fetch weekly attendance
      const attendanceRes = await axios.get('http://localhost:5000/api/hr/weekly-attendance');
      setWeeklyAttendance(attendanceRes.data);
      // Expected format: [{ day: 'Mon', present: 135, late: 7 }, ...]

      // Fetch notifications
      const notificationsRes = await axios.get('http://localhost:5000/api/hr/notifications');
      setNotifications(notificationsRes.data);
      // Expected format: [{ id, message, time }, ...]

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">HR Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Recruitment Pipeline</h2>
          <RecruitmentPipeline />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Weekly Attendance Overview</h2>
          <BarChart data={weeklyAttendance} />
        </div>
      </div>

      {/* Notifications Panel */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Pending Approvals</h2>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{notifications.length} pending</span>
        </div>

        <div className="space-y-4">
          {notifications.map(notification => (
            <div key={notification.id} className="flex items-start border-b pb-4 last:border-0 last:pb-0">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
              <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Review
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HrDashboard;
