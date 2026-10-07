import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import MainPage from '../components/Mainpage.jsx'
import { mockData } from '../utils/data.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = ({ user, logout, darkMode, setDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const leadSourceData = {
    labels: ['Website', 'Referral', 'Walk-in', 'Social Media', 'Others'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#94a3b8']
    }]
  };

  const progressData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Properties Sold',
      data: [12, 19, 8, 15, 22, 18],
      backgroundColor: '#4f46e5'
    }]
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
     
      
      <div className="flex-1 flex flex-col">
       
        <main className="flex-1 overflow-y-auto p-6">
          {/* Dashboard content same as original */}
          <MainPage/>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;