import React, { useState, useEffect } from 'react';
import './style.css';

const ClientListPage = () => {
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const initialClients = [];

  // State management
  const [clients, setClients] = useState(initialClients);
  const [filteredClients, setFilteredClients] = useState(clients);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({
    clientName: '',
    email: '',
    propertyName: '',
    propertyLocation: '',
    password: '',
    plote: '',
    price: '',
    status: 'Active',
    documents: [],
    bannerImage: null
  });

  // Edit form state
  const [editClient, setEditClient] = useState({
    clientName: '',
    email: '',
    ventureName: '',
    location: '',
    plotNumber: '',
    plotSize: '',
    facing: '',
    status: 'Active',
    vastu: '',
    currentPhase: 1,
    overview: '',
    previousOwner: '',
    registrationOffice: '',
    registrationNumber: '',
    registrationDate: '',
    plotAddress: '',
    surveyNumber: '',
    surveyReference: '',
    legalStatus: '',
    updates: [],
    bannerImage: null
  });

  // Document form state
  const [newDocument, setNewDocument] = useState({
    type: 'Land Document',
    name: '',
    file: null
  });

  // Banner form state
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // New update state
  const [newUpdate, setNewUpdate] = useState({
    message: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Available phases
  const phases = ["Pre-design", "Design", "Procurement", "Construction", "Post-construction"];

  // Fetch clients
  const fetchClients = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients(initialClients);
    }
  };

  // Add a new client
  const handleAddClient = async () => {
    try {
      const formData = new FormData();
      formData.append('clientName', newClient.clientName);
      formData.append('email', newClient.email);
      formData.append('propertyName', newClient.propertyName);
      formData.append('propertyLocation', newClient.propertyLocation);
      formData.append('password', newClient.password);
      formData.append('plote', newClient.plote);
      formData.append('price', newClient.price);
      formData.append('status', newClient.status);

      if (newClient.bannerImage) {
        formData.append('bannerImage', newClient.bannerImage);
      }

      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const addedClient = await response.json();
        setClients([...clients, addedClient]);
        setIsAddModalOpen(false);
        setNewClient({
          clientName: '',
          email: '',
          password: '',
          propertyName: '',
          propertyLocation: '',
          plote: '',
          price: '',
          status: 'Active',
          documents: [],
          bannerImage: null
        });
      } else {
        console.error('Failed to add client:', response.status);
      }
    } catch (error) {
      console.error('Error adding client:', error);
      // Fallback to local state update
      const newClientWithId = {
        ...newClient,
        id: clients.length + 1,
        price: Number(newClient.price),
        documents: [],
        bannerImage: newClient.bannerImage ? URL.createObjectURL(newClient.bannerImage) : null
      };

      setClients([...clients, newClientWithId]);
      setNewClient({
        clientName: '',
        email: '',
        propertyName: '',
        propertyLocation: '',
        plote: '',
        price: '',
        status: 'Active',
        documents: [],
        bannerImage: null
      });
      setIsAddModalOpen(false);
    }
  };

  // Upload banner for client
  // Upload banner for client
  const handleUploadBanner = async () => {
    if (!bannerFile) {
      alert('Please select a banner image');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('bannerImage', bannerFile);

      const response = await fetch(`${API_BASE_URL}/clients/${selectedClient._id || selectedClient.id}/banner`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update clients list
        const updatedClients = clients.map(client =>
          (client._id === selectedClient._id || client.id === selectedClient.id)
            ? result.client
            : client
        );

        setClients(updatedClients);
        setSelectedClient(result.client);
        setIsBannerModalOpen(false);
        setBannerFile(null);
        setBannerPreview(null);
        alert(result.message);
      } else {
        alert(result.message || 'Failed to upload banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      alert('Error uploading banner');
    }
  };

  // Remove banner
  const handleRemoveBanner = async () => {
    if (!window.confirm('Are you sure you want to remove the banner?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/clients/${selectedClient._id || selectedClient.id}/banner`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Update clients list
        const updatedClients = clients.map(client =>
          (client._id === selectedClient._id || client.id === selectedClient.id)
            ? result.client
            : client
        );

        setClients(updatedClients);
        setSelectedClient(result.client);
        alert(result.message);
      } else {
        alert(result.message || 'Failed to remove banner');
      }
    } catch (error) {
      console.error('Error removing banner:', error);
      alert('Error removing banner');
    }
  };
  // Handle banner file selection
  const handleBannerFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      setBannerFile(file);
      const previewUrl = URL.createObjectURL(file);
      setBannerPreview(previewUrl);
    }
  };

  // Update client property details
  const handleUpdateClient = async () => {
    try {
      const updateData = {
        ...editClient,
        currentPhase: Number(editClient.currentPhase) || 1,
        propertyName: editClient.ventureName || '',
        propertyLocation: editClient.location || '',
        plote: editClient.plotNumber || ''
      };

      const response = await fetch(`${API_BASE_URL}/clients/${selectedClient._id || selectedClient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedClient = await response.json();
        const updatedClients = clients.map(client =>
          (client._id === selectedClient._id || client.id === selectedClient.id)
            ? updatedClient
            : client
        );

        setClients(updatedClients);

        if (isViewModalOpen) {
          setSelectedClient(updatedClient);
        }

        setIsEditModalOpen(false);
        alert('Client details updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('Failed to update client:', errorData.message);
        alert(`Failed to update client: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating client:', error);
      // Fallback to local state update
      const updatedClients = clients.map(client =>
        client.id === selectedClient.id
          ? {
            ...client,
            ...editClient,
            propertyName: editClient.ventureName || client.propertyName,
            propertyLocation: editClient.location || client.propertyLocation,
            plote: editClient.plotNumber || client.plote
          }
          : client
      );

      setClients(updatedClients);

      if (isViewModalOpen) {
        setSelectedClient({
          ...selectedClient,
          ...editClient,
          propertyName: editClient.ventureName || selectedClient.propertyName,
          propertyLocation: editClient.location || selectedClient.propertyLocation,
          plote: editClient.plotNumber || selectedClient.plote
        });
      }

      setIsEditModalOpen(false);
      alert('Client details updated successfully!');
    }
  };

  // Add a new update
  const handleAddUpdate = () => {
    if (!newUpdate.message.trim()) {
      alert('Please enter an update message');
      return;
    }

    const updatedClient = {
      ...editClient,
      updates: [...(editClient.updates || []), newUpdate]
    };

    setEditClient(updatedClient);
    setNewUpdate({
      message: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Remove an update
  const handleRemoveUpdate = (index) => {
    const updatedUpdates = [...(editClient.updates || [])];
    updatedUpdates.splice(index, 1);

    setEditClient({
      ...editClient,
      updates: updatedUpdates
    });
  };

  // Add a document
  const handleAddDocument = async () => {
    if (!newDocument.name || !newDocument.file) {
      alert('Please fill all document fields and select a file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('type', newDocument.type);
      formData.append('name', newDocument.name);
      formData.append('file', newDocument.file);

      const response = await fetch(`${API_BASE_URL}/clients/${selectedClient._id || selectedClient.id}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const addedDocument = await response.json();
        const updatedClients = clients.map(client =>
          (client._id === selectedClient._id || client.id === selectedClient.id)
            ? { ...client, documents: [...client.documents, addedDocument] }
            : client
        );

        setClients(updatedClients);
        setSelectedClient({ ...selectedClient, documents: [...selectedClient.documents, addedDocument] });

        setNewDocument({
          type: 'Land Document',
          name: '',
          file: null
        });

        alert(`Document "${newDocument.name}" added successfully!`);
      } else {
        // Fallback to local state update
        const documentId = selectedClient.documents.length
          ? Math.max(...selectedClient.documents.map(doc => doc.id)) + 1
          : 1;

        const newDoc = {
          id: documentId,
          type: newDocument.type,
          name: newDocument.name,
          date: new Date().toISOString().split('T')[0],
          fileName: newDocument.file.name
        };

        const updatedClients = clients.map(client =>
          (client._id === selectedClient._id || client.id === selectedClient.id)
            ? { ...client, documents: [...client.documents, newDoc] }
            : client
        );

        setClients(updatedClients);
        setSelectedClient({ ...selectedClient, documents: [...selectedClient.documents, newDoc] });

        setNewDocument({
          type: 'Land Document',
          name: '',
          file: null
        });

        alert(`Document "${newDocument.name}" added successfully!`);
      }
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  // Delete a client
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setClients(clients.filter(client => client._id !== id && client.id !== id));
      } else {
        setClients(clients.filter(client => client.id !== id));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      setClients(clients.filter(client => client.id !== id));
    }
  };

  // Delete a document
  const handleDeleteDocument = async (clientId, docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const updatedClients = clients.map(client =>
          (client._id === clientId || client.id === clientId)
            ? { ...client, documents: client.documents.filter(doc => doc._id !== docId && doc.id !== docId) }
            : client
        );

        setClients(updatedClients);

        if (selectedClient && (selectedClient._id === clientId || selectedClient.id === clientId)) {
          setSelectedClient({
            ...selectedClient,
            documents: selectedClient.documents.filter(doc => doc._id !== docId && doc.id !== docId)
          });
        }
      } else {
        const updatedClients = clients.map(client =>
          client.id === clientId
            ? { ...client, documents: client.documents.filter(doc => doc.id !== docId) }
            : client
        );

        setClients(updatedClients);

        if (selectedClient && selectedClient.id === clientId) {
          setSelectedClient({
            ...selectedClient,
            documents: selectedClient.documents.filter(doc => doc.id !== docId)
          });
        }
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      const updatedClients = clients.map(client =>
        client.id === clientId
          ? { ...client, documents: client.documents.filter(doc => doc.id !== docId) }
          : client
      );

      setClients(updatedClients);

      if (selectedClient && selectedClient.id === clientId) {
        setSelectedClient({
          ...selectedClient,
          documents: selectedClient.documents.filter(doc => doc.id !== docId)
        });
      }
    }
  };

  // Download a document
  const handleDownloadDocument = async (clientId, docId, fileName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}/documents/${docId}/download`);
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
        alert(`Downloading file: ${fileName}\n\nIn a real application, this would download the actual file from the server.`);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Downloading file: ${fileName}\n\nIn a real application, this would download the actual file from the server.`);
    }
  };

  // Handle banner input change for new client
  const handleBannerInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Please select an image smaller than 5MB');
        return;
      }

      setNewClient({ ...newClient, bannerImage: file });
    }
  };

  // Filter clients based on search and status
  useEffect(() => {
    let result = clients;

    if (statusFilter !== 'All') {
      result = result.filter(client => client.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(client =>
        client.clientName?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term) ||
        client.ventureName?.toLowerCase().includes(term) ||
        client.propertyName?.toLowerCase().includes(term) ||
        client.location?.toLowerCase().includes(term) ||
        client.propertyLocation?.toLowerCase().includes(term) ||
        client.plotNumber?.toLowerCase().includes(term) ||
        client.plote?.toLowerCase().includes(term)
      );
    }

    setFilteredClients(result);
  }, [clients, searchTerm, statusFilter]);

  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Event handlers
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const handleStatusFilter = (e) => setStatusFilter(e.target.value);

  const handleView = (client) => {
    setSelectedClient(client);
    setIsViewModalOpen(true);
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setEditClient({
      clientName: client.clientName || '',
      email: client.email || '',
      ventureName: client.ventureName || '',
      location: client.location || client.propertyLocation || '',
      plotNumber: client.plotNumber || client.plote || '',
      plotSize: client.plotSize || '',
      facing: client.facing || '',
      status: client.status || 'Active',
      vastu: client.vastu || '',
      currentPhase: client.currentPhase || 1,
      overview: client.overview || '',
      previousOwner: client.previousOwner || '',
      registrationOffice: client.registrationOffice || '',
      registrationNumber: client.registrationNumber || '',
      registrationDate: client.registrationDate || '',
      plotAddress: client.plotAddress || '',
      surveyNumber: client.surveyNumber || '',
      surveyReference: client.surveyReference || '',
      legalStatus: client.legalStatus || '',
      updates: client.updates || [],
      bannerImage: client.bannerImage || null
    });
    setIsEditModalOpen(true);
  };

  const handleManageDocuments = (client) => {
    setSelectedClient(client);
    setIsDocumentModalOpen(true);
  };

  const handleManageBanner = (client) => {
    setSelectedClient(client);
    setBannerFile(null);
    setBannerPreview(null);
    setIsBannerModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClient({ ...newClient, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditClient({ ...editClient, [name]: value });
  };

  const handleDocumentInputChange = (e) => {
    const { name, value } = e.target;
    setNewDocument({ ...newDocument, [name]: value });
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setNewUpdate({ ...newUpdate, [name]: value });
  };

  const handleFileChange = (e) => {
    setNewDocument({ ...newDocument, file: e.target.files[0] });
  };

  return (
    <div className="client-management-container">
      <h1 className="page-title">Client Management</h1>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="controls-group">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search clients..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            className="filter-select"
            value={statusFilter}
            onChange={handleStatusFilter}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="add-client-btn"
        >
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Clients Table */}
      <div className="table-container">
        <table className="clients-table">
          <thead className="table-header">
            <tr>
              <th>Banner</th>
              <th>Client Name</th>
              <th>Email</th>
              <th>Property</th>
              <th>Location</th>
              <th>Plot</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredClients.map((client) => (
              <tr key={client._id || client.id} className="table-row">
                <td className="banner-cell">
                  {client.bannerImage ? (
                    <img
                      src={client.bannerImage}
                      alt="Banner"
                      className="banner-image"
                    />
                  ) : (
                    <div className="no-banner">
                      <span>No Banner</span>
                    </div>
                  )}
                </td>
                <td className="client-name">{client.clientName}</td>
                <td className="client-email">{client.email}</td>
                <td className="client-property">{client.ventureName || client.propertyName}</td>
                <td className="client-location">{client.location || client.propertyLocation}</td>
                <td className="client-plot">{client.plotNumber || client.plote}</td>
                <td className="client-price">₹{client.price?.toLocaleString('en-IN')}</td>
                <td className="client-status">
                  <span className={`status-badge status-${client.status?.toLowerCase().replace(' ', '-')}`}>
                    {client.status}
                  </span>
                </td>
                <td className="actions-cell">
                  <div className="actions-group">
                    <button
                      onClick={() => handleView(client)}
                      className="action-btn view-btn"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleManageBanner(client)}
                      className="action-btn banner-btn"
                    >
                      Banner
                    </button>
                    <button
                      onClick={() => handleManageDocuments(client)}
                      className="action-btn docs-btn"
                    >
                      Docs
                    </button>
                    <button
                      onClick={() => handleEdit(client)}
                      className="action-btn edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client._id || client.id)}
                      className="action-btn delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>No clients found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* View Client Modal */}
      {isViewModalOpen && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h3>Client Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="close-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Banner Display */}
            {selectedClient.bannerImage && (
              <div className="banner-section">
                <h4>Banner Image</h4>
                <img
                  src={selectedClient.bannerImage}
                  alt="Client Banner"
                  className="client-banner"
                />
              </div>
            )}

            <div className="details-grid">
              <div className="detail-item">
                <h4>Client Name</h4>
                <p>{selectedClient.clientName}</p>
              </div>
              <div className="detail-item">
                <h4>Email</h4>
                <p>{selectedClient.email}</p>
              </div>
              <div className="detail-item">
                <h4>Venture/Property</h4>
                <p>{selectedClient.ventureName || selectedClient.propertyName}</p>
              </div>
              <div className="detail-item">
                <h4>Location</h4>
                <p>{selectedClient.location || selectedClient.propertyLocation}</p>
              </div>
              <div className="detail-item">
                <h4>Plot Number</h4>
                <p>{selectedClient.plotNumber || selectedClient.plote}</p>
              </div>
              <div className="detail-item">
                <h4>Plot Size</h4>
                <p>{selectedClient.plotSize}</p>
              </div>
              <div className="detail-item">
                <h4>Facing</h4>
                <p>{selectedClient.facing}</p>
              </div>
              <div className="detail-item">
                <h4>Vastu</h4>
                <p>{selectedClient.vastu}</p>
              </div>
              <div className="detail-item">
                <h4>Current Phase</h4>
                <p>{phases[selectedClient.currentPhase - 1]}</p>
              </div>
              <div className="detail-item">
                <h4>Price</h4>
                <p>₹{selectedClient.price?.toLocaleString('en-IN')}</p>
              </div>
              <div className="detail-item">
                <h4>Status</h4>
                <span className={`status-badge status-${selectedClient.status?.toLowerCase().replace(' ', '-')}`}>
                  {selectedClient.status}
                </span>
              </div>
            </div>

            {selectedClient.overview && (
              <div className="overview-section">
                <h4>Overview</h4>
                <p>{selectedClient.overview}</p>
              </div>
            )}

            {selectedClient.updates && selectedClient.updates.length > 0 && (
              <div className="updates-section">
                <h4>Recent Updates</h4>
                <div className="updates-list">
                  {selectedClient.updates.slice(-5).map((update, index) => (
                    <div key={index} className="update-item">
                      <p>{update.message}</p>
                      <span>{update.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="documents-section">
              <h4>Documents</h4>
              {selectedClient.documents && selectedClient.documents.length > 0 ? (
                <div className="documents-list">
                  {selectedClient.documents.map((doc) => (
                    <div key={doc._id || doc.id} className="document-item">
                      <div>
                        <p>{doc.name}</p>
                        <span>{doc.type} • {doc.date}</span>
                      </div>
                      <button
                        onClick={() => handleDownloadDocument(selectedClient._id || selectedClient.id, doc._id || doc.id, doc.fileName)}
                        className="download-btn"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-documents">No documents available</p>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => handleManageBanner(selectedClient)}
                className="btn btn-success"
              >
                Manage Banner
              </button>
              <button
                onClick={() => handleEdit(selectedClient)}
                className="btn btn-primary"
              >
                Edit Details
              </button>
              <button
                onClick={() => handleManageDocuments(selectedClient)}
                className="btn btn-secondary"
              >
                Manage Documents
              </button>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="btn btn-cancel"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Management Modal */}
      {isBannerModalOpen && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-content banner-modal">
            <div className="modal-header">
              <h3>Banner Management: {selectedClient.clientName}</h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="close-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Current Banner */}
            <div className="current-banner-section">
              <h4>Current Banner</h4>
              {selectedClient.bannerImage ? (
                <div className="banner-container">
                  <img
                    src={selectedClient.bannerImage}
                    alt="Current Banner"
                    className="current-banner"
                  />
                  <div className="banner-actions">
                    <button
                      onClick={handleRemoveBanner}
                      className="btn btn-danger"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove Banner
                    </button>
                  </div>
                </div>
              ) : (
                <div className="no-banner-state">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No banner uploaded yet</p>
                </div>
              )}
            </div>

            {/* Upload New Banner */}
            <div className="upload-section">
              <h4>Upload New Banner</h4>

              <div className="upload-form">
                <div className="form-group">
                  <label>Select Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileChange}
                    className="file-input"
                  />
                  <p className="file-help">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>

                {bannerPreview && (
                  <div className="preview-section">
                    <label>Preview</label>
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      className="banner-preview"
                    />
                  </div>
                )}
              </div>

              <div className="upload-actions">
                <button
                  onClick={handleUploadBanner}
                  disabled={!bannerFile}
                  className={`btn ${bannerFile ? 'btn-primary' : 'btn-disabled'}`}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Banner
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="btn btn-cancel full-width"
              >
                Close Banner Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {isEditModalOpen && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-content edit-modal">
            <div className="modal-header">
              <h3>Edit Client Details</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="close-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="edit-form">
              {/* Basic Information */}
              <div className="form-section">
                <h4>Basic Information</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Client Name</label>
                    <input
                      type="text"
                      name="clientName"
                      value={editClient.clientName}
                      onChange={handleEditInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editClient.email}
                      onChange={handleEditInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Venture Name</label>
                    <input
                      type="text"
                      name="ventureName"
                      value={editClient.ventureName}
                      onChange={handleEditInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editClient.location}
                      onChange={handleEditInputChange}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div className="form-section">
                <h4>Property Details</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Plot Number</label>
                    <input
                      type="text"
                      name="plotNumber"
                      value={editClient.plotNumber}
                      onChange={handleEditInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Plot Size</label>
                    <input
                      type="text"
                      name="plotSize"
                      value={editClient.plotSize}
                      onChange={handleEditInputChange}
                      className="form-input"
                      placeholder="e.g., 1200 sq.ft"
                    />
                  </div>

                  <div className="form-group">
                    <label>Facing</label>
                    <select
                      name="facing"
                      value={editClient.facing}
                      onChange={handleEditInputChange}
                      className="form-input"
                    >
                      <option value="">Select Facing</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="North-East">North-East</option>
                      <option value="North-West">North-West</option>
                      <option value="South-East">South-East</option>
                      <option value="South-West">South-West</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Vastu</label>
                    <select
                      name="vastu"
                      value={editClient.vastu}
                      onChange={handleEditInputChange}
                      className="form-input"
                    >
                      <option value="">Select Vastu</option>
                      <option value="Vastu Compliant">Vastu Compliant</option>
                      <option value="Not Vastu Compliant">Not Vastu Compliant</option>
                      <option value="Partial Vastu">Partial Vastu</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Current Phase</label>
                    <select
                      name="currentPhase"
                      value={editClient.currentPhase}
                      onChange={handleEditInputChange}
                      className="form-input"
                    >
                      {phases.map((phase, index) => (
                        <option key={index} value={index + 1}>
                          {phase}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={editClient.status}
                      onChange={handleEditInputChange}
                      className="form-input"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Overview</label>
                  <textarea
                    name="overview"
                    value={editClient.overview}
                    onChange={handleEditInputChange}
                    rows="4"
                    className="form-textarea"
                    placeholder="Property overview and description..."
                  />
                </div>
              </div>

              {/* Updates Section */}
              <div className="form-section">
                <h4>Project Updates</h4>

                {/* Add New Update */}
                <div className="update-form">
                  <h5>Add New Update</h5>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Update Message</label>
                      <input
                        type="text"
                        name="message"
                        value={newUpdate.message}
                        onChange={handleUpdateInputChange}
                        className="form-input"
                        placeholder="Enter update message..."
                      />
                    </div>

                    <div className="form-group">
                      <label>Date</label>
                      <input
                        type="date"
                        name="date"
                        value={newUpdate.date}
                        onChange={handleUpdateInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={handleAddUpdate}
                      className="btn btn-success"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Update
                    </button>
                  </div>
                </div>

                {/* Existing Updates */}
                <div className="existing-updates">
                  <h5>Existing Updates</h5>
                  {editClient.updates && editClient.updates.length > 0 ? (
                    <div className="updates-list">
                      {editClient.updates.map((update, index) => (
                        <div key={index} className="update-item editable">
                          <div className="update-content">
                            <p>{update.message}</p>
                            <span>{update.date}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveUpdate(index)}
                            className="remove-btn"
                          >
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-updates">No updates added yet</p>
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateClient}
                  className="btn btn-primary"
                >
                  Update Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Management Modal */}
      {isDocumentModalOpen && selectedClient && (
        <div className="modal-overlay">
          <div className="modal-content documents-modal">
            <div className="modal-header">
              <h3>Document Management: {selectedClient.clientName}</h3>
              <button
                onClick={() => setIsDocumentModalOpen(false)}
                className="close-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Add Document Form */}
            <div className="add-document-section">
              <h4>Add New Document</h4>

              <div className="form-grid">
                <div className="form-group">
                  <label>Document Type</label>
                  <select
                    name="type"
                    value={newDocument.type}
                    onChange={handleDocumentInputChange}
                    className="form-input"
                  >
                    <option value="Land Document">Land Document</option>
                    <option value="Registry">Registry Document</option>
                    <option value="Sale Agreement">Sale Agreement</option>
                    <option value="Tax Receipt">Tax Receipt</option>
                    <option value="Approval Plan">Approval Plan</option>
                    <option value="Encumbrance Certificate">Encumbrance Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Document Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newDocument.name}
                    onChange={handleDocumentInputChange}
                    className="form-input"
                    placeholder="e.g., Land Deed Agreement"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Upload File</label>
                  <div className="file-upload-group">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="file-input"
                    />
                    {newDocument.file && (
                      <span className="file-name">
                        {newDocument.file.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  onClick={handleAddDocument}
                  className="btn btn-primary"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Document
                </button>
              </div>
            </div>

            {/* Documents List */}
            <div className="documents-list-section">
              <h4>Existing Documents</h4>

              {selectedClient.documents && selectedClient.documents.length === 0 ? (
                <div className="empty-documents">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <div className="documents-table-container">
                  <table className="documents-table">
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Type</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClient.documents && selectedClient.documents.map((doc) => (
                        <tr key={doc._id || doc.id} className="document-row">
                          <td>{doc.name}</td>
                          <td>
                            <span className="document-type">
                              {doc.type}
                            </span>
                          </td>
                          <td>{doc.date}</td>
                          <td>
                            <div className="document-actions">
                              <button
                                className="action-btn download-btn"
                                onClick={() => handleDownloadDocument(selectedClient._id || selectedClient.id, doc._id || doc.id, doc.fileName)}
                              >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteDocument(selectedClient._id || selectedClient.id, doc._id || doc.id)}
                              >
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setIsDocumentModalOpen(false)}
                className="btn btn-cancel full-width"
              >
                Close Document Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content add-modal">
            <div className="modal-header">
              <h3>Add New Client</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="close-btn"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="add-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Client Name</label>
                  <input
                    type="text"
                    name="clientName"
                    value={newClient.clientName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newClient.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={newClient.password}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Property Name</label>
                  <input
                    type="text"
                    name="propertyName"
                    value={newClient.propertyName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Property Location</label>
                  <input
                    type="text"
                    name="propertyLocation"
                    value={newClient.propertyLocation}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Plot</label>
                  <input
                    type="text"
                    name="plote"
                    value={newClient.plote}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={newClient.price}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={newClient.status}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Banner Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerInputChange}
                    className="file-input"
                  />
                  <p className="file-help">
                    Optional: Upload a banner image for this client. Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddClient}
                  className="btn btn-primary"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientListPage;