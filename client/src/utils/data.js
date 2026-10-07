export const mockData = {
  users: {
    Management: { name: "Akhilesh Sharma", role: "Management (Rank-S)" },
    Admin: { name: "Ravi Verma", role: "Admin (Rank-AA)" },
    director: { name: "Karan Kapoor", role: "Director (Rank-A)" },
    executive: { name: "Karan Mehta", role: "Executive (Rank-B)" },
    telecaller: { name: "Pooja Reddy", role: "Telecaller (Rank-C)" },
    hr: { name: "Akhilesh Reddy", role: "HR (Rank-D)" },
    receptionist: { name: "Anita Desai", role: "Receptionist (Rank-E)" },
    driver: { name: "Rajesh Kumar", role: "Driver (Rank-F)" },
    Customer: { name: "Akhilesh reddy", role: "Customer" },
  },

  leads: [
    {
      id: 1,
      name: "Amit Singh",
      phone: "+91 98765 43210",
      email: "amit.singh@example.in",
      source: "Website",
      status: "New",
      campaign: "Monsoon Bonanza",
      assigned: "Unassigned"
    },
    {
      id: 2,
      name: "Sneha Joshi",
      phone: "+91 99876 54321",
      email: "sneha.joshi@example.in",
      source: "Referral",
      status: "Follow-up",
      campaign: "Ganesh Festival Offer",
      assigned: "Pooja Reddy"
    }
  ],

properties: [
  {
    id: 1,
    title: "Gachibowli Greens",
    date: "23rd Dec, 2024",
    rdoContact: "9849000001",
    collector: "Hyderabad",
    status: "Active",
    link: "/gachibowli",
    activity: "Karan Mehta conducted site visit and explained layout details to clients.",
    update: "Survey Completed",
    lat: 17.4375,
    lng: 78.3826,
    category: "Land"
  },
  {
    id: 2,
    title: "Kompally Meadows",
    date: "23rd Dec, 2024",
    rdoContact: "9849000002",
    collector: "Medchal",
    status: "Active",
    link: "/kompally",
    activity: "Pooja Reddy assisted legal team in document collection for Kompally Meadows.",
    update: "Survey Completed",
    lat: 17.5458,
    lng: 78.4905,
    category: "Land"
  },
  {
    id: 3,
    title: "Miyapur Hills",
    date: "23rd Dec, 2024",
    rdoContact: "9849000003",
    collector: "Ranga Reddy",
    status: "Upcoming",
    link: "/miyapur",
    activity: "Karan Mehta met with clients to showcase Miyapur Hills open plots.",
    update: "Survey Completed",
    lat: 17.4960,
    lng: 78.3915,
    category: "Venture"
  },
  {
    id: 4,
    title: "Shadnagar Township",
    date: "24th Dec, 2024",
    rdoContact: "9849000004",
    collector: "Mahbubnagar",
    status: "Pending",
    link: "/shadnagar",
    activity: "Anita Desai scheduled meetings for township layout discussions.",
    update: "Survey Completed",
    lat: 17.0805,
    lng: 78.3982,
    category: "Venture"
  },
  {
    id: 5,
    title: "Adibatla Heights",
    date: "24th Dec, 2024",
    rdoContact: "9849000005",
    collector: "Ibrahimpatnam",
    status: "Upcoming",
    link: "/adibatla-heights",
    activity: "Pooja Reddy followed up with architects for Adibatla Heights plan.",
    update: "Verification Completed",
    lat: 17.2436,
    lng: 78.5731,
    category: "Venture"
  },
  {
    id: 6,
    title: "Bachupally Residency",
    date: "25th Dec, 2024",
    rdoContact: "9849000006",
    collector: "Kukatpally",
    status: "Active",
    link: "/bachupally",
    activity: "Karan Mehta conducted walkthroughs with clients at Bachupally site.",
    update: "Survey Completed",
    lat: 17.5373,
    lng: 78.3715,
    category: "Venture"
  },
  {
    id: 7,
    title: "Tellapur Enclave",
    date: "25th Dec, 2024",
    rdoContact: "9849000007",
    collector: "Serilingampally",
    status: "Upcoming",
    link: "/tellapur-enclave",
    activity: "Pooja Reddy coordinated Tellapur site mapping with engineers.",
    update: "Verification Completed",
    lat: 17.4368,
    lng: 78.3051,
    category: "Venture"
  },
  {
    id: 8,
    title: "Ghatkesar Vision",
    date: "26th Dec, 2024",
    rdoContact: "9849000008",
    collector: "Ghatkesar",
    status: "Upcoming",
    link: "/ghatkesar-vision",
    activity: "Anita Desai handled client inquiries and documentation work.",
    update: "Survey Completed",
    lat: 17.4500,
    lng: 78.6850,
    category: "Land"
  },
  {
    id: 9,
    title: "Patancheru Heights",
    date: "26th Dec, 2024",
    rdoContact: "9849000009",
    collector: "Sangareddy",
    status: "Completed",
    link: "/patancheru-heights",
    activity: "Rajesh Kumar arranged client pickups and drops for site visits.",
    update: "Verification Completed",
    lat: 17.5345,
    lng: 78.2621,
    category: "Venture"
  },
  {
    id: 10,
    title: "Mokila Gardens",
    date: "27th Dec, 2024",
    rdoContact: "9849000010",
    collector: "Shankarpally",
    status: "Pending",
    link: "/mokila-gardens",
    activity: "Pooja Reddy assisted with Mokila layout updates and RERA filing.",
    update: "Documents Submitted",
    lat: 17.3900,
    lng: 78.2710,
    category: "Venture"
  }
],

  appointments: [
    {
      id: 1,
      client: "Amit Singh",
      date: "2025-07-16",
      time: "10:00 AM",
      executive: "Karan Mehta",
      property: "Gachibowli Greens",
      status: "Scheduled"
    },
    {
      id: 2,
      client: "Sneha Joshi",
      date: "2025-07-18",
      time: "3:00 PM",
      executive: "Pooja Reddy",
      property: "Kompally Meadows",
      status: "Completed"
    }
  ],

  cabRequests: [
    {
      id: 1,
      executive: "Karan Mehta",
      pickup: "Jubilee Hills Office, Hyderabad",
      destination: "Gachibowli Greens",
      time: "2025-07-17T10:30:00",
      status: "Pending",
      driver: "Rajesh Kumar"
    },
    {
      id: 2,
      executive: "Pooja Reddy",
      pickup: "KPHB Colony, Hyderabad",
      destination: "Kompally Meadows",
      time: "2025-07-17T13:00:00",
      status: "In Progress",
      driver: "Rajesh Kumar"
    },
    {
      id: 3,
      executive: "Anita Desai",
      pickup: "Hyderabad Airport Terminal 1",
      destination: "Tellapur Enclave",
      time: "2025-07-17T15:00:00",
      status: "Completed",
      driver: "Rajesh Kumar"
    },
    {
      id: 4,
      executive: "Karan Mehta",
      pickup: "Banjara Hills Road No. 12",
      destination: "Mokila Gardens",
      time: "2025-07-18T09:00:00",
      status: "Pending",
      driver: "Rajesh Kumar"
    }
  ],

 referrals: [
    {
      id: 1,
      referrer: "Amit Singh",
      referred: "Sneha Joshi",
      phone: "+91 98765 43210",
      relation: "Friend",
      status: "New",
      date: "2025-07-10",
      reward: "Pending",
      director: "Dir. Ramesh (Mngt)",
      executive: "Exec. Suresh",
      venture: "Green Meadows",
      originalPrice: 3800000,   // ₹38,00,000
      commissionPct: 2.5        // 2.5%
    },
    {
      id: 2,
      referrer: "Nikita Rao",
      referred: "Vikram Iyer",
      phone: "+91 91234 56789",
      relation: "Colleague",
      status: "Booked",
      date: "2025-07-08",
      reward: "₹5,000",
      director: "Dir. Kavya",
      executive: "Exec. Manoj",
      venture: "Sunrise Enclave",
      originalPrice: 5200000,   // ₹52,00,000
      commissionPct: 3          // 3%
    }
  ],
   commissions: [
    { id: 1, userRole: "Director",  userName: "Dir. Ramesh", venture: "Green Meadows",     property: "GM-A2", amount: 78000,  date: "2025-07-09", status: "Paid",      directorAmt: 78000, executiveAmt: 0 },
    { id: 2, userRole: "Executive", userName: "Exec. Suresh", venture: "Green Meadows",     property: "GM-A2", amount: 35000,  date: "2025-07-09", status: "Paid",      directorAmt: 0,     executiveAmt: 35000 },
    { id: 3, userRole: "Director",  userName: "Dir. Kavya",   venture: "Sunrise Enclave",   property: "SE-B9", amount: 104000, date: "2025-07-08", status: "Paid",      directorAmt: 104000,executiveAmt: 0 },
    { id: 4, userRole: "Executive", userName: "Exec. Manoj",   venture: "Sunrise Enclave",   property: "SE-B9", amount: 42000,  date: "2025-07-08", status: "Paid",      directorAmt: 0,     executiveAmt: 42000 },
    { id: 5, userRole: "Executive", userName: "Exec. Suresh", venture: "LakeView Residency", property: "LV-L12",amount: 25000,  date: "2025-07-15", status: "Pending",   directorAmt: 0,     executiveAmt: 25000 },
    { id: 6, userRole: "Director",  userName: "Dir. Ramesh",   venture: "LakeView Residency", property: "LV-L12",amount: 50000,  date: "2025-07-15", status: "Pending",   directorAmt: 50000, executiveAmt: 0 },
    { id: 7, userRole: "Executive", userName: "Exec. Suresh", venture: "Green Meadows",     property: "GM-A1", amount: 30000,  date: "2025-07-18", status: "Processing",directorAmt: 0,     executiveAmt: 30000 },
    { id: 8, userRole: "Director",  userName: "Dir. Ramesh",   venture: "Green Meadows",     property: "GM-A1", amount: 65000,  date: "2025-07-18", status: "Processing",directorAmt: 65000, executiveAmt: 0 },
    { id: 9, userRole: "Executive", userName: "Exec. Manoj",   venture: "Sunrise Enclave",   property: "SE-C4", amount: 28000,  date: "2025-07-19", status: "Pending",   directorAmt: 0,     executiveAmt: 28000 },
    { id:10, userRole: "Director",  userName: "Dir. Kavya",    venture: "Sunrise Enclave",   property: "SE-C4", amount: 56000,  date: "2025-07-19", status: "Pending",   directorAmt: 56000, executiveAmt: 0 },
    { id:11, userRole: "Executive", userName: "Exec. Suresh", venture: "Metro Heights",      property: "MH-M3", amount: 60000,  date: "2025-06-27", status: "Paid",      directorAmt: 0,     executiveAmt: 60000 },
    { id:12, userRole: "Director",  userName: "Mgmt Super",    venture: "Metro Heights",      property: "MH-M3", amount: 120000, date: "2025-06-27", status: "Paid",      directorAmt: 120000,executiveAmt: 0 },
  ],
};

// Common children for Chat dropdown across roles
const chatChildren = [
  { id: "chat", title: "Company Chat", icon: "fas fa-building" },
  { id: "Department-chat", title: "Department Chat", icon: "fas fa-users" },
  // Optional extra: enable Personal/Direct chat threads later
  // { id: "direct-messages", title: "Direct Messages", icon: "fas fa-comment-dots" },
];

export const menuConfig = {
  management: [
    { id: "Management-dashboard", title: "Dashboard", icon: "fas fa-chart-pie" },
    { id: "reports", title: "Reports & Analytics", icon: "fas fa-chart-bar" },
    { id: "leads-management", title: "Leads Management", icon: "fas fa-users" },
    { id: "inventory", title: "Property Inventory", icon: "fas fa-home" },
    { id: "VenturesInventory", title: "Venture Inventory", icon: "fas fa-home" },
    { id: "Hidden-property", title: "Hidden property", icon: "fas fa-eye-slash" },
    { id: "referrals", title: "Commission Distribution", icon: "fas fa-wallet" },
    { id: "Client", title: "Client", icon: "fas fa-user" },
    // { id: "register", title: "register", icon: "fas fa-wallet" },
    {
      id: "employees",
      title: "Employees",
      icon: "fas fa-user-tie",
      children: [
        { id: "admins", title: "Admins", icon: "fas fa-user-shield" },
        { id: "directors", title: "Directors", icon: "fas fa-user-tie" },
        { id: "executives", title: "Executives", icon: "fas fa-briefcase" },
        { id: "hr-list", title: "HR", icon: "fas fa-id-badge" },
        { id: "telecaller-list", title: "Telecallers", icon: "fas fa-headset" },
        { id: "receptionist-list", title: "Receptionists", icon: "fas fa-concierge-bell" },
        { id: "driver-list", title: "Drivers", icon: "fas fa-car" },
      ],
    },
    { id: "appointments", title: "Appointments", icon: "fas fa-calendar" },
        { id: "cab-management", title: "Cab Booking", icon: "fas fa-car" },

     { id: "requests", title: "Requests", icon: "fas fa-book" },
    { id: "system-settings", title: "System Settings", icon: "fas fa-cogs" },
    { id: "chat", title: "Chat", icon: "fas fa-comments", children: chatChildren },
    { id: "lock-screen", title: "Lock Screen", icon: "fas fa-lock" },
  ],

  admin: [
    { id: "Admin-dashboard", title: "Dashboard", icon: "fas fa-chart-pie" },
    { id: "reports", title: "Reports & Analytics", icon: "fas fa-chart-bar" },
    { id: "leads", title: "Leads Management", icon: "fas fa-users" },
    { id: "inventory", title: "Property Inventory", icon: "fas fa-home" },
        { id: "Client", title: "Client", icon: "fas fa-user" },

    {
      id: "employees",
      title: "Employees",
      icon: "fas fa-user-tie",
      children: [
        { id: "directors", title: "Directors", icon: "fas fa-user-tie" },
        { id: "executives", title: "Executives", icon: "fas fa-briefcase" },
        { id: "hr-list", title: "HR", icon: "fas fa-id-badge" },
        { id: "telecaller-list", title: "Telecallers", icon: "fas fa-headset" },
        { id: "receptionist-list", title: "Receptionists", icon: "fas fa-concierge-bell" },
        { id: "driver-list", title: "Drivers", icon: "fas fa-car" },
      ],
    },
    { id: "appointments", title: "Appointments", icon: "fas fa-calendar" },
    { id: "chat", title: "Chat", icon: "fas fa-comments", children: chatChildren },
    { id: "lock-screen", title: "Lock Screen", icon: "fas fa-lock" },
  ],
customer: [
    { id: "My-property", title: "My-property", icon: "fas fa-home"},
    { id: "My-Documents", title: "My-Documents", icon: "fas fa-book"},
    { id: "Updates", title: "Updates", icon: "fas fa-refresh"},
],
  director: [
    { id: "Director-dashboard", title: "Dashboard", icon: "fas fa-chart-pie" },
    { id: "reports", title: "Reports", icon: "fas fa-chart-bar" },
    { id: "leads", title: "Leads Management", icon: "fas fa-users" },
    { id: "inventory", title: "Property Inventory", icon: "fas fa-home" },
    { id: "My-commission", title: "My Commission", icon: "fas fa-wallet" },
        { id: "My-leads", title: "My Leads", icon: "fas fa-headset" },

    { id: "cab-bookings", title: "Cab Booking", icon: "fas fa-car" },
    {
      id: "employees",
      title: "Employees",
      icon: "fas fa-user-tie",
      children: [
        { id: "executives", title: "Executives", icon: "fas fa-briefcase" },
        { id: "telecaller-list", title: "Telecallers", icon: "fas fa-headset" },
        { id: "driver-list", title: "Drivers", icon: "fas fa-car" },
      ],
    },
    { id: "appointments", title: "Appointments", icon: "fas fa-calendar" },
    { id: "chat", title: "Chat", icon: "fas fa-comments", children: chatChildren },
    { id: "lock-screen", title: "Lock Screen", icon: "fas fa-lock" },
  ],

  executive: [
    { id: "Executive-dashboard", title: "Dashboard", icon: "fas fa-chart-pie" },
    { id: "My-leads", title: "My Leads", icon: "fas fa-users" },
    { id: "inventory", title: "Property Inventory", icon: "fas fa-home" },
    { id: "My-commission", title: "My Commission", icon: "fas fa-wallet" },
    { id: "cab-bookings", title: "Cab Booking", icon: "fas fa-car" },
    { id: "chat", title: "Chat", icon: "fas fa-comments", children: chatChildren },
    { id: "lock-screen", title: "Lock Screen", icon: "fas fa-lock" },
  ],

  telecaller: [
    { id: "Telecaller-dashboard", title: "Dashboard", icon: "fas fa-chart-pie" },
    { id: "My-leads", title: "My Leads", icon: "fas fa-headset" },
    { id: "call-outcomes", title: "Call Outcomes", icon: "fas fa-phone" },
    { id: "chat", title: "Chat", icon: "fas fa-comments", children: chatChildren },
    { id: "lock-screen", title: "Lock Screen", icon: "fas fa-lock" },
  ],

  hr: [
    { id: "dashboard", title: "HR Dashboard", icon: "fas fa-chart-pie" },
    { id: "recruitment-staffing", title: "Recruitment & Staffing", icon: "fas fa-user-plus" },
    { id: "leave-management", title: "Leave Management", icon: "fas fa-calendar-minus" },
    { id: "attendance-tracking", title: "Attendance Tracking", icon: "fas fa-user-check" },
    {
      id: "employees",
      title: "Employees",
      icon: "fas fa-users",
      children: [
        { id: "executives", title: "Executives", icon: "fas fa-briefcase" },
        { id: "telecaller-list", title: "Telecallers", icon: "fas fa-headset" },
        { id: "receptionist-list", title: "Receptionists", icon: "fas fa-concierge-bell" },
        { id: "driver-list", title: "Drivers", icon: "fas fa-car" },
      ],
    },
    { id: "hr-chat", title: "Chat", icon: "fas fa-comments", children: chatChildren },
        { id: "lock-screen", title: "Lock Screen", icon: "fas fa-lock" },
  ],

  receptionist: [
    { id: "Receptionist-dashboard", title: "Dashboard", icon: "fas fa-chart-pie" },
    { id: "walkins", title: "Walk-in Leads", icon: "fas fa-user-plus" },
    { id: "appointment-scheduler", title: "Appointment Scheduler", icon: "fas fa-calendar-check" },
    { id: "cab-bookings", title: "Cab Booking", icon: "fas fa-car" },
    { id: "chat", title: "Chat", icon: "fas fa-comments", children: chatChildren },
    { id: "lock-screen", title: "Lock Screen", icon: "fas fa-lock" },
  ],

  driver: [
    { id: "Driver-dashboard", title: "Dashboard", icon: "fas fa-chart-pie" },
    { id: "my-bookings", title: "My Cab Bookings", icon: "fas fa-car" },
    { id: "chat", title: "Chat", icon: "fas fa-comments", children: chatChildren },
    { id: "lock-screen", title: "Lock Screen", icon: "fas fa-lock" },
  ],
};
export function getUserByRole(role) {
  const users = mockData.users;
  return Object.values(users).find((u) => u.role === role) || null;
}

// -----------------------------------------------------------------------------
// Helper: currency symbol (override if needed)
// -----------------------------------------------------------------------------
export const DEFAULT_CURRENCY_SYMBOL = "₹";
