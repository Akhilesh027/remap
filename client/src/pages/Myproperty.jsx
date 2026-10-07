// src/components/MyProperty.jsx
import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  MapPinIcon,
  HomeModernIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  UserIcon,
  ClipboardDocumentCheckIcon,
  GlobeEuropeAfricaIcon,
  ScaleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import banner from '../Images/Welcome.gif';

const phases = [
  'Pre-design',
  'Design',
  'Procurement',
  'Construction',
  'Post-construction',
];

const MyProperty = () => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [referralForm, setReferralForm] = useState({
    referralName: '',
    referralContact: '',
    relationship: '',
    message: ''
  });

  // Fetch customer data
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
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
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

  const handleChange = (e) => {
    setReferralForm({
      ...referralForm,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getBannerImage = () => {
    const today = new Date();
    const diwaliDate = new Date('2025-10-23');
    if (today.getMonth() === diwaliDate.getMonth() &&
      today.getDate() === diwaliDate.getDate()) {
      return banner;
    }
    return banner;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-lg mb-4">Error loading property details</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCustomerData}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No property data found.</p>
        </div>
      </div>
    );
  }

  const progressSteps = phases.map((phase, index) => ({
    id: index + 1,
    name: phase,
    status: index < (customer.currentPhase - 1) ? 'completed' :
      index === (customer.currentPhase - 1) ? 'current' : 'upcoming'
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Welcome, {customer.clientName}!
        </h1>
        <p className="text-gray-600 mb-4">Here's your property overview</p>
        <div className="rounded-xl overflow-hidden shadow-md mb-6 max-h-[250px]">
          <img
            src={getBannerImage()}
            alt="Festival Banner"
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <HomeModernIcon className="w-5 h-5 text-blue-600" />
            Venture & Plot Summary
          </h2>
          <div className="space-y-4">
            <SummaryItem
              label="Venture Name"
              value={customer.ventureName || customer.propertyName || 'N/A'}
            />
            <SummaryItem
              label="Location"
              value={customer.location || customer.propertyLocation || 'N/A'}
              icon={<MapPinIcon className="w-4 h-4" />}
            />
            <SummaryItem
              label="Plot Number"
              value={customer.plotNumber || customer.plote || 'N/A'}
            />
            <SummaryItem
              label="Plot Size"
              value={customer.plotSize || 'N/A'}
            />
            <div className="flex justify-between">
              <span className="text-gray-600">Facing:</span>
              <span className="font-medium flex items-center gap-1">
                {customer.facing || 'N/A'}
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <StatusBadge status={customer.status} />
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vastu:</span>
              <span className="font-medium flex items-center gap-1">
                {customer.vastu || 'N/A'}
                {customer.vastu === 'Vastu Compliant' && (
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">
                ₹{customer.price?.toLocaleString('en-IN') || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-blue-600" />
            Construction Progress
          </h2>
          <div className="relative pl-8 py-4">
            <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {progressSteps.map((step) => (
              <ProgressStep
                key={step.id}
                step={step}
                isLast={step.id === progressSteps.length}
              />
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Current Phase: <strong>{phases[customer.currentPhase - 1] || 'Not Started'}</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-md mb-12">
        <h2 className="text-xl font-semibold p-6 pb-0">Plot Details</h2>
        <div className="border-b border-gray-200 px-6 mt-4">
          <nav className="flex space-x-8 overflow-x-auto">
            {['overview', 'land', 'ownership', 'sro', 'location', 'survey', 'legal', 'updates', 'documents'].map((tab) => (
              <button
                key={tab}
                className={`py-4 px-1 font-medium text-sm whitespace-nowrap ${activeTab === tab
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard
                icon={<DocumentTextIcon className="w-6 h-6 text-blue-500" />}
                title="Basic Info"
                items={[
                  { label: 'Plot Number', value: customer.plotNumber || customer.plote || 'N/A' },
                  { label: 'Area', value: customer.plotSize || 'N/A' },
                  { label: 'Facing', value: customer.facing || 'N/A' },
                  { label: 'Vastu', value: customer.vastu || 'N/A' }
                ]}
              />
              <DetailCard
                icon={<UserIcon className="w-6 h-6 text-blue-500" />}
                title="Ownership"
                items={[
                  { label: 'Current Owner', value: customer.clientName },
                  { label: 'Previous Owner', value: customer.previousOwner || 'N/A' },
                  { label: 'Email', value: customer.email }
                ]}
              />
            </div>
          )}

          {activeTab === 'land' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard
                icon={<GlobeEuropeAfricaIcon className="w-6 h-6 text-blue-500" />}
                title="Land Details"
                items={[
                  { label: 'Plot Size', value: customer.plotSize || 'N/A' },
                  { label: 'Facing', value: customer.facing || 'N/A' },
                  { label: 'Vastu', value: customer.vastu || 'N/A' },
                  { label: 'Category', value: 'Residential' }
                ]}
              />
            </div>
          )}

          {activeTab === 'ownership' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard
                icon={<UserIcon className="w-6 h-6 text-blue-500" />}
                title="Ownership History"
                items={[
                  { label: 'Current Owner', value: customer.clientName },
                  { label: 'Previous Owner', value: customer.previousOwner || 'N/A' },
                  { label: 'Ownership Type', value: 'Freehold' }
                ]}
              />
            </div>
          )}

          {activeTab === 'sro' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard
                icon={<ScaleIcon className="w-6 h-6 text-blue-500" />}
                title="SRO Registration"
                items={[
                  { label: 'Registration Office', value: customer.registrationOffice || 'N/A' },
                  { label: 'Registration No.', value: customer.registrationNumber || 'N/A' },
                  { label: 'Registration Date', value: formatDate(customer.registrationDate) }
                ]}
              />
            </div>
          )}

          {activeTab === 'location' && (
            <div>
              <div className="mb-4">
                <strong className="text-gray-600">Plot Address:</strong>
                <p className="text-gray-900 mt-1">
                  {customer.plotAddress || `${customer.location || customer.propertyLocation}, ${customer.ventureName || customer.propertyName}`}
                </p>
              </div>
              <div className="h-96 rounded-lg overflow-hidden">
                <iframe
                  title="Property Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(customer.location || customer.propertyLocation || 'Hyderabad')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          )}

          {activeTab === 'survey' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard
                icon={<ClipboardDocumentCheckIcon className="w-6 h-6 text-blue-500" />}
                title="Survey Details"
                items={[
                  { label: 'Survey Number', value: customer.surveyNumber || 'N/A' },
                  { label: 'Survey Reference', value: customer.surveyReference || 'N/A' },
                  { label: 'Measurement Authority', value: 'Govt Survey Dept' }
                ]}
              />
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailCard
                icon={<DocumentTextIcon className="w-6 h-6 text-blue-500" />}
                title="Legal Status"
                items={[
                  { label: 'Legal Status', value: customer.legalStatus || 'Clear' },
                  { label: 'Encumbrance Certificate', value: 'Available' },
                  { label: 'Approval Status', value: 'HMDA Approved' }
                ]}
              />
            </div>
          )}

          {activeTab === 'updates' && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Project Updates</h3>
              {customer.updates && customer.updates.length > 0 ? (
                <div className="space-y-4">
                  {customer.updates.map((update, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
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
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
      </section>

      <section className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Refer a Friend</h2>
        <p className="text-gray-600 mb-6">Earn rewards by referring friends to our properties</p>
        <form onSubmit={handleReferralSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              value={customer.clientName}
              disabled
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Referral Name *</label>
            <input
              type="text"
              name="referralName"
              value={referralForm.referralName}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Contact Number *</label>
            <input
              type="tel"
              name="referralContact"
              value={referralForm.referralContact}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Relationship</label>
            <select
              name="relationship"
              value={referralForm.relationship}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select relationship</option>
              <option value="friend">Friend</option>
              <option value="family">Family</option>
              <option value="colleague">Colleague</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Message (Optional)</label>
            <textarea
              name="message"
              value={referralForm.message}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div className="md:col-span-2 text-right">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Submit Referral
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

const SummaryItem = ({ label, value, icon }) => (
  <div className="flex justify-between">
    <span className="text-gray-600">{label}:</span>
    <span className="font-medium flex items-center gap-1">
      {value} {icon}
    </span>
  </div>
);

const StatusBadge = ({ status }) => {
  const statusStyles = {
    'Active': 'bg-green-100 text-green-800',
    'Registered': 'bg-blue-100 text-blue-800',
    'Completed': 'bg-blue-100 text-blue-800',
    'On Hold': 'bg-yellow-100 text-yellow-800',
    'Inactive': 'bg-red-100 text-red-800',
    'Sold': 'bg-purple-100 text-purple-800'
  };
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status || 'N/A'}
    </span>
  );
};

const ProgressStep = ({ step, isLast }) => (
  <div className={`relative mb-8 ${isLast ? 'mb-0' : ''}`}>
    <div className="absolute left-0 -translate-x-1/2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'completed' ? 'bg-green-500' :
          step.status === 'current' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
        }`}>
        {step.status === 'completed' && (
          <CheckCircleIcon className="w-5 h-5 text-white" />
        )}
      </div>
    </div>
    <div className="ml-12">
      <h3 className="font-medium">{step.name}</h3>
      <p className="text-gray-600 text-sm mt-1">
        {step.status === 'completed' && 'Completed'}
        {step.status === 'current' && 'In Progress'}
        {step.status === 'upcoming' && 'Upcoming'}
      </p>
    </div>
  </div>
);

const DetailCard = ({ icon, title, items }) => (
  <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="font-semibold">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex justify-between">
          <span className="text-gray-600">{item.label}:</span>
          <span className="font-medium text-right">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default MyProperty;