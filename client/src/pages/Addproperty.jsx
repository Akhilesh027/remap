// AddProperty.js (updated)
import React, { useState } from 'react';
import axios from 'axios';

const AddProperty = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Details
    property_title: '',
    property_status: '',
    property_synopsis: '',

    // Land Details
    extent: '',
    sy_nos: '',
    master_plan: null,
    master_plan_url: '',
    owner_name: '',
    owner_contact: '',
    broker: '',
    broker_contact: '',

    // Location
    collector_name: '',
    collector_contact: '',
    rdo_name: '',
    rdo_contact: '',
    latitude: '',
    longitude: '',
    zone: '',
    accessibility: '',
    google_maps: '',
    google_earth: '',

    // Survey
    surveyor: '',
    surveyor_contact: '',
    survey_status: '',
    last_survey_date: '',

    // Legal
    litigation: 'No',
    permissions: 'Approved',
    advocate: '',
    advocate_contact: '',

    // Documents
    images: [],
    videos: [],
    excel_files: [],
    pdf_docs: [],
    word_docs: [],
    management_visibility: 'All Users'
  });

  const tabs = [
    { id: 'basic', label: 'Basic Details', icon: '📋' },
    { id: 'land', label: 'Land Details', icon: '🏞️' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'survey', label: 'Survey', icon: '📐' },
    { id: 'legal', label: 'Legal', icon: '⚖️' },
    { id: 'docs', label: 'Documents', icon: '📂' }
  ];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const navigateTab = (direction) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);

    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();

      // Append all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'images' || key === 'videos' || key === 'excel_files' ||
          key === 'pdf_docs' || key === 'word_docs' || key === 'master_plan') {
          // Handle file arrays
          if (formData[key] && formData[key].length > 0) {
            for (let i = 0; i < formData[key].length; i++) {
              data.append(key, formData[key][i]);
            }
          }
        } else {
          data.append(key, formData[key]);
        }
      });

      const response = await axios.post('http://localhost:5000/api/properties', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Property submitted successfully!');
      console.log('Server Response:', response.data);

      // Reset form after successful submission
      setFormData({
        property_title: '',
        property_status: '',
        property_synopsis: '',
        extent: '',
        sy_nos: '',
        master_plan: null,
        master_plan_url: '',
        owner_name: '',
        owner_contact: '',
        broker: '',
        broker_contact: '',
        collector_name: '',
        collector_contact: '',
        rdo_name: '',
        rdo_contact: '',
        latitude: '',
        longitude: '',
        zone: '',
        accessibility: '',
        google_maps: '',
        google_earth: '',
        surveyor: '',
        surveyor_contact: '',
        survey_status: '',
        last_survey_date: '',
        litigation: 'No',
        permissions: 'Approved',
        advocate: '',
        advocate_contact: '',
        images: [],
        videos: [],
        excel_files: [],
        pdf_docs: [],
        word_docs: [],
        management_visibility: 'All Users'
      });

      setActiveTab('basic');
    } catch (error) {
      console.error('Error submitting property:', error);
      alert('Failed to submit property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Add New Property</h2>
            <p className="text-gray-600 mt-1">Fill in the property details below</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <ul className="flex flex-wrap px-4 -mb-px">
              {tabs.map(tab => (
                <li key={tab.id} className="mr-2">
                  <button
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center py-4 px-3 text-sm font-medium rounded-t-lg ${activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <span className="mr-2 text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Basic Details Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📋</span> Basic Property Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="property_title"
                      value={formData.property_title}
                      onChange={handleChange}
                      required
                      placeholder="Enter property title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Status</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="property_status"
                      value={formData.property_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="Completed">Completed</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Issues">Issues</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Synopsis</label>
                    <textarea
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      name="property_synopsis"
                      rows="4"
                      value={formData.property_synopsis}
                      onChange={handleChange}
                      required
                      placeholder="Describe the property..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => navigateTab('next')}
                  >
                    Next: Land Details
                  </button>
                </div>
              </div>
            )}

            {/* Land Details Tab */}
            {activeTab === 'land' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">🏞️</span> Land Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Land Details</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Extent (in acres)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="extent"
                          value={formData.extent}
                          onChange={handleChange}
                          step="0.01"
                          required
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sy Nos</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="sy_nos"
                          value={formData.sy_nos}
                          onChange={handleChange}
                          required
                          placeholder="Enter Sy numbers"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Master Plan</label>
                        <input
                          type="file"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="master_plan"
                          onChange={handleChange}
                          accept=".pdf"
                        />
                        <p className="mt-2 text-xs text-gray-500">Or enter URL:</p>
                        <input
                          type="url"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-1"
                          name="master_plan_url"
                          value={formData.master_plan_url}
                          onChange={handleChange}
                          placeholder="https://example.com/master-plan.pdf"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Ownership Information</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="owner_name"
                          value={formData.owner_name}
                          onChange={handleChange}
                          required
                          placeholder="Full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Contact</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="owner_contact"
                          value={formData.owner_contact}
                          onChange={handleChange}
                          required
                          placeholder="Phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Broker</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="broker"
                          value={formData.broker}
                          onChange={handleChange}
                          placeholder="Broker name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Broker Contact</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="broker_contact"
                          value={formData.broker_contact}
                          onChange={handleChange}
                          placeholder="Broker phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => navigateTab('prev')}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => navigateTab('next')}
                  >
                    Next: Location
                  </button>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === 'location' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📍</span> Location Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Government Contacts</h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Collector Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="collector_name"
                          value={formData.collector_name}
                          onChange={handleChange}
                          required
                          placeholder="Collector's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Collector Contact</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="collector_contact"
                          value={formData.collector_contact}
                          onChange={handleChange}
                          required
                          placeholder="Collector's phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RDO Name</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="rdo_name"
                          value={formData.rdo_name}
                          onChange={handleChange}
                          required
                          placeholder="RDO's full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">RDO Contact</label>
                        <input
                          type="tel"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="rdo_contact"
                          value={formData.rdo_contact}
                          onChange={handleChange}
                          required
                          placeholder="RDO's phone number"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-xl">
                    <h4 className="text-lg font-medium text-gray-800 mb-4">Location Information</h4>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange}
                            required
                            placeholder="e.g. 12.3456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                            required
                            placeholder="e.g. -98.7654"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Zone</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="zone"
                          value={formData.zone}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select Zone</option>
                          <option value="Commercial">Commercial</option>
                          <option value="Residential">Residential</option>
                          <option value="Agriculture">Agriculture</option>
                          <option value="Industrial">Industrial</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Accessibility (Nearby places)</label>
                        <textarea
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="accessibility"
                          rows="2"
                          value={formData.accessibility}
                          onChange={handleChange}
                          placeholder="Nearby roads, landmarks, etc."
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                        <input
                          type="url"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="google_maps"
                          value={formData.google_maps}
                          onChange={handleChange}
                          placeholder="https://maps.google.com/..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Google Earth Link</label>
                        <input
                          type="url"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="google_earth"
                          value={formData.google_earth}
                          onChange={handleChange}
                          placeholder="https://earth.google.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => navigateTab('prev')}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => navigateTab('next')}
                  >
                    Next: Survey Details
                  </button>
                </div>
              </div>
            )}

            {/* Survey Tab */}
            {activeTab === 'survey' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📐</span> Survey Information
                </h3>

                <div className="bg-gray-50 p-5 rounded-xl max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Surveyor</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="surveyor"
                        value={formData.surveyor}
                        onChange={handleChange}
                        required
                        placeholder="Surveyor's name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Surveyor Contact</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="surveyor_contact"
                        value={formData.surveyor_contact}
                        onChange={handleChange}
                        required
                        placeholder="Surveyor's phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Survey Status</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="survey_status"
                        value={formData.survey_status}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="Review">Review</option>
                        <option value="Pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Survey Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="last_survey_date"
                        value={formData.last_survey_date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => navigateTab('prev')}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => navigateTab('next')}
                  >
                    Next: Legal Status
                  </button>
                </div>
              </div>
            )}

            {/* Legal Tab */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">⚖️</span> Legal Status
                </h3>

                <div className="bg-gray-50 p-5 rounded-xl max-w-2xl">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Litigation</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="litigation"
                          value={formData.litigation}
                          onChange={handleChange}
                          required
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Permissions</label>
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="permissions"
                          value={formData.permissions}
                          onChange={handleChange}
                          required
                        >
                          <option value="Approved">Approved</option>
                          <option value="Disapproved">Disapproved</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Advocate</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="advocate"
                        value={formData.advocate}
                        onChange={handleChange}
                        placeholder="Advocate's name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Advocate Contact</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="advocate_contact"
                        value={formData.advocate_contact}
                        onChange={handleChange}
                        placeholder="Advocate's phone number"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => navigateTab('prev')}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    onClick={() => navigateTab('next')}
                  >
                    Next: Documents
                  </button>
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'docs' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📂</span> Property Documents
                </h3>

                <div className="bg-gray-50 p-5 rounded-xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-blue-500 bg-white">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB each)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            name="images"
                            onChange={handleChange}
                            multiple
                            accept="image/*"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Videos</label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-gray-300 hover:border-blue-500 bg-white">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">MP4, MOV (MAX. 100MB each)</p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            name="videos"
                            onChange={handleChange}
                            multiple
                            accept="video/*"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Excel Files</label>
                        <input
                          type="file"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="excel_files"
                          onChange={handleChange}
                          multiple
                          accept=".xlsx,.xls,.csv"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PDF Documents</label>
                        <input
                          type="file"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="pdf_docs"
                          onChange={handleChange}
                          multiple
                          accept=".pdf"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Word Documents</label>
                        <input
                          type="file"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          name="word_docs"
                          onChange={handleChange}
                          multiple
                          accept=".doc,.docx"
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Management Visibility</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        name="management_visibility"
                        value={formData.management_visibility}
                        onChange={handleChange}
                        required
                      >
                        <option value="All Users">All Users</option>
                        <option value="Management">Management (Hides from Admin and Executives)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={() => navigateTab('prev')}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        Submit Property
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProperty;