import React, { useState, useEffect } from 'react';
import {
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customer, setCustomer] = useState(null);

  // Fetch customer and documents data
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
      setDocuments(customerData.documents || []);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customer data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle document download
  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await fetch(`http://localhost:5000/api/clients/${customer._id}/documents/${documentId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        // Fallback to placeholder download
        alert(`Downloading: ${fileName}\n\nIn a real application, this would download the actual file from the server.`);
      }
    } catch (err) {
      console.error('Error downloading document:', err);
      alert(`Downloading: ${fileName}\n\nIn a real application, this would download the actual file from the server.`);
    }
  };

  // Handle document view
  const handleView = (documentId, fileName) => {
    // In a real app, this would open the document in a new tab or modal
    alert(`Viewing: ${fileName}\n\nIn a real application, this would open the document in a viewer.`);
  };

  // Get document type icon
  const getDocumentIcon = (type) => {
    const docType = type?.toLowerCase() || '';
    if (docType.includes('image') || docType.includes('photo') || docType.includes('map')) {
      return <PhotoIcon className="w-5 h-5 text-blue-500" />;
    }
    return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
  };

  // Get file extension
  const getFileExtension = (fileName) => {
    if (!fileName) return 'file';
    return fileName.split('.').pop()?.toLowerCase() || 'file';
  };

  // Get document preview URL (placeholder for demo)
  const getPreviewUrl = (doc) => {
    const fileExt = getFileExtension(doc.fileName);

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)) {
      return `https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=${encodeURIComponent(doc.name)}`;
    } else if (fileExt === 'pdf') {
      return `https://via.placeholder.com/300x200/EF4444/FFFFFF?text=${encodeURIComponent(doc.name + '.pdf')}`;
    } else {
      return `https://via.placeholder.com/300x200/6B7280/FFFFFF?text=${encodeURIComponent(doc.name + '.' + fileExt)}`;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 text-lg mb-4">Error loading documents</div>
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
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-2">
            My Documents
          </h1>
          <p className="text-gray-600">
            {customer?.clientName ? `${customer.clientName}'s property documents` : 'Your property documents'}
          </p>
          {documents.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {documents.length} document{documents.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* Documents Grid */}
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map((doc) => (
              <div
                key={doc._id || doc.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                {/* Document Preview */}
                <div className="relative bg-gray-100 h-48 flex items-center justify-center">
                  <img
                    src={getPreviewUrl(doc)}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {getDocumentIcon(doc.type)}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {getFileExtension(doc.fileName).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Document Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1">
                      {doc.name}
                    </h3>
                  </div>

                  <div className="space-y-1 mb-3">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <ClipboardDocumentListIcon className="w-3 h-3" />
                      Type: <span className="font-medium">{doc.type}</span>
                    </p>
                    <p className="text-xs text-gray-600">
                      Added: {formatDate(doc.date)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleDownload(doc._id || doc.id, doc.fileName)}
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => handleView(doc._id || doc.id, doc.fileName)}
                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <DocumentIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No documents available</h3>
            <p className="text-gray-500 mb-6">
              Your property documents will appear here once they are uploaded.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={fetchCustomerData}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Document Categories Summary */}
        {documents.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Document Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from(new Set(documents.map(doc => doc.type))).map(type => {
                const count = documents.filter(doc => doc.type === type).length;
                return (
                  <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600 mb-1">{count}</div>
                    <div className="text-sm text-gray-600">{type}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;