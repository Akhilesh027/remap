const mongoose = require('mongoose');

const PendingPropertys = new mongoose.Schema({
  // Basic Details
  property_title: { type: String, required: true },
  property_status: { type: String, required: true },
  property_synopsis: { type: String, required: true },
  
  // Land Details
  extent: { type: String, required: true },
  sy_nos: { type: String, required: true },
  master_plan: { type: String },
  master_plan_url: { type: String },
  owner_name: { type: String, required: true },
  owner_contact: { type: String, required: true },
  broker: { type: String },
  broker_contact: { type: String },
  
  // Location
  collector_name: { type: String, required: true },
  collector_contact: { type: String, required: true },
  rdo_name: { type: String, required: true },
  rdo_contact: { type: String, required: true },
  latitude: { type: String, required: true },
  longitude: { type: String, required: true },
  zone: { type: String, required: true },
  accessibility: { type: String },
  google_maps: { type: String },
  google_earth: { type: String },
  
  // Survey
  surveyor: { type: String, required: true },
  surveyor_contact: { type: String, required: true },
  survey_status: { type: String, required: true },
  last_survey_date: { type: Date, required: true },
  
  // Legal
  litigation: { type: String, default: 'No' },
  permissions: { type: String, default: 'Approved' },
  advocate: { type: String },
  advocate_contact: { type: String },
  
  // Documents
  images: [{ type: String }],
  videos: [{ type: String }],
  excel_files: [{ type: String }],
  pdf_docs: [{ type: String }],
  word_docs: [{ type: String }],
  management_visibility: { type: String, default: 'All Users' },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const PendingProperty = mongoose.model('PendingProperty', PendingPropertys);

module.exports = PendingProperty;
