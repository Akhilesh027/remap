import React, { useState, useEffect } from 'react';

const ContactsPage = () => {
  /* ---------------- State ---------------- */
  const [contacts, setContacts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [exportDropdown, setExportDropdown] = useState(false);

  /* ---------------- Seed Data ---------------- */
  useEffect(() => {
    setContacts([
      {
        id: 1,
        name: 'Sir M.N. Harinadraprasad',
        position: 'Collector',
        role: 'Collector',
        phone: '8985555501',
        email: 'collector@district.gov',
        department: 'Revenue',
      },
      {
        id: 2,
        name: 'Valluri Kranthi',
        position: 'Surveyor',
        role: 'Survey Officer',
        phone: '08455276555',
        email: 'survey@district.gov',
        department: 'Survey',
      },
      {
        id: 3,
        name: 'Naryan Reddy',
        position: 'RDO',
        role: 'Revenue Officer',
        phone: '040-23235642',
        email: 'rdo@district.gov',
        department: 'Revenue',
      },
      {
        id: 4,
        name: 'Rajesh Kumar',
        position: 'Deputy Collector',
        role: 'Administration',
        phone: '9876543210',
        email: 'deputy@district.gov',
        department: 'Administration',
      },
      {
        id: 5,
        name: 'Priya Sharma',
        position: 'Land Officer',
        role: 'Land Records',
        phone: '8765432109',
        email: 'land@district.gov',
        department: 'Revenue',
      },
      {
        id: 6,
        name: 'Amit Patel',
        position: 'Survey Assistant',
        role: 'Field Survey',
        phone: '7654321098',
        email: 'surveyassist@district.gov',
        department: 'Survey',
      },
      {
        id: 7,
        name: 'Sunil Verma',
        position: 'Revenue Inspector',
        role: 'Tax Collection',
        phone: '6543210987',
        email: 'revenue@district.gov',
        department: 'Revenue',
      },
    ]);
  }, []);

  /* ---------------- Form State ---------------- */
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    role: '',
    phone: '',
    email: '',
    department: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------------- Form Submit ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editContact) {
      setContacts((list) =>
        list.map((c) => (c.id === editContact.id ? { ...formData, id: editContact.id } : c))
      );
    } else {
      const newContact = {
        ...formData,
        id: contacts.length ? Math.max(...contacts.map((c) => c.id)) + 1 : 1,
      };
      setContacts((list) => [...list, newContact]);
    }
    closePopup();
  };

  const setupEdit = (contact) => {
    setEditContact(contact);
    setFormData({
      name: contact.name,
      position: contact.position,
      role: contact.role,
      phone: contact.phone,
      email: contact.email,
      department: contact.department,
    });
    setShowPopup(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      setContacts((list) => list.filter((c) => c.id !== id));
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setEditContact(null);
    setFormData({
      name: '',
      position: '',
      role: '',
      phone: '',
      email: '',
      department: '',
    });
  };

  /* ---------------- Export ---------------- */
  const handleExport = (type) => {
    // simple demo
    let exportData = '';
    switch (type) {
      case 'xlsx':
        exportData = 'Excel format: ' + JSON.stringify(filteredContacts);
        break;
      case 'pdf':
        exportData = 'PDF format: ' + JSON.stringify(filteredContacts);
        break;
      case 'docx':
        exportData = 'Word format: ' + JSON.stringify(filteredContacts);
        break;
      default:
        break;
    }
    alert(`Exporting contacts to ${type.toUpperCase()}:\n${exportData}`);
    setExportDropdown(false);
  };

  /* ---------------- Filtering ---------------- */
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------------- Pagination ---------------- */
  const indexOfLastContact = currentPage * itemsPerPage;
  const indexOfFirstContact = indexOfLastContact - itemsPerPage;
  const currentContacts = filteredContacts.slice(indexOfFirstContact, indexOfLastContact);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  const paginate = (page) => setCurrentPage(page);
  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const nextPage = () => currentPage < totalPages && setCurrentPage((p) => p + 1);

  /* ---------------- Department Badge Colors ---------------- */
  const deptBadge = (dept) => {
    switch (dept) {
      case 'Revenue':
        return 'bg-green-100 text-green-800';
      case 'Survey':
        return 'bg-blue-100 text-blue-800';
      case 'Administration':
        return 'bg-purple-100 text-purple-800';
      case 'Land Records':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Contacts</h1>
            <nav className="mt-2 text-sm">
              <ol className="flex items-center space-x-2">
                <li className="text-indigo-600 font-medium">Contacts</li>
                <li className="text-gray-400">/</li>
                <li className="text-indigo-600 font-medium">Govt. Contacts</li>
              </ol>
            </nav>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            </div>

            {/* Refresh */}
            <button
              className="p-2 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              title="Clear search"
            >
              <i className="fas fa-sync-alt" />
            </button>

            {/* Export */}
            <div className="relative">
              <button
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1 text-sm"
                onClick={() => setExportDropdown((o) => !o)}
              >
                Export <span>▾</span>
              </button>
              {exportDropdown && (
                <div className="absolute right-0 mt-1 w-40 bg-white shadow-lg rounded-md py-1 z-10 border border-gray-200">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      handleExport('xlsx');
                    }}
                  >
                    Excel (.xlsx)
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      handleExport('pdf');
                    }}
                  >
                    PDF (.pdf)
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      handleExport('docx');
                    }}
                  >
                    Word (.docx)
                  </a>
                </div>
              )}
            </div>

            {/* Add Contact */}
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              onClick={() => {
                setEditContact(null);
                setFormData({
                  name: '',
                  position: '',
                  role: '',
                  phone: '',
                  email: '',
                  department: '',
                });
                setShowPopup(true);
              }}
            >
              + Add Contact
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closePopup}
          />
          {/* content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-semibold">
                {editContact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-xl leading-none"
                onClick={closePopup}
              >
                &times;
              </button>
            </div>

            <form className="p-4 space-y-4" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  name="position"
                  placeholder="Enter position"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  name="role"
                  placeholder="Enter role"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  name="department"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Survey">Survey</option>
                  <option value="Administration">Administration</option>
                  <option value="Land Records">Land Records</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={closePopup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  {editContact ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contacts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Contact Number
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentContacts.length > 0 ? (
                currentContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    {/* Name + position */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {/* Placeholder avatar */}
                          <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                            {contact.name?.[0] || '?'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.position}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.role}</div>
                    </td>

                    {/* Phone */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.phone}</div>
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{contact.email}</div>
                    </td>

                    {/* Department Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${deptBadge(
                          contact.department
                        )}`}
                      >
                        {contact.department}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => setupEdit(contact)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDelete(contact.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500 italic"
                  >
                    No contacts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredContacts.length > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:block">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{indexOfFirstContact + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastContact, filteredContacts.length)}
                </span>{' '}
                of <span className="font-medium">{filteredContacts.length}</span> contacts
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-2 py-1 border rounded-l-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-chevron-left text-xs" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`px-3 py-1 border text-sm ${
                    currentPage === page
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`px-2 py-1 border rounded-r-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="fas fa-chevron-right text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsPage;
