import React from "react";
import "./AppointmentForm.css"; // Create this CSS file

const AppointmentForm = ({
  form,
  handleFormChange,
  handleSubmit,
  isEditing,
  STATUS_OPTIONS,
  onClose
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Close button */}
        <button className="close-btn" onClick={onClose}>×</button>

        <h2 className="modal-title">
          {isEditing ? "Edit Appointment" : "Schedule Appointment"}
        </h2>

        <form className="appointment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Client *</label>
            <input
              type="text"
              value={form.client}
              onChange={e => handleFormChange("client", e.target.value)}
              required
            />
          </div>

          <div className="form-group grid-2">
            <div>
              <label>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => handleFormChange("date", e.target.value)}
                required
              />
            </div>
            <div>
              <label>Time *</label>
              <input
                type="time"
                value={form.time}
                onChange={e => handleFormChange("time", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Admin</label>
            <input
              type="text"
              value={form.Admin}
              onChange={e => handleFormChange("Admin", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Property</label>
            <input
              type="text"
              value={form.property}
              onChange={e => handleFormChange("property", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select
              value={form.status}
              onChange={e => handleFormChange("status", e.target.value)}
            >
              {(STATUS_OPTIONS || []).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="submit-btn">
            {isEditing ? "Save Changes" : "Schedule"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm;
