import React, { useState, useEffect } from 'react';
import {
  CalendarIcon,
  PhotoIcon,
  VideoCameraIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customer and updates data
  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      let customerId = localStorage.getItem('clientId');
      if (!customerId || customerId === '68ff26dd7280b696d20a4f16') {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const clientsRes = await fetch('http://localhost:5000/api/clients');
        if (clientsRes.ok) {
          const clientsList = await clientsRes.json();
          const match = (Array.isArray(clientsList) && (clientsList.find(c => c.email === storedUser.email) || clientsList[0])) || null;
          if (match) {
            customerId = match._id;
            localStorage.setItem('clientId', customerId);
          }
        }
      }

      const response = await fetch(`http://localhost:5000/api/clients/${customerId || ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }

      const customerData = await response.json();
      setCustomer(customerData);

      // Use the updates array from customer data, or create from documents if needed
      const customerUpdates = customerData.updates || [];
      setUpdates(customerUpdates);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get relative time
  const getRelativeTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Get update icon based on content
  const getUpdateIcon = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('video') || msg.includes('recording')) {
      return <VideoCameraIcon className="w-5 h-5 text-red-500" />;
    } else if (msg.includes('photo') || msg.includes('image') || msg.includes('picture')) {
      return <PhotoIcon className="w-5 h-5 text-green-500" />;
    } else if (msg.includes('document') || msg.includes('paper') || msg.includes('file')) {
      return <DocumentTextIcon className="w-5 h-5 text-blue-500" />;
    } else if (msg.includes('construction') || msg.includes('building') || msg.includes('site')) {
      return <BuildingStorefrontIcon className="w-5 h-5 text-orange-500" />;
    }
    return <ClockIcon className="w-5 h-5 text-indigo-500" />;
  };

  // Get placeholder image based on update content
  const getPlaceholderImage = (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('foundation')) {
      return 'https://via.placeholder.com/600x300/3B82F6/FFFFFF?text=Foundation+Work';
    } else if (msg.includes('electric') || msg.includes('power')) {
      return 'https://via.placeholder.com/600x300/10B981/FFFFFF?text=Electrical+Work';
    } else if (msg.includes('boundary') || msg.includes('marking')) {
      return 'https://via.placeholder.com/600x300/F59E0B/FFFFFF?text=Plot+Marking';
    } else if (msg.includes('cleaning') || msg.includes('site')) {
      return 'https://via.placeholder.com/600x300/6B7280/FFFFFF?text=Site+Preparation';
    } else if (msg.includes('document') || msg.includes('paperwork')) {
      return 'https://via.placeholder.com/600x300/EF4444/FFFFFF?text=Document+Update';
    } else if (msg.includes('construction') || msg.includes('progress')) {
      return 'https://via.placeholder.com/600x300/8B5CF6/FFFFFF?text=Construction+Progress';
    }
    return 'https://via.placeholder.com/600x300/3B82F6/FFFFFF?text=Project+Update';
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project updates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-lg mb-4">Error loading updates</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomerData}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-2">
            Project Updates
          </h1>
          <p className="text-gray-600">
            {customer?.clientName ? `Latest updates for ${customer.clientName}'s property` : 'Your property development progress'}
          </p>
          {updates.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {updates.length} update{updates.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* Updates Timeline */}
        {updates.length > 0 ? (
          <div className="space-y-8 relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-indigo-200 transform -translate-x-1/2"></div>

            {updates.map((update, index) => (
              <div key={update._id || update.id || index} className="relative flex items-start">
                {/* Timeline dot */}
                <div className="absolute left-6 transform -translate-x-1/2 z-10">
                  <div className="w-4 h-4 bg-indigo-600 rounded-full border-4 border-white shadow"></div>
                </div>

                {/* Update card */}
                <div className="ml-12 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden flex-1">
                  {/* Update header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {getUpdateIcon(update.message)}
                        <h2 className="text-lg font-semibold text-gray-800">
                          {update.message.split(':')[0] || 'Project Update'}
                        </h2>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          {formatDate(update.date)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {getRelativeTime(update.date)}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {update.message}
                    </p>
                  </div>

                  {/* Update media (placeholder images based on content) */}
                  <div className="p-6 pt-4">
                    <img
                      src={getPlaceholderImage(update.message)}
                      alt={update.message}
                      className="w-full rounded-lg border border-gray-200 object-cover h-48"
                    />

                    {/* Optional video placeholder for certain updates */}
                    {(update.message.toLowerCase().includes('video') ||
                      update.message.toLowerCase().includes('recording')) && (
                        <div className="mt-4 bg-gray-100 rounded-lg p-4 text-center">
                          <VideoCameraIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            Video recording available - Contact site manager for access
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Update actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        Update #{updates.length - index}
                      </span>
                      <button
                        onClick={() => {
                          // In a real app, this would share the update
                          alert(`Sharing update: ${update.message}`);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Share Update
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No updates available</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {customer?.clientName
                ? `We'll post updates about ${customer.clientName}'s property development here soon.`
                : 'Your property development updates will appear here once they are available.'
              }
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={fetchCustomerData}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Check for Updates
              </button>
            </div>
          </div>
        )}

        {/* Progress Summary */}
        {updates.length > 0 && customer && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Update Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">{updates.length}</div>
                <div className="text-sm text-blue-600">Total Updates</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {formatDate(updates[0]?.date)}
                </div>
                <div className="text-sm text-green-600">Latest Update</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {customer.currentPhase || 'N/A'}
                </div>
                <div className="text-sm text-purple-600">Current Phase</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {customer.status || 'Active'}
                </div>
                <div className="text-sm text-orange-600">Project Status</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Updates;