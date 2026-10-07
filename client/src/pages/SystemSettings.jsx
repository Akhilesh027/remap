import React, { useState, useEffect, useRef } from "react";
import logo from '../Images/logo.png'
/**
 * Props you might pass from parent/Layout:
 * user: { name, role }
 * darkMode: boolean (if you already have a theme system)
 */
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
const MAX_SIZE_MB = 2;

const LOCAL_KEY = "system_settings_v1";

const SystemSettings = ({ user, darkMode }) => {
  // Role guard (only Management can edit)
  const isManagement = user?.role?.toLowerCase().includes("management");

  // Local state
  const [companyName, setCompanyName] = useState("ReMAP");
  const [logoDataUrl, setLogoDataUrl] = useState(null);         // current logo (DataURL or remote URL)
  const [draftName, setDraftName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);
  const [dirty, setDirty] = useState(false); // track unsaved edits

  /* -----------------------
     Load persisted settings
  ------------------------*/
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.companyName) setCompanyName(parsed.companyName);
        if (parsed.logoDataUrl) setLogoDataUrl(parsed.logoDataUrl);
      }
    } catch (e) {
      console.warn("Settings parse error:", e);
    }
  }, []);

  /* -----------------------
     Utility: initials fallback
  ------------------------*/
  const initials = (companyName || "C")
    .split(/\s+/)
    .map(w => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  /* -----------------------
     Begin editing name
  ------------------------*/
  const startEditName = () => {
    setDraftName(companyName);
    setIsEditingName(true);
    setError("");
  };

  const cancelEditName = () => {
    setDraftName("");
    setIsEditingName(false);
    setError("");
  };

  const handleNameSave = () => {
    if (draftName.trim().length < 2) {
      setError("Company name must be at least 2 characters.");
      return;
    }
    setCompanyName(draftName.trim());
    setIsEditingName(false);
    setDirty(true);
  };

  /* -----------------------
     Handle logo upload
  ------------------------*/
  const onLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError("Unsupported file type. Use PNG, JPG, or SVG.");
      return;
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      setUploadError(`File too large. Max ${MAX_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoDataUrl(ev.target.result);
      setDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoDataUrl(null);
    setDirty(true);
    setUploadError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* -----------------------
     Persist changes (demo)
  ------------------------*/
  const saveSettings = async () => {
    setSaving(true);
    setError("");
    try {
      // 👇 Replace this block with your real API call
      // await api.put("/api/system/settings", { companyName, logo: logoDataUrl });
      localStorage.setItem(
        LOCAL_KEY,
        JSON.stringify({ companyName, logoDataUrl })
      );
      // --------------------
      setDirty(false);
    } catch (e) {
      setError("Failed to save settings. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!isManagement) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          System Settings
        </h1>
        <p className="text-sm text-red-600">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            System Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update global branding for all users.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            disabled={!dirty || saving}
            onClick={saveSettings}
            className={`px-5 py-2 rounded-lg text-sm font-medium text-white transition ${
              dirty
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Card: Branding */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Branding
        </h2>

        {/* Company Name */}
        <div className="mb-8">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Company Name
            </label>
            {!isEditingName ? (
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3">
                <span className="font-medium text-gray-800 dark:text-gray-100">
                  ReMAP
                </span>
                <button
                  onClick={startEditName}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Edit
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  autoFocus
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="Enter company name"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleNameSave}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditName}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {isEditingName && error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
        </div>

        {/* Logo Section */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Company Logo
          </label>
          <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
            {/* Preview */}
            <div className="flex flex-col items-center">
              <div className="w-28 h-28 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
            
                  <img
                    src={logo}
                    alt="Company Logo"
                    className="object-contain w-full h-full"
                  />
             
              </div>
              {logoDataUrl && (
                <button
                  onClick={removeLogo}
                  className="mt-3 text-xs text-red-600 hover:underline"
                >
                  Remove Logo
                </button>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Upload a square image (recommended 256×256). Allowed: PNG, JPG,
                SVG. Max {MAX_SIZE_MB}MB.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                >
                  {logoDataUrl ? "Change Logo" : "Upload Logo"}
                </button>
                {!logoDataUrl && (
                  <button
                    onClick={() => {
                      setLogoDataUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Reset
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_IMAGE_TYPES.join(",")}
                onChange={onLogoSelect}
                className="hidden"
              />
              {uploadError && (
                <p className="text-xs text-red-600 mt-2">{uploadError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Reminder */}
      {dirty && !saving && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          You have unsaved changes. Don’t forget to click “Save Changes”.
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
