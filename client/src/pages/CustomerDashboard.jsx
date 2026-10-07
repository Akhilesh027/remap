import React, { useState, useEffect } from 'react';

const phases = [
  'Pre-design',
  'Design',
  'Procurement',
  'Construction',
  'Post-construction',
];

const CustomerDashboard = () => {
  const [customer, setCustomer] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [referralForm, setReferralForm] = useState({
    referralName: '',
    referralContact: '',
    relationship: '',
    message: ''
  });

  // Save client ID to localStorage
  const saveClientIdToLocalStorage = (clientId) => {
    try {
      localStorage.setItem('clientId', clientId);
      console.log('Client ID saved to localStorage:', clientId);
    } catch (err) {
      console.error('Error saving client ID to localStorage:', err);
    }
  };

  // Get client ID from localStorage
  const getClientIdFromLocalStorage = () => {
    try {
      return localStorage.getItem('clientId');
    } catch (err) {
      console.error('Error getting client ID from localStorage:', err);
      return null;
    }
  };

  // Clear client ID from localStorage (useful for logout)
  const clearClientIdFromLocalStorage = () => {
    try {
      localStorage.removeItem('clientId');
      console.log('Client ID cleared from localStorage');
    } catch (err) {
      console.error('Error clearing client ID from localStorage:', err);
    }
  };

  // Fetch user data first, then customer data
  const fetchUserAndCustomerData = async () => {
    try {
      setLoading(true);

      // In a real app, you'd get the user ID from authentication context
      const userId = localStorage.getItem('userId'); // This should come from your auth system

      if (!userId) {
        throw new Error('No user ID found in localStorage');
      }

      // Step 1: Fetch user details to get the clientId (employeeid)
      const userResponse = await fetch(`http://localhost:5000/api/users/${userId}`);

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUser(userData);

      // Step 2: Use clientId or lookup from clients list by email
      let clientId = userData.employeeId || userData.clientId || getClientIdFromLocalStorage();

      if (!clientId || clientId === '68ff26dd7280b696d20a4f16') {
        const clientsRes = await fetch('http://localhost:5000/api/clients');
        if (clientsRes.ok) {
          const clientsList = await clientsRes.json();
          const match = (Array.isArray(clientsList) && (clientsList.find(c => c.email === userData.email) || clientsList[0])) || null;
          if (match) {
            clientId = match._id;
          }
        }
      }

      if (!clientId) {
        throw new Error('No client ID found for this user');
      }

      // Save client ID to localStorage
      saveClientIdToLocalStorage(clientId);

      const customerResponse = await fetch(`http://localhost:5000/api/clients/${clientId}`);

      if (!customerResponse.ok) {
        throw new Error('Failed to fetch customer data');
      }

      const customerData = await customerResponse.json();
      setCustomer(customerData);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer data using client ID from localStorage or direct input
  const fetchCustomerData = async () => {
    try {
      setLoading(true);

      // Try to get client ID from localStorage first
      let clientId = getClientIdFromLocalStorage();

      if (!clientId || clientId === '68ff26dd7280b696d20a4f16') {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const clientsRes = await fetch('http://localhost:5000/api/clients');
        if (clientsRes.ok) {
          const clientsList = await clientsRes.json();
          const match = (Array.isArray(clientsList) && (clientsList.find(c => c.email === storedUser.email) || clientsList[0])) || null;
          if (match) {
            clientId = match._id;
            saveClientIdToLocalStorage(clientId);
          }
        }
      }

      console.log('Fetching data for client ID:', clientId);

      const response = await fetch(`http://localhost:5000/api/clients/${clientId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch customer data');
      }

      const customerData = await response.json();
      setCustomer(customerData);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle client ID change (useful for testing different clients)
  const handleClientIdChange = (newClientId) => {
    if (newClientId && newClientId.trim()) {
      saveClientIdToLocalStorage(newClientId.trim());
      alert(`Client ID updated to: ${newClientId.trim()}`);
      fetchCustomerData(); // Refresh data with new client ID
    }
  };

  // Handle referral form submission
  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/referrals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer._id,
          customerName: customer.clientName,
          ...referralForm
        }),
      });

      if (response.ok) {
        alert('Referral submitted successfully!');
        setReferralForm({
          referralName: '',
          referralContact: '',
          relationship: '',
          message: ''
        });
      } else {
        throw new Error('Failed to submit referral');
      }
    } catch (err) {
      alert('Error submitting referral. Please try again.');
      console.error('Error submitting referral:', err);
    }
  };

  // Handle input changes for referral form
  const handleReferralInputChange = (e) => {
    const { name, value } = e.target;
    setReferralForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchCustomerData(); // Use the main fetch function
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Error loading dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchCustomerData}
              className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 block mx-auto"
            >
              Try Again
            </button>
            <button
              onClick={clearClientIdFromLocalStorage}
              className="text-sm text-gray-500 underline"
            >
              Clear stored client ID
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No customer data found.</p>
          <button
            onClick={fetchCustomerData}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 mt-4"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header + Banner */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-indigo-700">
          Welcome, {customer.clientName}!
        </h1>
        <p className="text-gray-600 mt-2">Your property dashboard</p>
        {user && (
          <p className="text-sm text-gray-500 mt-1">
            Logged in as: {user.name || user.email}
          </p>
        )}

        {/* Client ID Info (for debugging) */}
        <div className="mt-2 text-xs text-gray-400">
          Client ID: {getClientIdFromLocalStorage()}
          <button
            onClick={() => {
              const newClientId = prompt('Enter new Client ID:', getClientIdFromLocalStorage());
              if (newClientId) handleClientIdChange(newClientId);
            }}
            className="ml-2 text-blue-500 hover:text-blue-700 underline"
          >
            Change
          </button>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {/* Venture & Plot Summary + Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Venture Details */}
        <div className="bg-white shadow rounded-lg p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Property Details</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <strong className="text-gray-600">Venture Name:</strong>
              <p className="text-gray-900">{customer.ventureName || customer.propertyName || 'N/A'}</p>
            </div>
            <div>
              <strong className="text-gray-600">Location:</strong>
              <p className="text-gray-900">{customer.location || customer.propertyLocation || 'N/A'}</p>
            </div>
            <div>
              <strong className="text-gray-600">Plot Number:</strong>
              <p className="text-gray-900">{customer.plotNumber || customer.plote || 'N/A'}</p>
            </div>
            <div>
              <strong className="text-gray-600">Plot Size:</strong>
              <p className="text-gray-900">{customer.plotSize || 'N/A'}</p>
            </div>
            <div>
              <strong className="text-gray-600">Facing:</strong>
              <p className="text-gray-900">{customer.facing || 'N/A'}</p>
            </div>
            <div>
              <strong className="text-gray-600">Status:</strong>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${customer.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : customer.status === 'Completed'
                    ? 'bg-blue-100 text-blue-800'
                    : customer.status === 'On Hold'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}>
                {customer.status || 'N/A'}
              </span>
            </div>
            <div>
              <strong className="text-gray-600">Vastu:</strong>
              <p className="text-gray-900">{customer.vastu || 'N/A'}</p>
            </div>
            <div>
              <strong className="text-gray-600">Price:</strong>
              <p className="text-gray-900">₹{customer.price?.toLocaleString('en-IN') || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Project Progress</h2>
          <div className="flex flex-col space-y-3">
            {phases.map((phase, index) => (
              <div key={phase} className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${index === (customer.currentPhase - 1)
                    ? 'bg-blue-600 animate-pulse'
                    : index < (customer.currentPhase - 1)
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}></div>
                <span className={`text-sm ${index === (customer.currentPhase - 1)
                    ? 'font-bold text-blue-700'
                    : index < (customer.currentPhase - 1)
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}>
                  {phase}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Current Phase: <strong>{phases[customer.currentPhase - 1] || 'Not Started'}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex space-x-4 mb-4 border-b overflow-x-auto">
          {['overview', 'land', 'ownership', 'sro', 'location', 'survey', 'legal', 'updates', 'documents'].map((tab) => (
            <button
              key={tab}
              className={`capitalize pb-2 border-b-2 whitespace-nowrap ${activeTab === tab
                  ? 'border-indigo-600 text-indigo-600 font-semibold'
                  : 'border-transparent text-gray-500'
                }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="min-h-64">
          {activeTab === 'overview' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Overview</h3>
              <p className="text-gray-600">
                {customer.overview || `This is a premium residential plot located in ${customer.ventureName || customer.propertyName} with ${customer.vastu ? 'vastu-compliant' : ''} design and clear documentation.`}
              </p>
            </div>
          )}

          {activeTab === 'land' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Land / Plot Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-gray-600">Plot Size:</strong>
                  <p className="text-gray-900">{customer.plotSize || 'N/A'}</p>
                </div>
                <div>
                  <strong className="text-gray-600">Facing:</strong>
                  <p className="text-gray-900">{customer.facing || 'N/A'}</p>
                </div>
                <div>
                  <strong className="text-gray-600">Vastu:</strong>
                  <p className="text-gray-900">{customer.vastu || 'N/A'}</p>
                </div>
                <div>
                  <strong className="text-gray-600">Category:</strong>
                  <p className="text-gray-900">Residential</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ownership' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Ownership Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-gray-600">Previous Owner:</strong>
                  <p className="text-gray-900">{customer.previousOwner || 'N/A'}</p>
                </div>
                <div>
                  <strong className="text-gray-600">Current Owner:</strong>
                  <p className="text-gray-900">{customer.clientName}</p>
                </div>
                <div>
                  <strong className="text-gray-600">Email:</strong>
                  <p className="text-gray-900">{customer.email}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sro' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">SRO & Registration Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-gray-600">Registration Office:</strong>
                  <p className="text-gray-900">{customer.registrationOffice || 'N/A'}</p>
                </div>
                <div>
                  <strong className="text-gray-600">Registration Number:</strong>
                  <p className="text-gray-900">{customer.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <strong className="text-gray-600">Registration Date:</strong>
                  <p className="text-gray-900">{formatDate(customer.registrationDate)}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Location Details</h3>
              <div className="mb-4">
                <strong className="text-gray-600">Plot Address:</strong>
                <p className="text-gray-900">{customer.plotAddress || `${customer.location || customer.propertyLocation}, ${customer.ventureName || customer.propertyName}`}</p>
              </div>
              <iframe
                title="Property Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(customer.location || customer.propertyLocation || 'Hyderabad')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-64 rounded border-0"
                loading="lazy"
              ></iframe>
            </div>
          )}

          {activeTab === 'survey' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Survey Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-gray-600">Survey Number:</strong>
                  <p className="text-gray-900">{customer.surveyNumber || 'N/A'}</p>
                </div>
                <div>
                  <strong className="text-gray-600">Survey Reference:</strong>
                  <p className="text-gray-900">{customer.surveyReference || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Legal Status</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{customer.legalStatus || 'Status: Fully cleared, HMDA approved, no encumbrances.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'updates' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Project Updates</h3>
              {customer.updates && customer.updates.length > 0 ? (
                <div className="space-y-3">
                  {customer.updates.map((update, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
                      <p className="text-gray-800">{update.message}</p>
                      <p className="text-sm text-gray-500 mt-1">{formatDate(update.date)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No updates available at the moment.</p>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Documents</h3>
              {customer.documents && customer.documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customer.documents.map((doc, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-800">{doc.name}</h4>
                          <p className="text-sm text-gray-600">{doc.type}</p>
                          <p className="text-xs text-gray-500">{formatDate(doc.date)}</p>
                        </div>
                        <button
                          onClick={() => {
                            // In a real app, this would download the actual file
                            alert(`Downloading: ${doc.name}`);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Referral Form */}
      <div className="bg-white shadow rounded-lg p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Refer a Friend</h2>
        <form className="space-y-4" onSubmit={handleReferralSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Your Name</label>
            <input
              type="text"
              value={customer.clientName}
              disabled
              className="w-full px-4 py-2 border rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Referral Name</label>
            <input
              type="text"
              name="referralName"
              value={referralForm.referralName}
              onChange={handleReferralInputChange}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Referral Contact</label>
            <input
              type="text"
              name="referralContact"
              value={referralForm.referralContact}
              onChange={handleReferralInputChange}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Relationship</label>
            <select
              name="relationship"
              value={referralForm.relationship}
              onChange={handleReferralInputChange}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select</option>
              <option value="Friend">Friend</option>
              <option value="Family">Family</option>
              <option value="Colleague">Colleague</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Message (Optional)</label>
            <textarea
              rows="3"
              name="message"
              value={referralForm.message}
              onChange={handleReferralInputChange}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition duration-200"
          >
            Submit Referral
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerDashboard;