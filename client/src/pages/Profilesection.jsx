import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

/* -------------------------------------------------------------
 * CONFIGURATION & UTILITIES
 * ------------------------------------------------------------- */

// ⚠️ IMPORTANT: Update this to your running backend URL
const API_BASE_URL = 'http://localhost:5000/api/employees';

const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});

const getInitials = (first, last) => ((first?.[0] || "") + (last?.[0] || "")).toUpperCase();

const statusColorMap = {
    Hot: "bg-red-100 text-red-700",
    Warm: "bg-yellow-100 text-yellow-700",
    Cold: "bg-gray-100 text-gray-700",
    Client: "bg-green-100 text-green-700",
};

const userTypeColorMap = {
    Buyer: "bg-indigo-100 text-indigo-700",
    Seller: "bg-purple-100 text-purple-700",
    Agent: "bg-teal-100 text-teal-700",
    Tenant: "bg-blue-100 text-blue-700",
    Default: "bg-gray-100 text-gray-700",
};

const Badge = ({ children, className = "" }) => (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${className}`}>{children}</span>
);

const SectionCard = ({ title, actions, children }) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
        {children}
    </div>
);

const TABS = [
    { key: "overview", label: "Overview", icon: "fas fa-user" },
    { key: "properties", label: "Properties", icon: "fas fa-building" },
    { key: "documents", label: "Documents", icon: "fas fa-file-alt" },
    { key: "activity", label: "Activity", icon: "fas fa-stream" },
    { key: "payments", label: "Payments", icon: "fas fa-rupee-sign" },
    { key: "notes", label: "Notes", icon: "fas fa-sticky-note" },
];

/* -------------------------------------------------------------
 * PRESENTATIONAL COMPONENTS
 * ------------------------------------------------------------- */

function ProfileTabs({ current, onChange }) {
    return (
        <div className="mt-8 bg-white rounded-xl shadow-sm overflow-x-auto">
            <nav className="flex items-center whitespace-nowrap">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => onChange(t.key)}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 min-w-fit ${current === t.key
                                ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                                : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                    >
                        <i className={`${t.icon} text-xs`} /> {t.label}
                    </button>
                ))}
            </nav>
        </div>
    );
}

function UserHeaderCard({ user, attendance, onEdit, onCall, onEmail, onSchedule, onMarkAttendance }) {
    const statusClasses = statusColorMap[user.status] || statusColorMap.Default;
    const typeClasses = userTypeColorMap[user.userType] || userTypeColorMap.Default;
    const [calendarValue, setCalendarValue] = useState(new Date());

    const tileClassName = useCallback(({ date, view }) => {
        if (view === 'month') {
            const dateStr = date.toISOString().split('T')[0];
            if (attendance.includes(dateStr)) {
                return 'attendance-marked';
            }
        }
        return null;
    }, [attendance]);

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left: avatar + main info */}
            <div className="flex items-start gap-4 flex-shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center ring-2 ring-indigo-200">
                    {user.avatar ? (
                        <img src={user.avatar} alt={`${user.firstName}`} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-xl font-semibold">{getInitials(user.firstName ?? '', user.lastName ?? '')}</span>
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        {user.firstName ?? 'N/A'} {user.lastName ?? 'User'}
                    </h2>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                        <Badge className={typeClasses}>{user.userType ?? user.role ?? 'Employee'}</Badge>
                        <Badge className={statusClasses}>{user.status ? user.status.toUpperCase() + user.status.slice(1) : 'Active'}</Badge>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <div>
                            <i className="fas fa-phone-alt mr-2 text-gray-400" /> {user.phone ?? user.phoneNumber ?? '—'}
                        </div>
                        <div>
                            <i className="fas fa-envelope mr-2 text-gray-400" /> {user.email ?? '—'}
                        </div>
                        {user.city && (
                            <div>
                                <i className="fas fa-map-marker-alt mr-2 text-gray-400" /> {user.city}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Middle: Calendar with Attendance Highlights */}
            <div className="calendar-wrapper w-full max-w-xs flex-shrink-0">
                <Calendar
                    onChange={setCalendarValue}
                    value={calendarValue}
                    tileClassName={tileClassName}
                />
            </div>

            {/* Right: quick actions and NEW attendance button */}
            <div className="flex flex-col gap-3 w-full lg:w-auto lg:items-end flex-shrink-0">
                <button
                    onClick={() => onMarkAttendance?.(user)}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 w-full lg:w-auto justify-center whitespace-nowrap"
                >
                    <i className="fas fa-check-circle mr-2" /> Mark Attendance
                </button>

                <div className="flex flex-wrap justify-between lg:justify-end gap-2 w-full lg:w-auto">
                    <button
                        onClick={() => onCall?.(user)}
                        className="inline-flex items-center p-3 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 flex-grow lg:flex-grow-0"
                    >
                        <i className="fas fa-phone-alt" />
                    </button>
                    <button
                        onClick={() => onEmail?.(user)}
                        className="inline-flex items-center p-3 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex-grow lg:flex-grow-0"
                    >
                        <i className="fas fa-envelope" />
                    </button>
                    <button
                        onClick={() => onSchedule?.(user)}
                        className="inline-flex items-center p-3 rounded-lg text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 flex-grow lg:flex-grow-0"
                    >
                        <i className="fas fa-calendar-alt" />
                    </button>
                    <button
                        onClick={() => onEdit?.(user)}
                        className="inline-flex items-center p-3 rounded-lg text-sm font-medium text-white bg-gray-400 hover:bg-gray-500 flex-grow lg:flex-grow-0"
                    >
                        <i className="fas fa-edit" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function OverviewTab({ user, onAssignAgent }) {
    const budget = `${currencyFormatter.format(user.budgetMin ?? 0)} – ${currencyFormatter.format(user.budgetMax ?? 0)}`;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Personal Details */}
            <SectionCard title="Personal Details">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <dt className="text-gray-500">Full Name</dt>
                    <dd className="text-gray-900 col-span-2 sm:col-span-1">{user.firstName ?? '—'} {user.lastName ?? '—'}</dd>

                    <dt className="text-gray-500">Date of Birth</dt>
                    <dd className="text-gray-900">{user.dob ? new Date(user.dob).toLocaleDateString() : '—'}</dd>

                    <dt className="text-gray-500">Gender</dt>
                    <dd className="text-gray-900">{user.gender || "—"}</dd>

                    <dt className="text-gray-500">Role / Type</dt>
                    <dd className="text-gray-900">{user.role || user.userType || "—"}</dd>

                    <dt className="text-gray-500">Preferred Contact</dt>
                    <dd className="text-gray-900">{user.preferredContact || "—"}</dd>

                    <dt className="text-gray-500">City</dt>
                    <dd className="text-gray-900">{user.city || "—"}</dd>

                    <dt className="text-gray-500">Address</dt>
                    <dd className="text-gray-900 col-span-2">{user.address || "—"}</dd>
                </dl>
            </SectionCard>

            {/* Duties & Employment */}
            <SectionCard title="Duties & Employment">
                <dl className="space-y-3 text-sm">
                    <div>
                        <dt className="text-gray-500">Duties / Job Description</dt>
                        <dd className="text-gray-900 font-medium">{user.duties || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Files / Documents</dt>
                        <dd className="text-gray-900 flex flex-wrap gap-2 mt-1">
                            {user.files?.length ? (
                                user.files.map((file, index) => (
                                    <Badge key={index} className="bg-gray-100 text-gray-800">File {index + 1}</Badge>
                                ))
                            ) : (
                                "—"
                            )}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-gray-500">Status</dt>
                        <dd className="text-gray-900">
                            <Badge className={user.status === 'terminated' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                                {user.status || 'active'}
                            </Badge>
                        </dd>
                    </div>
                </dl>
            </SectionCard>

            {/* Assigned Agent (Repurposed for Supervisor/Manager) */}
            <SectionCard
                title="Reporting To (Manager)"
                actions={
                    <button
                        onClick={() => onAssignAgent?.(user)}
                        className="text-xs px-3 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        Reassign
                    </button>
                }
            >
                {user.assignedAgent ? (
                    <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-900">Ramesh Kumar (Supervisor)</p>
                        <p className="text-sm text-gray-500">(Placeholder Data)</p>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">No direct manager assigned.</p>
                )}
            </SectionCard>
        </div>
    );
}

function PropertiesTab({ favorites = [] }) {
    if (!favorites.length) {
        return (
            <SectionCard title="Related Properties / Assets">
                <div className="py-8 text-center text-gray-500 italic">No assets or related properties listed.</div>
            </SectionCard>
        );
    }
    return <SectionCard title="Related Properties / Assets"><p>Listing {favorites.length} items (Data not fully populated by API).</p></SectionCard>;
}

function DocumentsTab({ documents = [] }) {
    const files = documents.map((url, index) => ({ id: index + 1, name: `Employee File ${index + 1}`, type: 'Employment', url: url }));

    if (!files.length) {
        return (
            <SectionCard title="Documents (Files)">
                <div className="py-8 text-center text-gray-500 italic">No documents/files uploaded.</div>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="Documents (Files)">
            <ul className="divide-y divide-gray-100 text-sm">
                {files.map((d) => (
                    <li key={d.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            <i className="fas fa-file-alt text-gray-400" />
                            <div className="min-w-0">
                                <p className="font-medium text-gray-800 truncate">{d.name}</p>
                                <p className="text-xs text-gray-500">
                                    {d.type}
                                </p>
                            </div>
                        </div>
                        <a href={d.url || "#"} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                            Download
                        </a>
                    </li>
                ))}
            </ul>
        </SectionCard>
    );
}

function ActivityTab({ activities = [] }) {
    const sorted = useMemo(
        () => [...activities].sort((a, b) => new Date(b.at) - new Date(a.at)),
        [activities]
    );

    const iconMap = {
        call: "fas fa-phone-alt",
        email: "fas fa-envelope",
        "site-visit": "fas fa-map-marked-alt",
        note: "fas fa-sticky-note",
        default: "fas fa-stream",
    };

    if (!sorted.length) {
        return (
            <SectionCard title="Activity Timeline">
                <div className="py-8 text-center text-gray-500 italic">No activity logged.</div>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="Activity Timeline">
            <ul className="relative pl-6 text-sm">
                {sorted.map((act, idx) => {
                    const icon = iconMap[act.type] || iconMap.default;
                    const dt = new Date(act.at);
                    const dateStr = dt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });
                    const timeStr = dt.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                    });
                    return (
                        <li key={act.id} className="pb-6 last:pb-0">
                            {idx !== sorted.length - 1 && (
                                <span className="absolute left-2 top-4 bottom-0 w-px bg-gray-200" />
                            )}
                            <span className="absolute left-0 top-1 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                                <i className={icon} />
                            </span>
                            <div className="ml-4">
                                <p className="font-medium text-gray-800 capitalize">{act.type.replace('-', ' ')}</p>
                                <p className="text-gray-600 mt-1">{act.note}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {dateStr} at {timeStr}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </SectionCard>
    );
}

function PaymentsTab({ payments = [] }) {
    const statusBadge = (status) => {
        switch (status) {
            case "Paid": return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
            case "Pending": return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
            case "Failed": return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
            default: return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
        }
    };

    if (!payments.length) {
        return (
            <SectionCard title="Payments & Invoices">
                <div className="py-8 text-center text-gray-500 italic">No payments recorded.</div>
            </SectionCard>
        );
    }

    return (
        <SectionCard title="Payments & Invoices">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Label</th>
                            <th className="px-4 py-2 text-left font-medium">Amount</th>
                            <th className="px-4 py-2 text-left font-medium">Date</th>
                            <th className="px-4 py-2 text-left font-medium">Status</th>
                            <th className="px-4 py-2 text-right font-medium">Invoice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-800">{p.label}</td>
                                <td className="px-4 py-2 text-gray-900">{currencyFormatter.format(p.amount)}</td>
                                <td className="px-4 py-2 text-gray-600">{p.date}</td>
                                <td className="px-4 py-2">{statusBadge(p.status)}</td>
                                <td className="px-4 py-2 text-right">
                                    <a href={p.invoiceUrl} className="text-indigo-600 hover:text-indigo-800 font-medium text-xs">
                                        Download
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </SectionCard>
    );
}

function NotesTab({ notes, onSave }) {
    const [val, setVal] = useState(notes || "");
    const dirty = val !== notes;
    return (
        <SectionCard title="Internal Notes">
            <textarea
                value={val}
                onChange={(e) => setVal(e.target.value)}
                rows={6}
                placeholder="Write internal notes about this user..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <div className="mt-4 flex justify-end">
                <button
                    disabled={!dirty}
                    onClick={() => dirty && onSave?.(val)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition ${dirty ? "bg-indigo-600 hover:bg-indigo-700" : "bg-gray-300 cursor-not-allowed"
                        }`}
                >
                    Save Notes
                </button>
            </div>
        </SectionCard>
    );
}

function ScheduleModal({ open, user, onClose, onSubmit }) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [note, setNote] = useState("");

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Meeting</h3>
                <p className="text-sm text-gray-600 mb-4">
                    With: <span className="font-medium">{user.firstName} {user.lastName}</span>
                </p>
                <div className="space-y-4 text-sm">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Note</label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Purpose, property to visit, etc."
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            onSubmit?.({ date, time, note });
                            onClose?.();
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------
 * MAIN USER PROFILE COMPONENT
 * ------------------------------------------------------------- */

function UserProfile({ user, initialAttendance = [] }) {
    const [currentUser, setCurrentUser] = useState(user);
    const [tab, setTab] = useState("overview");
    const [showSchedule, setShowSchedule] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState(initialAttendance);

    useEffect(() => {
        setCurrentUser(user);
        setAttendanceRecords(initialAttendance);
    }, [user, initialAttendance]);

    if (!currentUser) {
        return null;
    }

    // Mapping Mongoose fields and ensuring safety with nullish coalescing
    const {
        firstName, lastName, email, phoneNumber, dob, gender, address, zip, role, status, duties, files,
        userType = role, phone = phoneNumber, city = null, avatar = null, preferredContact = null,
        budgetMin = null, budgetMax = null, preferredLocations = [], propertyTypes = [], leadSource = null,
        assignedAgent = null, documents = files || [], favorites = [], activities = [], payments = [], notes = null,
    } = currentUser;

    const userForTabs = {
        ...currentUser,
        firstName, lastName, email, phone, city, status, userType, avatar, dob, gender, address,
        preferredContact, budgetMin, budgetMax, preferredLocations, propertyTypes, leadSource, assignedAgent,
        documents: (documents.length > 0 && typeof documents[0] === 'string')
            ? documents.map((url, index) => ({ id: index, name: 'File', type: 'Employment', url }))
            : documents, // Handle plain string array for 'files'
        favorites, activities, payments, notes, role: role || userType,
    };

    /* Handlers */
    const handleEdit = () => { alert("Edit profile form would open here."); };
    const handleAssignAgent = () => { alert("Assign/Reassign Manager or Agent logic triggered."); };
    const handleCall = () => { if (userForTabs.phone) window.location.href = `tel:${userForTabs.phone}`; else alert('Phone number not available.'); };
    const handleEmail = () => { if (userForTabs.email) window.location.href = `mailto:${userForTabs.email}`; else alert('Email not available.'); };
    const handleSchedule = () => { setShowSchedule(true); };
    const handleSaveNotes = (newNotes) => { setCurrentUser((u) => ({ ...u, notes: newNotes })); alert("Notes saved."); };
    const handleScheduledMeeting = ({ date, time, note }) => { alert(`Meeting scheduled for ${date} at ${time}. Note: ${note}`); };

    const handleMarkAttendance = () => {
        const today = new Date().toISOString().split('T')[0];
        if (attendanceRecords.includes(today)) {
            alert(`Attendance for ${today} is already marked!`);
            return;
        }
        // ⚠️ REAL API CALL HERE: POST /api/attendance
        setAttendanceRecords(prev => [...prev, today]);
        alert(`Attendance marked successfully for ${today}!`);
    };

    /* Content per tab */
    let tabContent = null;
    switch (tab) {
        case "overview":
            tabContent = <OverviewTab user={userForTabs} onAssignAgent={handleAssignAgent} />;
            break;
        case "properties":
            tabContent = <PropertiesTab favorites={userForTabs.favorites} />;
            break;
        case "documents":
            // Use the mapped documents array which handles both old demo data and new file array
            tabContent = <DocumentsTab documents={userForTabs.documents} />;
            break;
        case "activity":
            tabContent = <ActivityTab activities={userForTabs.activities} />;
            break;
        case "payments":
            tabContent = <PaymentsTab payments={userForTabs.payments} />;
            break;
        case "notes":
            tabContent = <NotesTab notes={userForTabs.notes} onSave={handleSaveNotes} />;
            break;
        default:
            tabContent = null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Custom Styles for Calendar */}
            <style>{`
                .react-calendar__tile.attendance-marked { background-color: #d1fae5; color: #065f46; border-radius: 6px; font-weight: bold; }
                .react-calendar__tile.attendance-marked:hover { background-color: #a7f3d0; }
                .react-calendar { border: none !important; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); border-radius: 0.75rem; padding: 1rem; }
            `}</style>

            {/* Breadcrumb */}
            <div className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-6">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                        <li><Link to="/employees" className="text-indigo-600 hover:underline">Employees</Link></li>
                        <li>/</li>
                        <li className="text-gray-700">{userForTabs.firstName} {userForTabs.lastName}</li>
                    </ol>
                </div>
            </div>

            {/* Header */}
            <div className="container mx-auto px-4 mt-8">
                <UserHeaderCard
                    user={userForTabs}
                    attendance={attendanceRecords}
                    onEdit={handleEdit}
                    onCall={handleCall}
                    onEmail={handleEmail}
                    onSchedule={handleSchedule}
                    onMarkAttendance={handleMarkAttendance}
                />

                {/* Tabs */}
                <ProfileTabs current={tab} onChange={setTab} />

                {/* Tab Content */}
                <div className="mt-8 mb-16">{tabContent}</div>
            </div>

            {/* Schedule Modal */}
            <ScheduleModal
                open={showSchedule}
                user={userForTabs}
                onClose={() => setShowSchedule(false)}
                onSubmit={handleScheduledMeeting}
            />
        </div>
    );
}

