import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { toast } from '../components/Toast.jsx';
import Modal from '../components/Modal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const PropertyDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const mapRef1 = useRef(null);
  const mapRef2 = useRef(null);
  const mapInstance1 = useRef(null);
  const mapInstance2 = useRef(null);
  const shareRef = useRef(null);
  const downloadRef = useRef(null);

  // Fetch property data from backend
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/properties/${id}`);
        setProperty(response.data);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast('Failed to fetch property details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  /* ------------ Export Functions ------------ */
  const exportToPDF = async () => {
    setExportLoading(true);
    try {
      const doc = new jsPDF();

      // Title and header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('PROPERTY DETAILS REPORT', 105, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
      doc.text(`Property ID: ${property._id}`, 14, 42);
      doc.text(`Status: ${property.property_status}`, 14, 49);

      // Property Title
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text(property.property_title, 14, 65);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Created: ${formatDate(property.created_at)} | Last Updated: ${formatDate(property.updated_at)}`, 14, 72);

      let yPosition = 85;

      // Property Details Section
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('PROPERTY DETAILS', 14, yPosition);
      yPosition += 10;

      const detailsData = [
        ['Property Title', property.property_title],
        ['Property Status', property.property_status],
        ['Zone/Category', property.zone || 'N/A'],
        ['Property Synopsis', property.property_synopsis || 'N/A'],
        ['Created Date', formatDate(property.created_at)],
        ['Last Updated', formatDate(property.updated_at)],
        ['Approval Status', property.approval_status || 'N/A']
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Field', 'Value']],
        body: detailsData,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Land Details Section
      doc.setFontSize(14);
      doc.text('LAND DETAILS', 14, yPosition);
      yPosition += 10;

      const landData = [
        ['Extent', property.extent || 'N/A'],
        ['Survey Numbers', property.sy_nos || 'N/A'],
        ['Existing Use', property.zone || 'N/A'],
        ['Accessibility', property.accessibility || 'N/A'],
        ['Latitude', property.latitude || 'N/A'],
        ['Longitude', property.longitude || 'N/A']
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Field', 'Value']],
        body: landData,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Ownership Section
      doc.setFontSize(14);
      doc.text('OWNERSHIP DETAILS', 14, yPosition);
      yPosition += 10;

      const ownershipData = [
        ['Owner Name', property.owner_name || 'N/A'],
        ['Owner Contact', property.owner_contact || 'N/A'],
        ['Broker', property.broker || 'N/A'],
        ['Broker Contact', property.broker_contact || 'N/A']
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Field', 'Value']],
        body: ownershipData,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Government Contacts Section
      doc.setFontSize(14);
      doc.text('GOVERNMENT CONTACTS', 14, yPosition);
      yPosition += 10;

      const govtData = [
        ['Collector Name', property.collector_name || 'N/A'],
        ['Collector Contact', property.collector_contact || 'N/A'],
        ['RDO Name', property.rdo_name || 'N/A'],
        ['RDO Contact', property.rdo_contact || 'N/A']
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Field', 'Value']],
        body: govtData,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        margin: { left: 14, right: 14 }
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Legal Status Section
      doc.setFontSize(14);
      doc.text('LEGAL STATUS', 14, yPosition);
      yPosition += 10;

      const legalData = [
        ['Litigation', property.litigation || 'N/A'],
        ['Permissions', property.permissions || 'N/A'],
        ['Advocate', property.advocate || 'N/A'],
        ['Advocate Contact', property.advocate_contact || 'N/A']
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Field', 'Value']],
        body: legalData,
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255 },
        margin: { left: 14, right: 14 }
      });

      // Add page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
      }

      doc.save(`Property_${property.property_title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast('Property details exported to PDF successfully', 'success');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast('Failed to export to PDF', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      const dataToExport = [
        // Property Details
        { 'Category': 'PROPERTY DETAILS', 'Field': '', 'Value': '' },
        { 'Category': 'Property Details', 'Field': 'Property Title', 'Value': property.property_title },
        { 'Category': 'Property Details', 'Field': 'Property Status', 'Value': property.property_status },
        { 'Category': 'Property Details', 'Field': 'Zone/Category', 'Value': property.zone || 'N/A' },
        { 'Category': 'Property Details', 'Field': 'Property Synopsis', 'Value': property.property_synopsis || 'N/A' },
        { 'Category': 'Property Details', 'Field': 'Created Date', 'Value': formatDate(property.created_at) },
        { 'Category': 'Property Details', 'Field': 'Last Updated', 'Value': formatDate(property.updated_at) },
        { 'Category': 'Property Details', 'Field': 'Approval Status', 'Value': property.approval_status || 'N/A' },

        // Land Details
        { 'Category': 'LAND DETAILS', 'Field': '', 'Value': '' },
        { 'Category': 'Land Details', 'Field': 'Extent', 'Value': property.extent || 'N/A' },
        { 'Category': 'Land Details', 'Field': 'Survey Numbers', 'Value': property.sy_nos || 'N/A' },
        { 'Category': 'Land Details', 'Field': 'Existing Use', 'Value': property.zone || 'N/A' },
        { 'Category': 'Land Details', 'Field': 'Accessibility', 'Value': property.accessibility || 'N/A' },
        { 'Category': 'Land Details', 'Field': 'Latitude', 'Value': property.latitude || 'N/A' },
        { 'Category': 'Land Details', 'Field': 'Longitude', 'Value': property.longitude || 'N/A' },

        // Ownership Details
        { 'Category': 'OWNERSHIP DETAILS', 'Field': '', 'Value': '' },
        { 'Category': 'Ownership Details', 'Field': 'Owner Name', 'Value': property.owner_name || 'N/A' },
        { 'Category': 'Ownership Details', 'Field': 'Owner Contact', 'Value': property.owner_contact || 'N/A' },
        { 'Category': 'Ownership Details', 'Field': 'Broker', 'Value': property.broker || 'N/A' },
        { 'Category': 'Ownership Details', 'Field': 'Broker Contact', 'Value': property.broker_contact || 'N/A' },

        // Government Contacts
        { 'Category': 'GOVERNMENT CONTACTS', 'Field': '', 'Value': '' },
        { 'Category': 'Government Contacts', 'Field': 'Collector Name', 'Value': property.collector_name || 'N/A' },
        { 'Category': 'Government Contacts', 'Field': 'Collector Contact', 'Value': property.collector_contact || 'N/A' },
        { 'Category': 'Government Contacts', 'Field': 'RDO Name', 'Value': property.rdo_name || 'N/A' },
        { 'Category': 'Government Contacts', 'Field': 'RDO Contact', 'Value': property.rdo_contact || 'N/A' },

        // Survey Details
        { 'Category': 'SURVEY DETAILS', 'Field': '', 'Value': '' },
        { 'Category': 'Survey Details', 'Field': 'Surveyor', 'Value': property.surveyor || 'N/A' },
        { 'Category': 'Survey Details', 'Field': 'Surveyor Contact', 'Value': property.surveyor_contact || 'N/A' },
        { 'Category': 'Survey Details', 'Field': 'Survey Status', 'Value': property.survey_status || 'N/A' },
        { 'Category': 'Survey Details', 'Field': 'Last Survey Date', 'Value': property.last_survey_date ? formatDate(property.last_survey_date) : 'N/A' },

        // Legal Status
        { 'Category': 'LEGAL STATUS', 'Field': '', 'Value': '' },
        { 'Category': 'Legal Status', 'Field': 'Litigation', 'Value': property.litigation || 'N/A' },
        { 'Category': 'Legal Status', 'Field': 'Permissions', 'Value': property.permissions || 'N/A' },
        { 'Category': 'Legal Status', 'Field': 'Advocate', 'Value': property.advocate || 'N/A' },
        { 'Category': 'Legal Status', 'Field': 'Advocate Contact', 'Value': property.advocate_contact || 'N/A' }
      ];

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Property Details');

      // Auto-size columns
      const colWidths = [
        { wch: 25 }, // Category
        { wch: 25 }, // Field
        { wch: 50 }  // Value
      ];
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(workbook, `Property_${property.property_title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast('Property details exported to Excel successfully', 'success');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast('Failed to export to Excel', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const exportToWord = async () => {
    setExportLoading(true);
    try {
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Property Details - ${property.property_title}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 40px; 
              line-height: 1.6; 
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #4f46e5; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .section { 
              margin: 30px 0; 
            }
            .section-title { 
              color: #4f46e5; 
              font-size: 18px; 
              font-weight: bold; 
              margin-bottom: 15px; 
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            .details-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 10px; 
              margin: 15px 0; 
            }
            .detail-item { 
              margin: 8px 0; 
            }
            .detail-label { 
              font-weight: bold; 
              color: #374151; 
            }
            .detail-value { 
              color: #6b7280; 
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              color: #9ca3af; 
              font-size: 12px; 
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Property Details Report</h1>
            <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Property ID:</strong> ${property._id}</p>
          </div>

          <div class="section">
            <div class="section-title">Property Information</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Property Title:</span>
                <span class="detail-value">${property.property_title}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Property Status:</span>
                <span class="detail-value">${property.property_status}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Zone/Category:</span>
                <span class="detail-value">${property.zone || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created Date:</span>
                <span class="detail-value">${formatDate(property.created_at)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Last Updated:</span>
                <span class="detail-value">${formatDate(property.updated_at)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Approval Status:</span>
                <span class="detail-value">${property.approval_status || 'N/A'}</span>
              </div>
            </div>
            ${property.property_synopsis ? `
            <div class="detail-item">
              <span class="detail-label">Property Synopsis:</span>
              <span class="detail-value">${property.property_synopsis}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">Land Details</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Extent:</span>
                <span class="detail-value">${property.extent || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Survey Numbers:</span>
                <span class="detail-value">${property.sy_nos || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Existing Use:</span>
                <span class="detail-value">${property.zone || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Accessibility:</span>
                <span class="detail-value">${property.accessibility || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Latitude:</span>
                <span class="detail-value">${property.latitude || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Longitude:</span>
                <span class="detail-value">${property.longitude || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Ownership Details</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Owner Name:</span>
                <span class="detail-value">${property.owner_name || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Owner Contact:</span>
                <span class="detail-value">${property.owner_contact || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Broker:</span>
                <span class="detail-value">${property.broker || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Broker Contact:</span>
                <span class="detail-value">${property.broker_contact || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Government Contacts</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Collector Name:</span>
                <span class="detail-value">${property.collector_name || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Collector Contact:</span>
                <span class="detail-value">${property.collector_contact || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">RDO Name:</span>
                <span class="detail-value">${property.rdo_name || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">RDO Contact:</span>
                <span class="detail-value">${property.rdo_contact || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Legal Status</div>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">Litigation:</span>
                <span class="detail-value">${property.litigation || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Permissions:</span>
                <span class="detail-value">${property.permissions || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Advocate:</span>
                <span class="detail-value">${property.advocate || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Advocate Contact:</span>
                <span class="detail-value">${property.advocate_contact || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>Report generated by Property Management System</p>
            <p>© ${new Date().getFullYear()} - All rights reserved</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], {
        type: 'application/msword;charset=utf-8'
      });
      saveAs(blob, `Property_${property.property_title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`);
      toast('Property details exported to Word successfully', 'success');
    } catch (error) {
      console.error('Error exporting to Word:', error);
      toast('Failed to export to Word', 'error');
    } finally {
      setExportLoading(false);
    }
  };

  // Initialize maps when property data is available
  useEffect(() => {
    if (!property) return;

    // Initialize bottom map
    if (mapRef2.current && !mapInstance2.current && property.latitude && property.longitude) {
      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const map = L.map(mapRef2.current).setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`${property.property_title}<br>${property.property_status}`)
          .openPopup();

        mapInstance2.current = map;
      }
    }

    return () => {
      if (mapInstance2.current) {
        mapInstance2.current.remove();
        mapInstance2.current = null;
      }
    };
  }, [property]);

  // Initialize tab map when active
  useEffect(() => {
    if (activeTab === 'map' && mapRef1.current && !mapInstance1.current && property && property.latitude && property.longitude) {
      const lat = parseFloat(property.latitude);
      const lng = parseFloat(property.longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        const map = L.map(mapRef1.current).setView([lat, lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        L.marker([lat, lng])
          .addTo(map)
          .bindPopup(`${property.property_title}<br>${property.property_status}`)
          .openPopup();

        mapInstance1.current = map;
      }
    }

    // Invalidate map size when tab changes
    if (activeTab === 'map' && mapInstance1.current) {
      setTimeout(() => {
        mapInstance1.current.invalidateSize();
      }, 100);
    }

    return () => {
      if (mapInstance1.current) {
        mapInstance1.current.remove();
        mapInstance1.current = null;
      }
    };
  }, [activeTab, property]);

  // Handle clicks outside share/download menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
      if (downloadRef.current && !downloadRef.current.contains(event.target)) {
        setShowDownloadOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Share functionality
  const handleShare = (method) => {
    setShowShareOptions(false);

    const shareUrl = window.location.href;
    const title = `Check out this property: ${property?.property_title}`;

    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(err => console.error('Could not copy text: ', err));
        break;
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + '\n' + shareUrl)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      default:
        break;
    }
  };

  // Download functionality
  const handleDownload = (type) => {
    setShowDownloadOptions(false);

    switch (type) {
      case 'pdf':
        exportToPDF();
        break;
      case 'excel':
        exportToExcel();
        break;
      case 'word':
        exportToWord();
        break;
      case 'documents':
        console.log('Downloading documents as ZIP...');
        alert('Documents ZIP download started');
        break;
      case 'brochure':
        console.log('Downloading brochure...');
        alert('Brochure download started');
        break;
      default:
        break;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex-1 overflow-auto bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h2>
          <Link to="/inventory" className="text-indigo-600 hover:text-indigo-800">
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Copied Notification */}
      {copied && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center animate-fade-in-out">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Link copied to clipboard!
        </div>
      )}

      <main className="p-1 max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Property Details</h2>
            <nav className="flex mt-2" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link to="/inventory" className="text-blue-600 hover:text-blue-800 text-sm">
                    All Properties
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400 mx-2">/</span>
                </li>
                <li className="text-sm text-gray-700 font-medium">{property.property_title}</li>
              </ol>
            </nav>
          </div>
          <div>
            <Link
              to="/inventory"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to List
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100" id="property-detail-card">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {property.property_title}
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500">
                    Created: {formatDate(property.created_at)} |
                  </span>
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {property.property_status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3 relative">
                {/* Share Button */}
                <div className="relative" ref={shareRef}>
                  <button
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                  </button>

                  {showShareOptions && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                      <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">Share Property</div>
                      <button
                        onClick={() => handleShare('copy')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleShare('whatsapp')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12 2a10 10 0 0110 10a10 10 0 01-10 10c-1.71 0-3.37-.44-4.82-1.27l-4.28 1.15l1.15-4.28A9.96 9.96 0 012 12A10 10 0 0112 2m0 2a8 8 0 00-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96A7.95 7.95 0 0012 20a8 8 0 000-16m-1.21 3.5c-.41 0-.75.11-1.03.34c-.27.22-.4.54-.4.94c0 .35.02.57.07.78c.03.17.07.36.1.59l.11.61c.02.13.04.26.04.37c0 .15-.04.3-.15.46c-.10.15-.24.25-.41.25c-.07 0-.13-.02-.18-.06a.4.4 0 01-.1-.13c-.06-.1-.12-.24-.19-.43c-.06-.19-.13-.46-.2-.81c-.07-.35-.11-.64-.13-.88a3.85 3.85 0 01-.05-.67c0-.54.14-.96.42-1.27c.29-.31.67-.47 1.14-.47c.4 0 .74.12 1.01.35c.27.23.41.54.41.94c0 .27-.04.52-.11.74c-.07.23-.18.47-.32.73c-.15.26-.3.47-.45.63c-.15.16-.3.24-.45.24c-.05 0-.11-.02-.16-.06a.41.41 0 01-.13-.13c-.06-.1-.11-.23-.18-.41c-.06-.18-.13-.42-.19-.73c-.07-.31-.11-.56-.13-.76a3.05 3.05 0 01-.04-.58c0-.14.02-.27.07-.37c.04-.1.12-.15.22-.15c.1 0 .2.05.28.14c.1.1.18.25.27.47c.08.21.15.45.21.71c.07.26.13.48.19.67c.06.19.11.32.15.4c.05.07.1.11.17.11c.05 0 .09-.01.14-.04c.05-.02.1-.06.16-.12c.05-.06.12-.14.2-.25c.08-.11.16-.26.24-.45c.08-.19.15-.4.2-.65c.05-.25.08-.52.08-.81c0-.52-.14-.92-.41-1.21c-.28-.28-.66-.43-1.14-.43m5 0c-.41 0-.75.11-1.03.34c-.27.22-.4.54-.4.94c0 .35.02.57.07.78c.03.17.07.36.1.59l.11.61c.02.13.04.26.04.37c0 .15-.04.3-.15.46c-.1.15-.24.25-.41.25c-.07 0-.13-.02-.18-.06a.4.4 0 01-.1-.13c-.06-.1-.12-.24-.19-.43c-.06-.19-.13-.46-.2-.81c-.07-.35-.11-.64-.13-.88a3.85 3.85 0 01-.05-.67c0-.54.14-.96.42-1.27c.29-.31.67-.47 1.14-.47c.4 0 .74.12 1.01.35c.27.23.41.54.41.94c0 .27-.04.52-.11.74c-.07.23-.18.47-.32.73c-.15.26-.3.47-.45.63c-.15.16-.3.24-.45.24c-.05 0-.11-.02-.16-.06a.41.41 0 01-.13-.13c-.06-.1-.11-.23-.18-.41c-.06-.18-.13-.42-.19-.73c-.07-.31-.11-.56-.13-.76a3.05 3.05 0 01-.04-.58c0-.14.02-.27.07-.37c.04-.1.12-.15.22-.15c.1 0 .2.05.28.14c.1.1.18.25.27.47c.08.21.15.45.21.71c.07.26.13.48.19.67c.06.19.11.32.15.4c.05.07.1.11.17.11c.05 0 .09-.01.14-.04c.05-.02.1-.06.16-.12c.05-.06.12-.14.2-.25c.08-.11.16-.26.24-.45c.08-.19.15-.4.2-.65c.05-.25.08-.52.08-.81c0-.52-.14-.92-.41-1.21c-.28-.28-.66-.43-1.14-.43z" />
                        </svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Email
                      </button>
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-600" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M12 2.04C6.5 2.04 2 6.53 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.85C10.44 7.34 11.93 5.96 14.22 5.96C15.31 5.96 16.45 6.15 16.45 6.15V8.62H15.19C13.95 8.62 13.56 9.39 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96A10 10 0 0022 12.06C22 6.53 17.5 2.04 12 2.04Z" />
                        </svg>
                        Facebook
                      </button>
                    </div>
                  )}
                </div>

                {/* Download Button */}
                <div className="relative" ref={downloadRef}>
                  <button
                    disabled={exportLoading}
                    onClick={() => setShowDownloadOptions(!showDownloadOptions)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportLoading ? (
                      <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  {showDownloadOptions && (
                    <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                      <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">Export Property Data</div>

                      <button
                        onClick={() => handleDownload('excel')}
                        disabled={exportLoading}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export as Excel
                      </button>
                      <button
                        onClick={() => handleDownload('word')}
                        disabled={exportLoading}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        Export as Word
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={() => handleDownload('documents')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8 1a1 1 0 100-2 1 1 0 000 2zm-3-1a1 1 0 11-2 0 1 1 0 012 0zm7 1a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        All Documents (ZIP)
                      </button>
                      <button
                        onClick={() => handleDownload('brochure')}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        Brochure (PDF)
                      </button>
                    </div>
                  )}
                </div>

                {/* Print Button */}
                <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Rest of the component remains the same */}
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex pl-6">
              <button
                className={`px-4 py-3 text-sm font-medium mr-6 ${activeTab === "overview"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium mr-6 ${activeTab === "documents"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("documents")}
              >
                Documents
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium mr-6 ${activeTab === "map"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("map")}
              >
                Location
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium ${activeTab === "activity"
                    ? "text-blue-600 border-b-2 border-blue-600 font-semibold"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab("activity")}
              >
                Activity
              </button>
            </nav>
          </div>

          {/* Tabs Content - The rest of your existing tab content remains exactly the same */}
          {/* Tabs Content */}
          <div className="p-6">
            {/* Overview Section */}
            {activeTab === "overview" && (
              <div className="tab-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {/* Land Details */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 极 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4极 z" clipRule="evenodd" />
                      </svg>
                      Land Details
                    </h5>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Extent</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.extent || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Sy Nos</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.sy_nos || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Existing Use</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.zone || '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Ownership */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center text-gray-7极 00">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Ownership
                    </h5>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Owner</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.owner_name || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Contact</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.owner_contact || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Broker</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.broker || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Broker Contact</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.broker_contact || '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Government Contacts */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2极 v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                      Government Contacts
                    </h5>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Collector</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.collector_name || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Collector Contact</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.collector_contact || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">RDO Name</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.rdo_name || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">RDO Contact</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.rdo_contact || '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Location */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Location
                    </h5>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Latitude</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.latitude || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Longitude</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.longitude || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Zone</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.zone || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Accessibility</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.accessibility || '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Survey Details */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="极 0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 极 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 极 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      Survey Details
                    </h5>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Surveyor</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.surveyor || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Surveyor Contact</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.surveyor_contact || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Status</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.survey_status || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Last Survey</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.last_survey_date ? formatDate(property.last_survey_date) : '—'}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Legal Status */}
                  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                    <h5 className="font-medium text-gray-900 mb-4 flex items-center text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                      </svg>
                      Legal Status
                    </h5>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Litigation</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.litigation || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Permissions</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.permissions || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Advocate</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.advocate || '—'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">Advocate Contact</dt>
                        <dd className="text-sm text-gray-900 font-medium">{property.advocate_contact || '—'}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeTab === "documents" && (
              <div className="tab-content">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-lg font-medium text-gray-900 border-b pb-3 mb-5">
                    Property Documents
                  </h4>
                  <button
                    onClick={() => handleDownload('documents')}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1极 h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download All
                  </button>
                </div>
                <ul className="space-y-3">
                  {property.images && property.images.length > 0 && (
                    <>
                      <li className="text-sm font-medium text-gray-700 mt-4">Images</li>
                      {property.images.map((image, index) => (
                        <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">Image {index + 1}</span>
                          </div>
                          <div className="flex space-x-2">
                            <a
                              href={`${API_BASE_URL}/${image}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 bg-white rounded border border-blue-200"
                            >
                              View
                            </a>
                            <a
                              href={`${API_BASE_URL}/${image}`}
                              download
                              className="text-gray-600 hover:text-gray-800 text-sm px-3 py-1 bg-white rounded border border-gray-200"
                            >
                              Download
                            </a>
                          </div>
                        </li>
                      ))}
                    </>
                  )}

                  {property.pdf_docs && property.pdf_docs.length > 0 && (
                    <>
                      <li className="text-sm font-medium text-gray-700 mt-4">PDF Documents</li>
                      {property.pdf_docs.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/s极 vg" className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700">PDF Document {index + 1}</span>
                          </div>
                          <div className="flex space-x-2">
                            <a
                              href={`${API_BASE_URL}/${doc}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 bg-white rounded border border-blue-200"
                            >
                              View
                            </a>
                            <a
                              href={`${API_BASE_URL}/${doc}`}
                              download
                              className="text-gray-600 hover:text-gray-800 text-sm px-3 py-1 bg-white rounded border border-gray-200"
                            >
                              Download
                            </a>
                          </div>
                        </li>
                      ))}
                    </>
                  )}

                  {property.master_plan && (
                    <>
                      <li className="text-sm font-medium text-gray-700 mt-4">Master Plan</li>
                      <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">Master Plan</span>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={property.master_plan_url || `${API_BASE_URL}/${property.master_plan}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 bg-white rounded border border-blue-200"
                          >
                            View
                          </a>
                          <a
                            href={`${API_BASE_URL}/${property.master_plan}`}
                            download
                            className="text-gray-600 hover:text-gray-800 text-sm px-3 py-1 bg-white rounded border border-gray-200"
                          >
                            Download
                          </a>
                        </div>
                      </li>
                    </>
                  )}

                  {(property.images && property.images.length === 0 &&
                    property.pdf_docs && property.pdf_docs.length === 0 &&
                    !property.master_plan) && (
                      <li className="text-center py-6 text-gray-500 italic">
                        No documents available for this property.
                      </li>
                    )}
                </ul>
              </div>
            )}

            {/* Map Section */}
            {activeTab === "map" && (
              <div className="tab-content">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-3 mb-5">
                  Property Location
                </h4>
                {property.latitude && property.longitude ? (
                  <>
                    <div className="h-96 rounded-xl overflow-hidden border border-gray-200" ref={mapRef1}></div>
                    <div className="mt-4 text-right">
                      <a
                        href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View on Google Maps
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 极 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="h-96 flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
                    <p className="text-gray-500">No location data available for this property.</p>
                  </div>
                )}
              </div>
            )}

            {/* Activity Section */}
            {activeTab === "activity" && (
              <div className="tab-content">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 极 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h6 className="font-semibold text-gray-800">Property Created</h6>
                        <p className="text-sm text-gray-600 mt-1">Property was added to the system</p>
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-gray-500">System</span>
                          <span className="mx-2 text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{formatDate(property.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {property.updated_at && property.updated_at !== property.created_at && (
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-start">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h6 className="font-semib极 old text-gray-800">Property Updated</h6>
                          <p className="text-sm text-gray-600 mt-1">Property details were updated</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-gray-500">System</span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">{formatDate(property.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Zone Section */}
          <div className="mt-6 p-5 bg-gray-50 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-极 9.92zM11 13a1 1 极 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Compliance Status
            </h4>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-yellow-800">Legal Status: {property.litigation === 'Yes' ? 'Has Litigation' : 'No Litigation'}</h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    {property.litigation === 'Yes'
                      ? 'This property has ongoing litigation. Please consult with the assigned advocate for details.'
                      : 'No litigation issues detected for this property.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Map */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex justify-between items-center mb-5">
            <h4 className="text-lg font-medium text-gray-900">
              Property Location
            </h4>
            {property.latitude && property.longitude && (
              <a
                href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View on Google Maps
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2极 h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7极 h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
          </div>
          {property.latitude && property.longitude ? (
            <div className="h-96 rounded-xl overflow-hidden border border-gray-200" ref={mapRef2}></div>
          ) : (
            <div className="h-96 flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200">
              <p className="text-gray-500">No location data available for this property.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;
