import React from "react";
import "./WalkInForm.css"; // Make sure this CSS file exists

const WalkInForm = ({
  form,
  handleFormChange,
  handleSubmit,
  isEditing,
  STATUS_OPTIONS,
  mockData,
  onClose // Function to close modal
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Cross / Close Button */}
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="modal-title">{isEditing ? "Edit Walk-in" : "Add Walk-in"}</h2>

        <form className="walkin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => handleFormChange("name", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="text"
              value={form.phone}
              onChange={e => handleFormChange("phone", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Purpose</label>
            <input
              type="text"
              value={form.purpose}
              onChange={e => handleFormChange("purpose", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={e => handleFormChange('status', e.target.value)}
            >
              {(STATUS_OPTIONS || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              rows="2"
              value={form.notes}
              onChange={e => handleFormChange("notes", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Assign to Staff</label>
            <select
              value={form.assigned}
              onChange={e => handleFormChange("assigned", e.target.value)}
            >
              <option value="">Select staff</option>
              {(Object.values(mockData?.users || {}))
                .filter(u => u.role !== "Driver")
                .map(u => (
                  <option key={u.name} value={u.name}>{u.name}</option>
                ))}
            </select>
          </div>

          <button type="submit" className="submit-btn">
            {isEditing ? "Save Changes" : "Add Walk-in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default WalkInForm;