/* -------------------------------------------------------------
 * FETCHER / ROOT COMPONENT (API Integration Layer)
 * ------------------------------------------------------------- */

export default function EmployeeProfilePage() {
    // 1. Get the User ID (from localStorage or useParams)
    // Assuming ID comes from localStorage after login/selection, or from React Router params
    const userId = localStorage.getItem("userId");
    const employeeId = localStorage.getItem("employeeId");

    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) {
                setIsLoading(false);
                setError("Employee ID not found. Please log in or select an employee.");
                return;
            }

            try {
                setIsLoading(true);
                setError(null);

                // --- Single Step Fetch: Get Employee Details using the ID ---
                const employeeResponse = await fetch(`${API_BASE_URL}/${employeeId}`);

                if (!employeeResponse.ok) {
                    const errorText = await employeeResponse.json();
                    throw new Error(errorText.message || `Failed to fetch employee profile. Status: ${employeeResponse.status}`);
                }

                const employeeData = await employeeResponse.json();

                // Set the fetched data
                setUserData(employeeData);
                setAttendanceRecords([]); // Ready for real attendance data fetch if needed

            } catch (e) {
                console.error("Profile Fetch Error:", e);
                setUserData(null);
                setError(`Error loading profile: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    if (isLoading) {
        return <div className="min-h-screen p-10 text-center text-indigo-600 font-semibold bg-gray-50">Loading employee profile...</div>;
    }

    if (error || !userData) {
        return <div className="min-h-screen p-10 text-center text-red-600 font-medium bg-gray-50">Error: {error || `Employee data not available for ID: ${userId}.`}</div>;
    }

    return <UserProfile
        user={userData}
        initialAttendance={attendanceRecords}
    />;
}