// backend/seedData.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

async function seedAll() {
  console.log("🌱 Starting complete site database seeding...");

  try {
    const getModel = (name, fallback) => {
      try {
        const m = mongoose.model(name);
        if (m) return m;
      } catch (e) {}
      if (mongoose.models && mongoose.models[name]) return mongoose.models[name];
      if (fallback) {
        try {
          delete require.cache[require.resolve(fallback)];
          return require(fallback);
        } catch (e) {}
      }
      return null;
    };

    const User = getModel("User", "./models/User.js");
    const Employee = getModel("Employee", "./models/Employee.js");
    const Appointment = getModel("Appointment", "./models/Appointment.js");
    const Cabbooking = getModel("CabBooking") || getModel("Cabbooking", "./models/Cabbooking.js");
    const Referal = getModel("Referral") || getModel("Referal", "./models/Referal.js");
    const TerminationRequest = getModel("TerminationRequest", "./models/TerminationRequest.js");
    const Calllog = getModel("CallLog") || getModel("Calllog", "./models/Calllog.js");
    const Walkin = getModel("Walkin", "./models/Walkin.js");
    const Recruitment = getModel("Recruitment", "./models/Recruitment.js");
    const Attendence = getModel("Attendance") || getModel("Attendence", "./models/Attendence.js");
    const Notification = getModel("Notification", "./models/Notification.js");
    const Message = getModel("Message", "./models/Message.js");
    const DepartmentMessage = getModel("DepartmentMessage", "./models/DepartmentMessage.js");
    const PendingProperty = getModel("PendingProperty", "./models/PendingProperty.js");
    const Plots = getModel("Plot") || getModel("Plots", "./models/Plots.js");
    const Leave = getModel("Leave", "./models/Leave.js");

    // 1. Password hashing
    const defaultPassword = "password123";
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);
    const adminPassword = await bcrypt.hash("22446688", 10);

    // Dynamic models compiled in index.js (with fallbacks if run standalone)
    const Lead = getModel("Lead") || mongoose.model("Lead", new mongoose.Schema({
      name: { type: String, required: true },
      contact: { type: String, required: true },
      email: { type: String },
      project: { type: String, required: true },
      source: { type: String, required: true },
      status: { type: String, enum: ['New', 'Contacted', 'Interested', 'Closed', 'Lost'], default: 'New' },
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      callResponse: { type: String }
    }, { timestamps: true }));

    const Property = getModel("Property") || mongoose.model("Property", new mongoose.Schema({
      property_title: { type: String, required: true },
      property_status: { type: String, default: 'Available' },
      property_synopsis: { type: String },
      approval_status: { type: String, enum: ['approve', 'reject', 'pending'], default: 'pending' },
      extent: { type: String },
      sy_nos: { type: String },
      master_plan_url: { type: String },
      owner_name: { type: String },
      owner_contact: { type: String },
      broker: { type: String },
      broker_contact: { type: String },
      collector_name: { type: String },
      collector_contact: { type: String },
      rdo_name: { type: String },
      rdo_contact: { type: String },
      latitude: { type: String },
      longitude: { type: String },
      zone: { type: String },
      accessibility: { type: String },
      google_maps: { type: String },
      google_earth: { type: String },
      surveyor: { type: String },
      surveyor_contact: { type: String },
      survey_status: { type: String },
      last_survey_date: { type: Date },
      litigation: { type: String, default: 'No' },
      permissions: { type: String, default: 'Approved' },
      advocate: { type: String },
      advocate_contact: { type: String },
      images: [{ type: String }],
      videos: [{ type: String }],
      excel_files: [{ type: String }],
      pdf_docs: [{ type: String }],
      word_docs: [{ type: String }],
      management_visibility: { type: String, default: 'All Users' }
    }, { timestamps: true }));

    const Client = getModel("Client") || mongoose.model("Client", new mongoose.Schema({
      clientName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      propertyName: { type: String },
      propertyLocation: { type: String },
      plote: { type: String },
      ventureName: { type: String },
      location: { type: String },
      plotNumber: { type: String },
      plotSize: { type: String },
      facing: { type: String },
      status: { type: String, default: 'Active' },
      vastu: { type: String },
      currentPhase: { type: Number, default: 1 },
      overview: { type: String },
      previousOwner: { type: String },
      registrationOffice: { type: String },
      registrationNumber: { type: String },
      registrationDate: { type: Date },
      plotAddress: { type: String },
      surveyNumber: { type: String },
      surveyReference: { type: String },
      legalStatus: { type: String },
      price: { type: Number, required: true },
      documents: [{ type: Object }],
      updates: [{ type: Object }],
      bannerImage: { type: String }
    }, { timestamps: true }));

    const Venture = getModel("Venture") || mongoose.model("Venture", new mongoose.Schema({
      name: { type: String, required: true },
      location: { type: String, required: true },
      registered: String,
      approvedBy: String,
      googleMapLink: String,
      brochure: String,
      layout: String,
      highlights: [String],
      units: { type: Number, required: true },
      plots: [{
        plotNumber: { type: String, required: true },
        plotLocation: String,
        plotFacing: String,
        plotVaastu: String,
        status: { type: String, enum: ['available', 'booked', 'sold'], default: 'available' },
        documents: String,
        images: [String],
        additionalDetails: String,
      }],
      createdAt: { type: Date, default: Date.now }
    }));

    // ==========================================
    // 2. SEED EMPLOYEES & USERS
    // ==========================================
    console.log("👤 Seeding Employees & Users...");

    const staffData = [
      {
        firstName: "Ravi",
        lastName: "Verma",
        gender: "Male",
        phoneNumber: "+91 98480 11221",
        dob: new Date("1985-04-12"),
        email: "admin@remap-digitalness.com",
        password: adminPassword,
        duties: "System Administrator & Operations Head",
        address: "Plot 42, Jubilee Hills, Hyderabad",
        zip: "500033",
        role: "Admin",
        userRole: "admin",
      },
      {
        firstName: "Akhilesh",
        lastName: "Sharma",
        gender: "Male",
        phoneNumber: "+91 98480 99887",
        dob: new Date("1980-01-15"),
        email: "management@remap.com",
        password: hashedDefaultPassword,
        duties: "Managing Director / Executive Board",
        address: "Road No 10, Banjara Hills, Hyderabad",
        zip: "500034",
        role: "Admin",
        userRole: "management",
      },
      {
        firstName: "Karan",
        lastName: "Kapoor",
        gender: "Male",
        phoneNumber: "+91 97001 22334",
        dob: new Date("1987-08-22"),
        email: "director@remap.com",
        password: hashedDefaultPassword,
        duties: "Sales Director & Venture Approvals",
        address: "Madhapur, Hitec City, Hyderabad",
        zip: "500081",
        role: "director",
        userRole: "director",
      },
      {
        firstName: "Karan",
        lastName: "Mehta",
        gender: "Male",
        phoneNumber: "+91 98855 33445",
        dob: new Date("1992-11-05"),
        email: "executive@remap.com",
        password: hashedDefaultPassword,
        duties: "Senior Sales Executive & Client Site Visits",
        address: "Kondapur, Hyderabad",
        zip: "500084",
        role: "Executive",
        userRole: "executive",
      },
      {
        firstName: "Sneha",
        lastName: "Reddy",
        gender: "Female",
        phoneNumber: "+91 99123 44556",
        dob: new Date("1994-06-18"),
        email: "sneha.executive@remap.com",
        password: hashedDefaultPassword,
        duties: "Executive Real Estate Consultant",
        address: "Gachibowli, Hyderabad",
        zip: "500032",
        role: "Executive",
        userRole: "executive",
      },
      {
        firstName: "Rahul",
        lastName: "Sharma",
        gender: "Male",
        phoneNumber: "+91 97034 55667",
        dob: new Date("1993-03-25"),
        email: "rahul.executive@remap.com",
        password: hashedDefaultPassword,
        duties: "Site Relationship Executive",
        address: "Miyapur, Hyderabad",
        zip: "500049",
        role: "Executive",
        userRole: "executive",
      },
      {
        firstName: "Pooja",
        lastName: "Reddy",
        gender: "Female",
        phoneNumber: "+91 96180 77889",
        dob: new Date("1996-09-14"),
        email: "telecaller@remap.com",
        password: hashedDefaultPassword,
        duties: "Senior Telecaller & Inbound Lead Qualification",
        address: "Kukatpally Housing Board, Hyderabad",
        zip: "500072",
        role: "Tellecaller",
        userRole: "telecaller",
      },
      {
        firstName: "Ananya",
        lastName: "Rao",
        gender: "Female",
        phoneNumber: "+91 98492 66778",
        dob: new Date("1997-12-01"),
        email: "ananya.telecaller@remap.com",
        password: hashedDefaultPassword,
        duties: "Telemarketing & Outbound Campaign Lead Caller",
        address: "Nizampet, Hyderabad",
        zip: "500090",
        role: "Tellecaller",
        userRole: "telecaller",
      },
      {
        firstName: "Priya",
        lastName: "Patel",
        gender: "Female",
        phoneNumber: "+91 95021 88990",
        dob: new Date("1989-07-30"),
        email: "hr@remap.com",
        password: hashedDefaultPassword,
        duties: "HR Head & Talent Acquisition",
        address: "Ameerpet, Hyderabad",
        zip: "500016",
        role: "Hr",
        userRole: "hr",
      },
      {
        firstName: "Anita",
        lastName: "Desai",
        gender: "Female",
        phoneNumber: "+91 94401 23456",
        dob: new Date("1995-02-17"),
        email: "receptionist@remap.com",
        password: hashedDefaultPassword,
        duties: "Front Desk Coordinator & Walk-in Visitor Management",
        address: "Begumpet, Hyderabad",
        zip: "500003",
        role: "Receptionist",
        userRole: "receptionist",
      },
      {
        firstName: "Rajesh",
        lastName: "Kumar",
        gender: "Male",
        phoneNumber: "+91 98495 12340",
        dob: new Date("1988-10-10"),
        email: "driver@remap.com",
        password: hashedDefaultPassword,
        duties: "Senior Site Chauffeur (Innova Crysta TS09-EA-4521)",
        address: "Attapur, Hyderabad",
        zip: "500048",
        role: "Driver",
        userRole: "driver",
      },
      {
        firstName: "Vikram",
        lastName: "Singh",
        gender: "Male",
        phoneNumber: "+91 98499 54321",
        dob: new Date("1990-05-15"),
        email: "vikram.driver@remap.com",
        password: hashedDefaultPassword,
        duties: "Site Visit Driver (Maruti Ertiga TS07-UB-7788)",
        address: "Mehdipatnam, Hyderabad",
        zip: "500028",
        role: "Driver",
        userRole: "driver",
      },
    ];

    const usersMap = {};

    for (const staff of staffData) {
      // Upsert Employee
      let emp = await Employee.findOne({ email: staff.email });
      if (!emp) {
        emp = new Employee({
          firstName: staff.firstName,
          lastName: staff.lastName,
          gender: staff.gender,
          phoneNumber: staff.phoneNumber,
          dob: staff.dob,
          email: staff.email,
          password: staff.password,
          duties: staff.duties,
          address: staff.address,
          zip: staff.zip,
          role: staff.role,
          status: "active",
          files: [],
        });
        await emp.save();
      } else {
        emp.role = staff.role;
        emp.status = "active";
        await emp.save();
      }

      // Upsert User
      let u = await User.findOne({ email: staff.email });
      if (!u) {
        u = new User({
          name: `${staff.firstName} ${staff.lastName}`,
          email: staff.email,
          password: staff.password,
          role: staff.userRole,
          employeeId: emp._id,
        });
        await u.save();
      } else {
        u.role = staff.userRole;
        u.name = `${staff.firstName} ${staff.lastName}`;
        u.employeeId = emp._id;
        await u.save();
      }

      usersMap[staff.userRole] = u;
      usersMap[staff.email] = u;
    }

    // Customer User
    let custUser = await User.findOne({ email: "customer@remap.com" });
    if (!custUser) {
      custUser = new User({
        name: "Akhilesh Reddy",
        email: "customer@remap.com",
        password: hashedDefaultPassword,
        role: "customer",
      });
      await custUser.save();
    }
    usersMap["customer"] = custUser;

    console.log(`✅ Seeded ${staffData.length + 1} Users & Employees.`);

    // ==========================================
    // 3. SEED VENTURES & PLOTS
    // ==========================================
    console.log("🏡 Seeding Ventures and Plots...");
    await Venture.deleteMany({});
    await Plots.deleteMany({});

    const venturesSeed = [
      {
        name: "Green Valley Phase 1",
        location: "Gachibowli Extension, Near Financial District, Hyderabad",
        registered: "TS RERA Reg # P02400004521",
        approvedBy: "HMDA & RERA Approved",
        googleMapLink: "https://maps.google.com/?q=17.4375,78.3826",
        brochure: "brochure_green_valley.pdf",
        layout: "layout_green_valley.jpg",
        highlights: [
          "100ft Master Plan Road Facing",
          "Grand Entrance Arch with 24x7 Security",
          "Underground Electricity & Cabling",
          "Clubhouse with Swimming Pool & Gym",
          "100% Clear Title & Vaastu Compliant"
        ],
        units: 30,
        plots: [
          { plotNumber: "101", plotLocation: "North-East Corner", plotFacing: "East", plotVaastu: "100% Vaastu", status: "sold", additionalDetails: "300 Sq. Yards Corner Plot" },
          { plotNumber: "102", plotLocation: "Main Avenue", plotFacing: "East", plotVaastu: "100% Vaastu", status: "booked", additionalDetails: "267 Sq. Yards East Facing" },
          { plotNumber: "103", plotLocation: "Central Park View", plotFacing: "North", plotVaastu: "Compliant", status: "available", additionalDetails: "200 Sq. Yards North Facing" },
          { plotNumber: "104", plotLocation: "Park Facing", plotFacing: "North", plotVaastu: "Compliant", status: "available", additionalDetails: "200 Sq. Yards Facing Children Park" },
          { plotNumber: "105", plotLocation: "Clubhouse Adjacent", plotFacing: "East", plotVaastu: "100% Vaastu", status: "booked", additionalDetails: "267 Sq. Yards Premium Location" },
          { plotNumber: "106", plotLocation: "Avenue 2", plotFacing: "West", plotVaastu: "Compliant", status: "available", additionalDetails: "220 Sq. Yards West Facing" },
          { plotNumber: "107", plotLocation: "Avenue 2", plotFacing: "West", plotVaastu: "Compliant", status: "sold", additionalDetails: "220 Sq. Yards West Facing" },
          { plotNumber: "108", plotLocation: "South Avenue", plotFacing: "South", plotVaastu: "Compliant", status: "available", additionalDetails: "250 Sq. Yards South Facing" },
          { plotNumber: "109", plotLocation: "East Boulevard", plotFacing: "East", plotVaastu: "100% Vaastu", status: "available", additionalDetails: "300 Sq. Yards Wide Road Facing" },
          { plotNumber: "110", plotLocation: "East Boulevard Corner", plotFacing: "East", plotVaastu: "100% Vaastu", status: "sold", additionalDetails: "400 Sq. Yards Commercial/Residential" },
        ]
      },
      {
        name: "Royal Palms County",
        location: "Kompally Highway, Medchal District, Hyderabad",
        registered: "TS RERA Reg # P02200008892",
        approvedBy: "HMDA Approved Layout",
        googleMapLink: "https://maps.google.com/?q=17.5458,78.4905",
        brochure: "brochure_royal_palms.pdf",
        layout: "layout_royal_palms.jpg",
        highlights: [
          "Gated Villa Community with Avenue Plantation",
          "Water Harvesting Pits & Overhead Water Tank",
          "Jogging Track & Senior Citizen Seating Plaza",
          "5 Minutes from Outer Ring Road (ORR)"
        ],
        units: 25,
        plots: [
          { plotNumber: "201", plotLocation: "Phase 1 Entrance", plotFacing: "East", plotVaastu: "100% Vaastu", status: "sold", additionalDetails: "250 Sq. Yards" },
          { plotNumber: "202", plotLocation: "Lake View", plotFacing: "North", plotVaastu: "Compliant", status: "available", additionalDetails: "220 Sq. Yards Lake Facing" },
          { plotNumber: "203", plotLocation: "Lake View", plotFacing: "North", plotVaastu: "Compliant", status: "booked", additionalDetails: "220 Sq. Yards" },
          { plotNumber: "204", plotLocation: "Avenue Road", plotFacing: "West", plotVaastu: "Compliant", status: "available", additionalDetails: "200 Sq. Yards" },
          { plotNumber: "205", plotLocation: "Corner Plot", plotFacing: "North-East", plotVaastu: "100% Vaastu", status: "available", additionalDetails: "350 Sq. Yards Corner" },
          { plotNumber: "206", plotLocation: "Central Garden", plotFacing: "East", plotVaastu: "100% Vaastu", status: "sold", additionalDetails: "267 Sq. Yards" },
        ]
      },
      {
        name: "Aerocity Prestige",
        location: "Shamshabad, Near Rajiv Gandhi International Airport, Hyderabad",
        registered: "TS RERA Reg # P02500001944",
        approvedBy: "HMDA Approved",
        googleMapLink: "https://maps.google.com/?q=17.2403,78.4294",
        brochure: "brochure_aerocity.pdf",
        layout: "layout_aerocity.jpg",
        highlights: [
          "Strategic Airport Corridor Location",
          "High ROI Potential with Rapid Infrastructure Growth",
          "60ft Wide Internal Roads with LED Streetlights",
          "Commercial Zone on Frontage"
        ],
        units: 40,
        plots: [
          { plotNumber: "301", plotLocation: "Main Road Frontage", plotFacing: "East", plotVaastu: "100% Vaastu", status: "sold", additionalDetails: "500 Sq. Yards Commercial" },
          { plotNumber: "302", plotLocation: "Main Road Frontage", plotFacing: "East", plotVaastu: "100% Vaastu", status: "booked", additionalDetails: "500 Sq. Yards Commercial" },
          { plotNumber: "303", plotLocation: "Residential Block A", plotFacing: "North", plotVaastu: "Compliant", status: "available", additionalDetails: "250 Sq. Yards" },
          { plotNumber: "304", plotLocation: "Residential Block A", plotFacing: "North", plotVaastu: "Compliant", status: "sold", additionalDetails: "250 Sq. Yards" },
          { plotNumber: "305", plotLocation: "Park View", plotFacing: "East", plotVaastu: "100% Vaastu", status: "available", additionalDetails: "200 Sq. Yards" },
          { plotNumber: "306", plotLocation: "Block B Avenue", plotFacing: "West", plotVaastu: "Compliant", status: "available", additionalDetails: "200 Sq. Yards" },
        ]
      },
      {
        name: "Sunshine Meadows",
        location: "Miyapur-Bachupally Highway, Hyderabad",
        registered: "DTCP Reg # 14/2024",
        approvedBy: "DTCP Approved",
        googleMapLink: "https://maps.google.com/?q=17.4960,78.3915",
        brochure: "brochure_sunshine.pdf",
        layout: "layout_sunshine.jpg",
        highlights: [
          "Surrounded by Top International Schools & IT Hubs",
          "Complete BT Roads & Landscaped Parks",
          "Ready for Immediate House Construction"
        ],
        units: 20,
        plots: [
          { plotNumber: "401", plotLocation: "Entrance Sector", plotFacing: "East", plotVaastu: "100% Vaastu", status: "sold", additionalDetails: "180 Sq. Yards" },
          { plotNumber: "402", plotLocation: "Sector 1", plotFacing: "East", plotVaastu: "100% Vaastu", status: "available", additionalDetails: "180 Sq. Yards" },
          { plotNumber: "403", plotLocation: "Sector 2 Corner", plotFacing: "North", plotVaastu: "Compliant", status: "booked", additionalDetails: "240 Sq. Yards" },
          { plotNumber: "404", plotLocation: "Sector 2", plotFacing: "West", plotVaastu: "Compliant", status: "available", additionalDetails: "167 Sq. Yards" },
        ]
      }
    ];

    const savedVentures = [];
    for (const vData of venturesSeed) {
      const v = new Venture(vData);
      const savedV = await v.save();
      savedVentures.push(savedV);

      // Also seed into standalone Plots collection for backward compatibility
      for (const p of vData.plots) {
        const plotDoc = new Plots({
          plotNumber: p.plotNumber,
          plotLocation: p.plotLocation,
          plotFacing: p.plotFacing,
          plotVaastu: p.plotVaastu,
          ventureId: savedV._id,
          status: p.status,
          images: [],
          documents: { filename: "plot_doc.pdf", path: "uploads/plot_doc.pdf", mimetype: "application/pdf" },
        });
        await plotDoc.save();
      }
    }
    console.log(`✅ Seeded ${savedVentures.length} Ventures with full plot rosters.`);

    // ==========================================
    // 4. SEED PROPERTIES (Approved, Pending & Hidden)
    // ==========================================
    console.log("🏢 Seeding Properties & Pending Properties...");
    await Property.deleteMany({});
    await PendingProperty.deleteMany({});

    const propertiesSeed = [
      {
        property_title: "Green Valley Prime Acreage",
        property_status: "Available",
        property_synopsis: "Prime 25-acre contiguous land parcel earmarked for premium residential plotting and villa projects.",
        approval_status: "approve",
        extent: "25 Acres 14 Guntas",
        sy_nos: "142/A, 142/B, 143/1",
        master_plan_url: "/uploads/master_plan_gachibowli.pdf",
        owner_name: "Chandra Mohan Reddy",
        owner_contact: "+91 98490 55112",
        broker: "Sri Sai Estates",
        broker_contact: "+91 98480 33221",
        collector_name: "Hyderabad District Collector",
        collector_contact: "040-23235642",
        rdo_name: "Rajendra Nagar RDO",
        rdo_contact: "040-24018899",
        latitude: "17.4375",
        longitude: "78.3826",
        zone: "Residential Growth Corridor (R-1)",
        accessibility: "100ft Master Plan Road Access",
        google_maps: "https://maps.google.com/?q=17.4375,78.3826",
        google_earth: "",
        surveyor: "K. Murali Mohan (Govt Licensed)",
        surveyor_contact: "+91 94401 99882",
        survey_status: "Demarcation & D-GPS Survey Completed",
        last_survey_date: new Date("2024-11-15"),
        litigation: "No",
        permissions: "HMDA In-Principle Approved",
        advocate: "Adv. K. Sudhakar Rao, High Court",
        advocate_contact: "+91 98492 44331",
        images: ["/uploads/prop_greenvalley_1.jpg", "/uploads/prop_greenvalley_2.jpg"],
        management_visibility: "All Users"
      },
      {
        property_title: "Royal Palms Highway Parcel",
        property_status: "Available",
        property_synopsis: "High-value highway commercial and plotted venture land situated on Medchal Highway corridor.",
        approval_status: "approve",
        extent: "18 Acres 20 Guntas",
        sy_nos: "88/1, 88/2, 89",
        master_plan_url: "/uploads/master_plan_medchal.pdf",
        owner_name: "G. V. Narasimha Rao",
        owner_contact: "+91 99890 66223",
        broker: "Direct Ownership",
        broker_contact: "+91 99890 66223",
        collector_name: "Medchal-Malkajgiri Collector",
        collector_contact: "08418-222333",
        rdo_name: "Malkajgiri RDO",
        rdo_contact: "08418-222444",
        latitude: "17.5458",
        longitude: "78.4905",
        zone: "Multiple Use Commercial / High Density Residential",
        accessibility: "National Highway 44 Direct Access",
        google_maps: "https://maps.google.com/?q=17.5458,78.4905",
        google_earth: "",
        surveyor: "S. Venkatesh",
        surveyor_contact: "+91 98485 55441",
        survey_status: "Boundary Fencing and Survey Completed",
        last_survey_date: new Date("2024-12-01"),
        litigation: "No",
        permissions: "Clear Title / Form-1 Certified",
        advocate: "Adv. V. R. Krishna, Legal Associate",
        advocate_contact: "+91 98491 12345",
        images: ["/uploads/prop_royalpalms_1.jpg"],
        management_visibility: "All Users"
      },
      {
        property_title: "Aerocity Airport Corridor Lands",
        property_status: "Under Development",
        property_synopsis: "Strategic logistic & villa enclave land in Shamshabad airport vicinity.",
        approval_status: "approve",
        extent: "32 Acres",
        sy_nos: "210/3, 210/4, 211",
        master_plan_url: "/uploads/master_plan_shamshabad.pdf",
        owner_name: "M. Ramakrishna Raju",
        owner_contact: "+91 97010 33441",
        broker: "Nexus Realties",
        broker_contact: "+91 98490 99001",
        collector_name: "Ranga Reddy Collector",
        collector_contact: "040-23237700",
        rdo_name: "Rajendranagar RDO",
        rdo_contact: "040-24017722",
        latitude: "17.2403",
        longitude: "78.4294",
        zone: "R-2 Medium Density Residential",
        accessibility: "60ft Approach from Outer Ring Road",
        google_maps: "https://maps.google.com/?q=17.2403,78.4294",
        surveyor: "A. Srikanth",
        surveyor_contact: "+91 99120 44551",
        survey_status: "Completed",
        last_survey_date: new Date("2024-10-20"),
        litigation: "No",
        permissions: "Approved",
        advocate: "Adv. B. Vijay Kumar",
        advocate_contact: "+91 98488 77665",
        images: [],
        management_visibility: "All Users"
      },
      {
        property_title: "Cyber Hills Prime Reserve (Exclusive Holding)",
        property_status: "Hold",
        property_synopsis: "Confidential 50-acre prime institutional land tract reserved for ultra-luxury gated township.",
        approval_status: "approve",
        extent: "50 Acres",
        sy_nos: "330/B, 331/A, 332",
        master_plan_url: "/uploads/master_plan_cyberhills.pdf",
        owner_name: "Confidential Holding Trust",
        owner_contact: "+91 98480 00001",
        collector_name: "Hyderabad District Collector",
        collector_contact: "040-23235642",
        rdo_name: "Shaikpet RDO",
        rdo_contact: "040-23549911",
        latitude: "17.4400",
        longitude: "78.3600",
        zone: "Special Development Zone (SDZ)",
        accessibility: "120ft Radial Road",
        google_maps: "https://maps.google.com/?q=17.4400,78.3600",
        surveyor: "Senior Govt Surveyor Team",
        surveyor_contact: "+91 94401 11223",
        survey_status: "Total Station Complete",
        last_survey_date: new Date("2025-01-10"),
        litigation: "No",
        permissions: "Board Reserved",
        images: [],
        management_visibility: "Management Only" // Hidden property!
      }
    ];

    for (const p of propertiesSeed) {
      const propDoc = new Property(p);
      await propDoc.save();
    }

    // Pending Property for approval workflow
    const pendingPropsSeed = [
      {
        property_title: "Oakridge Highland Acres",
        property_status: "Pending Evaluation",
        property_synopsis: "14-acre scenic agricultural-to-residential land conversion pending final board clearance.",
        extent: "14 Acres",
        sy_nos: "55/1, 55/2",
        owner_name: "Satyanarayana Murthy",
        owner_contact: "+91 98850 12345",
        collector_name: "Sangareddy Collector",
        collector_contact: "08455-276555",
        rdo_name: "Sangareddy RDO",
        rdo_contact: "08455-276666",
        latitude: "17.6200",
        longitude: "78.0800",
        zone: "Peri-Urban Zone",
        surveyor: "P. Ravinder Reddy",
        surveyor_contact: "+91 97000 88776",
        survey_status: "Preliminary Survey Submitted",
        last_survey_date: new Date("2025-01-05"),
        litigation: "No",
        permissions: "In Progress",
        images: []
      },
      {
        property_title: "Sovereign Valley Meadows Phase 2",
        property_status: "Awaiting Verification",
        property_synopsis: "10-acre extension adjoining existing successful plotted development.",
        extent: "10 Acres",
        sy_nos: "102/3",
        owner_name: "T. Venkat Rao",
        owner_contact: "+91 99480 33445",
        collector_name: "Yadadri Bhuvanagiri Collector",
        collector_contact: "08685-288222",
        rdo_name: "Bhongir RDO",
        rdo_contact: "08685-288333",
        latitude: "17.5100",
        longitude: "78.8900",
        zone: "Residential R-1",
        surveyor: "D. Sridhar",
        surveyor_contact: "+91 98492 55667",
        survey_status: "Completed",
        last_survey_date: new Date("2024-12-28"),
        litigation: "No",
        permissions: "Gram Panchayat NOC Received",
        images: []
      }
    ];

    for (const pp of pendingPropsSeed) {
      const pDoc = new PendingProperty(pp);
      await pDoc.save();
    }
    console.log("✅ Seeded Properties and Pending Properties.");

    // ==========================================
    // 5. SEED CLIENTS
    // ==========================================
    console.log("💼 Seeding Clients...");
    await Client.deleteMany({});

    const clientsSeed = [
      {
        clientName: "Akhilesh Reddy",
        email: "customer@remap.com",
        password: hashedDefaultPassword,
        propertyName: "Green Valley Phase 1",
        propertyLocation: "Gachibowli Extension, Hyderabad",
        ventureName: "Green Valley Phase 1",
        location: "Gachibowli Extension",
        plotNumber: "105",
        plotSize: "267 Sq.Yards",
        facing: "East",
        status: "Active",
        vastu: "100% Vaastu Compliant",
        currentPhase: 3,
        overview: "Premium East-facing villa plot booked. Demarcation completed and registration scheduled.",
        previousOwner: "Chandra Mohan Reddy",
        registrationOffice: "Serilingampally Sub-Registrar Office",
        registrationNumber: "REG-2025-TS-8849",
        registrationDate: new Date("2025-02-15"),
        plotAddress: "Plot # 105, Avenue 1, Green Valley Phase 1, Gachibowli",
        surveyNumber: "142/A",
        surveyReference: "TS/SR/2024/0992",
        legalStatus: "Clear Title / Encumbrance Free",
        price: 4250000,
        documents: [
          { type: "Allotment Letter", name: "Green_Valley_Plot_105_Allotment.pdf", fileName: "allotment_105.pdf", originalName: "Allotment_Letter.pdf", date: new Date() },
          { type: "Payment Receipt", name: "Booking_Advance_Receipt_30pct.pdf", fileName: "receipt_30pct.pdf", originalName: "Receipt_30pct.pdf", date: new Date() },
          { type: "Layout Demarcation", name: "Plot_105_Survey_Demarcation_Map.pdf", fileName: "demarcation_105.pdf", originalName: "Demarcation.pdf", date: new Date() }
        ],
        updates: [
          { message: "Booking confirmed and Plot 105 successfully allocated.", date: new Date("2025-01-10") },
          { message: "Boundary corner stones laid and verified by site surveyor.", date: new Date("2025-01-20") },
          { message: "Underground electrical cabling & water supply pipeline laid near Avenue 1.", date: new Date("2025-02-01") }
        ],
        bannerImage: "/uploads/client_banner_1.jpg"
      },
      {
        clientName: "Dr. Sandeep Varma",
        email: "sandeep.varma@example.com",
        password: hashedDefaultPassword,
        propertyName: "Royal Palms County",
        propertyLocation: "Kompally Highway",
        ventureName: "Royal Palms County",
        location: "Kompally",
        plotNumber: "201",
        plotSize: "250 Sq.Yards",
        facing: "East",
        status: "Active",
        vastu: "East Facing",
        currentPhase: 4,
        overview: "Doctor residential villa booking with full payment clearance in progress.",
        previousOwner: "G. V. Narasimha Rao",
        registrationOffice: "Medchal Sub-Registrar Office",
        registrationNumber: "REG-2025-MD-4401",
        registrationDate: new Date("2025-01-18"),
        plotAddress: "Plot # 201, Royal Palms County, Kompally",
        surveyNumber: "88/1",
        surveyReference: "MD/SR/2024/1102",
        legalStatus: "Clear Title",
        price: 3750000,
        documents: [
          { type: "Sale Agreement", name: "RoyalPalms_Plot_201_Agreement.pdf", fileName: "sale_agreement_201.pdf", originalName: "Agreement.pdf", date: new Date() }
        ],
        updates: [
          { message: "Sale deed draft prepared and sent for buyer legal review.", date: new Date("2025-01-25") }
        ]
      },
      {
        clientName: "Sunita Sharma",
        email: "sunita.sharma@example.com",
        password: hashedDefaultPassword,
        propertyName: "Aerocity Prestige",
        propertyLocation: "Shamshabad Airport Corridor",
        ventureName: "Aerocity Prestige",
        location: "Shamshabad",
        plotNumber: "301",
        plotSize: "500 Sq.Yards",
        facing: "East",
        status: "Completed",
        vastu: "100% Vaastu",
        currentPhase: 5,
        overview: "Commercial frontage plot fully registered and mutation certificate issued.",
        registrationOffice: "Shamshabad Sub-Registrar Office",
        registrationNumber: "REG-2024-RR-1944",
        registrationDate: new Date("2024-11-20"),
        plotAddress: "Commercial Plot # 301, Aerocity Prestige, Main Highway",
        surveyNumber: "210/3",
        legalStatus: "Registered Title Deed Handed Over",
        price: 8500000,
        documents: [
          { type: "Registered Sale Deed", name: "Registered_Deed_Plot301.pdf", fileName: "deed_301.pdf", originalName: "Deed.pdf", date: new Date() },
          { type: "Mutation Certificate", name: "Revenue_Mutation_Passbook.pdf", fileName: "mutation_301.pdf", originalName: "Passbook.pdf", date: new Date() }
        ],
        updates: [
          { message: "Registration and mutation process 100% completed.", date: new Date("2024-12-05") }
        ]
      }
    ];

    for (const c of clientsSeed) {
      const clientDoc = new Client(c);
      await clientDoc.save();
    }
    console.log(`✅ Seeded ${clientsSeed.length} Clients.`);

    // ==========================================
    // 6. SEED LEADS & CALL LOGS
    // ==========================================
    console.log("🎯 Seeding Leads & Call Logs...");
    await Lead.deleteMany({});
    await Calllog.deleteMany({});

    const execUser = usersMap["executive"] || custUser;
    const adminUser = usersMap["admin"] || custUser;
    const telecallerUser = usersMap["telecaller"] || custUser;

    const leadsSeed = [
      {
        name: "Vikramaditya Rao",
        contact: "+91 98851 12345",
        email: "vikram.rao@corporate.com",
        project: "Green Valley Phase 1",
        source: "Website",
        status: "Interested",
        assignedTo: execUser._id,
        createdBy: adminUser._id,
        callResponse: "Client interested in 300 sq.yd corner plot. Site visit requested."
      },
      {
        name: "Harish Patel",
        contact: "+91 97011 23456",
        email: "harish.patel@gmail.com",
        project: "Royal Palms County",
        source: "Google Campaign",
        status: "Contacted",
        assignedTo: telecallerUser._id,
        createdBy: adminUser._id,
        callResponse: "Spoke regarding price per sq.yd. Sent brochure via WhatsApp."
      },
      {
        name: "Sowmya Krishnan",
        contact: "+91 99492 34567",
        email: "sowmya.k@outlook.com",
        project: "Aerocity Prestige",
        source: "Facebook Ads",
        status: "New",
        assignedTo: telecallerUser._id,
        createdBy: adminUser._id,
        callResponse: "Fresh lead received today. Scheduled for morning follow-up."
      },
      {
        name: "Naveen Reddy",
        contact: "+91 98480 45678",
        email: "naveen.reddy@techfirm.in",
        project: "Green Valley Phase 1",
        source: "Referral",
        status: "Closed",
        assignedTo: execUser._id,
        createdBy: adminUser._id,
        callResponse: "Deal closed for Plot 102. Advance payment received."
      },
      {
        name: "Manoj Kumar",
        contact: "+91 96180 56789",
        email: "manoj.k@gmail.com",
        project: "Sunshine Meadows",
        source: "Walk-in",
        status: "Lost",
        assignedTo: execUser._id,
        createdBy: adminUser._id,
        callResponse: "Budget did not match current venture pricing."
      },
      {
        name: "Kavita Rao",
        contact: "+91 98855 67890",
        email: "kavita.rao@fintech.co",
        project: "Royal Palms County",
        source: "Referral",
        status: "Interested",
        assignedTo: execUser._id,
        createdBy: adminUser._id,
        callResponse: "Requires site cab visit on Saturday 11 AM."
      },
      {
        name: "Arjun Verma",
        contact: "+91 97033 78901",
        email: "arjun.v@investments.com",
        project: "Aerocity Prestige",
        source: "Website",
        status: "Contacted",
        assignedTo: telecallerUser._id,
        createdBy: adminUser._id,
        callResponse: "Requested airport master plan and commercial feasibility report."
      }
    ];

    const savedLeads = [];
    for (const l of leadsSeed) {
      const lDoc = new Lead(l);
      const savedL = await lDoc.save();
      savedLeads.push(savedL);

      // Create CallLog for contacted/interested/closed leads
      if (l.status !== "New") {
        const callLog = new Calllog({
          leadId: savedL._id,
          userId: telecallerUser._id,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000 * 24)),
          duration: Math.floor(Math.random() * 300) + 60,
          notes: l.callResponse,
        });
        await callLog.save();
      }
    }
    console.log(`✅ Seeded ${savedLeads.length} Leads & Call Logs.`);

    // ==========================================
    // 7. SEED APPOINTMENTS & WALKINS
    // ==========================================
    console.log("📅 Seeding Appointments & Walk-ins...");
    await Appointment.deleteMany({});
    await Walkin.deleteMany({});

    const todayStr = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    const dayAfter = new Date(Date.now() + 172800000).toISOString().split("T")[0];

    const appointmentsSeed = [
      {
        client: "Vikramaditya Rao",
        date: todayStr,
        time: "11:30",
        assignedTo: execUser._id.toString(),
        executiveName: "Karan Mehta",
        property: "Green Valley Phase 1",
        status: "Scheduled",
        notes: "Client visiting site with family for Plot 103 review.",
        createdBy: adminUser._id
      },
      {
        client: "Dr. Sandeep Varma",
        date: todayStr,
        time: "15:00",
        assignedTo: execUser._id.toString(),
        executiveName: "Karan Mehta",
        property: "Royal Palms County",
        status: "Completed",
        notes: "Document verification and agreement terms finalised.",
        createdBy: adminUser._id
      },
      {
        client: "Kavita Rao",
        date: tomorrow,
        time: "10:30",
        assignedTo: execUser._id.toString(),
        executiveName: "Sneha Reddy",
        property: "Royal Palms County",
        status: "Scheduled",
        notes: "Cab pick-up scheduled from Jubilee Hills.",
        createdBy: adminUser._id
      },
      {
        client: "Harish Patel",
        date: dayAfter,
        time: "14:00",
        assignedTo: execUser._id.toString(),
        executiveName: "Rahul Sharma",
        property: "Sunshine Meadows",
        status: "Scheduled",
        notes: "Discussion on plot installment plan.",
        createdBy: adminUser._id
      }
    ];

    for (const a of appointmentsSeed) {
      const apptDoc = new Appointment(a);
      await apptDoc.save();
    }

    const walkinsSeed = [
      {
        name: "Mahesh Goud",
        phone: "+91 98481 22334",
        purpose: "Direct inquiry for Gachibowli open plots",
        status: "Visited",
        notes: "Explained Green Valley layout. Handed over physical brochure.",
        assigned: "Anita Desai"
      },
      {
        name: "Deepa Chandran",
        phone: "+91 97002 33445",
        purpose: "Document verification and RERA clearance check",
        status: "Converted",
        notes: "Introduced to Executive Karan Mehta. Booked site tour.",
        assigned: "Anita Desai"
      },
      {
        name: "Rajender Prasad",
        phone: "+91 99881 44556",
        purpose: "Inquiry for commercial roadside land",
        status: "Visited",
        notes: "Interested in Aerocity frontage plots. Follow-up planned.",
        assigned: "Anita Desai"
      },
      {
        name: "Pooja Hegde",
        phone: "+91 96182 55667",
        purpose: "Payment receipt collection & mutation query",
        status: "Converted",
        notes: "Escorted to Accounts department.",
        assigned: "Anita Desai"
      }
    ];

    for (const w of walkinsSeed) {
      const wDoc = new Walkin(w);
      await wDoc.save();
    }
    console.log("✅ Seeded Appointments & Walk-ins.");

    // ==========================================
    // 8. SEED CAB BOOKINGS & DRIVERS
    // ==========================================
    console.log("🚖 Seeding Cab Bookings...");
    await Cabbooking.deleteMany({});

    const driverUser = usersMap["driver"] || custUser;

    const cabBookingsSeed = [
      {
        executive: "Karan Mehta",
        pickup: "Corporate HQ, Hitec City",
        destination: "Green Valley Phase 1, Gachibowli",
        time: "10:30 AM",
        date: todayStr,
        purpose: "Client site tour with Vikramaditya Rao",
        status: "In Progress",
        driver: driverUser._id
      },
      {
        executive: "Sneha Reddy",
        pickup: "Road No 12, Banjara Hills",
        destination: "Royal Palms County, Kompally",
        time: "02:00 PM",
        date: todayStr,
        purpose: "Inspection with Dr. Sandeep Varma family",
        status: "Pending",
        driver: driverUser._id
      },
      {
        executive: "Rahul Sharma",
        pickup: "Secunderabad Station",
        destination: "Aerocity Prestige, Shamshabad",
        time: "09:00 AM",
        date: todayStr,
        purpose: "Outstation NRI client site visit",
        status: "Completed",
        driver: driverUser._id
      }
    ];

    for (const cb of cabBookingsSeed) {
      const cbDoc = new Cabbooking(cb);
      await cbDoc.save();
    }
    console.log("✅ Seeded Cab Bookings.");

    // ==========================================
    // 9. SEED REFERRALS & COMMISSIONS
    // ==========================================
    console.log("💰 Seeding Referrals & Commissions...");
    await Referal.deleteMany({});

    const referralsSeed = [
      {
        referrer: "Karan Mehta",
        referred: "Naveen Reddy",
        phone: "+91 98480 45678",
        relation: "Client Referral",
        status: "Booked",
        date: new Date(),
        reward: "Paid",
        notes: "Booked Plot 102 in Green Valley Phase 1.",
        director: "Karan Kapoor",
        executive: "Karan Mehta",
        venture: "Green Valley Phase 1",
        originalPrice: 4500000,
        commissionPct: 2.5,
        commissionAmt: 112500
      },
      {
        referrer: "Dr. Sandeep Varma",
        referred: "Arjun Verma",
        phone: "+91 97033 78901",
        relation: "Family",
        status: "Booked",
        date: new Date(),
        reward: "Approved",
        notes: "Booked Plot 201 in Royal Palms County.",
        director: "Karan Kapoor",
        executive: "Sneha Reddy",
        venture: "Royal Palms County",
        originalPrice: 3750000,
        commissionPct: 2.0,
        commissionAmt: 75000
      },
      {
        referrer: "Pooja Reddy",
        referred: "Srinivas Rao",
        phone: "+91 98492 11002",
        relation: "Past Client",
        status: "Contacted",
        date: new Date(),
        reward: "Pending",
        notes: "Interested in 500 sq.yd commercial plot.",
        director: "Karan Kapoor",
        executive: "Karan Mehta",
        venture: "Aerocity Prestige",
        originalPrice: 8500000,
        commissionPct: 2.0,
        commissionAmt: 170000
      },
      {
        referrer: "Anita Desai",
        referred: "Manish Gupta",
        phone: "+91 99120 77665",
        relation: "Front Desk Referral",
        status: "New",
        date: new Date(),
        reward: "Pending",
        notes: "Looking for budget plot under 30 Lakhs.",
        director: "Karan Kapoor",
        executive: "Rahul Sharma",
        venture: "Sunshine Meadows",
        originalPrice: 3200000,
        commissionPct: 3.0,
        commissionAmt: 96000
      }
    ];

    for (const r of referralsSeed) {
      const rDoc = new Referal(r);
      await rDoc.save();
    }
    console.log("✅ Seeded Referrals & Commissions.");

    // ==========================================
    // 10. SEED ATTENDANCE (LAST 7 DAYS)
    // ==========================================
    console.log("⏱️ Seeding Staff Attendance...");
    await Attendence.deleteMany({});

    const allUsers = Object.values(usersMap);
    const now = new Date();

    // Generate records for each day of the current week (Sun - Sat)
    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const recordDate = new Date(now.getTime() - dayOffset * 86400000);
      for (const u of allUsers) {
        if (!u._id) continue;
        const loginHour = 9;
        const loginMin = Math.floor(Math.random() * 25);
        const loginTime = new Date(recordDate);
        loginTime.setHours(loginHour, loginMin, 0, 0);

        const logoutTime = new Date(recordDate);
        logoutTime.setHours(18, Math.floor(Math.random() * 30), 0, 0);

        const att = new Attendence({
          userId: u._id,
          loginTime: loginTime,
          logoutTime: logoutTime,
        });
        await att.save();
      }
    }
    console.log("✅ Seeded Attendance history across the week.");

    // ==========================================
    // 11. SEED LEAVES, RECRUITMENT & TERMINATIONS
    // ==========================================
    console.log("📝 Seeding Leaves, Recruitment & Terminations...");
    await Leave.deleteMany({});
    await Recruitment.deleteMany({});
    await TerminationRequest.deleteMany({});

    const leavesSeed = [
      {
        name: "Karan Mehta",
        department: "Sales & Site Operations",
        type: "Casual Leave",
        dates: "Oct 14 - Oct 15",
        status: "Approved"
      },
      {
        name: "Pooja Reddy",
        department: "Telecalling",
        type: "Sick Leave",
        dates: "Oct 18 - Oct 19",
        status: "Pending"
      },
      {
        name: "Rajesh Kumar",
        department: "Logistics & Transport",
        type: "Personal Leave",
        dates: "Oct 22 - Oct 23",
        status: "Pending"
      },
      {
        name: "Rahul Sharma",
        department: "Sales",
        type: "Paid Leave",
        dates: "Oct 05 - Oct 07",
        status: "Rejected"
      }
    ];

    for (const lv of leavesSeed) {
      const lvDoc = new Leave(lv);
      await lvDoc.save();
    }

    const recruitmentsSeed = [
      {
        name: "Suresh Konduru",
        position: "Senior Property Consultant",
        contact: "+91 98480 88991",
        status: "Interview Scheduled"
      },
      {
        name: "Meenakshi Sundaram",
        position: "Telecalling Specialist",
        contact: "+91 97001 77662",
        status: "Pending"
      },
      {
        name: "Kishore Babu",
        position: "Site Civil Engineer",
        contact: "+91 99123 66554",
        status: "Hired"
      },
      {
        name: "Swathi Pillai",
        position: "Front Desk Executive",
        contact: "+91 95022 55443",
        status: "Interview Scheduled"
      }
    ];

    for (const rec of recruitmentsSeed) {
      const recDoc = new Recruitment(rec);
      await recDoc.save();
    }

    // Termination Request example
    const driverEmp = await Employee.findOne({ email: "vikram.driver@remap.com" });
    if (driverEmp) {
      const termReq = new TerminationRequest({
        userId: driverEmp._id,
        status: "pending",
        reason: "Relocating to another city at the end of the month.",
        requestedBy: adminUser._id
      });
      await termReq.save();
    }
    console.log("✅ Seeded Leaves, Recruitments & Terminations.");

    // ==========================================
    // 12. SEED MESSAGES & NOTIFICATIONS
    // ==========================================
    console.log("💬 Seeding Messages & Notifications...");
    await Message.deleteMany({});
    await DepartmentMessage.deleteMany({});
    await Notification.deleteMany({});

    const deptMessagesSeed = [
      {
        departmentId: "sales",
        senderId: execUser._id.toString(),
        senderName: "Karan Mehta",
        senderRole: "Executive",
        text: "Green Valley Phase 1 Plot 102 closed today with advance token! Kudos team.",
        time: "11:45 AM",
        timestamp: new Date()
      },
      {
        departmentId: "sales",
        senderId: (usersMap["director"] || adminUser)._id.toString(),
        senderName: "Karan Kapoor",
        senderRole: "Director",
        text: "Excellent work Karan! Let's ensure all registration papers are submitted to the legal team.",
        time: "11:50 AM",
        timestamp: new Date()
      },
      {
        departmentId: "general",
        senderId: adminUser._id.toString(),
        senderName: "Ravi Verma",
        senderRole: "Admin",
        text: "All staff: Please mark your attendance before 9:30 AM daily through the portal.",
        time: "09:00 AM",
        timestamp: new Date()
      },
      {
        departmentId: "hr",
        senderId: (usersMap["hr"] || adminUser)._id.toString(),
        senderName: "Priya Patel",
        senderRole: "HR",
        text: "Interviews for Senior Property Consultants are scheduled this Thursday at 2:00 PM.",
        time: "02:15 PM",
        timestamp: new Date()
      }
    ];

    for (const dm of deptMessagesSeed) {
      const dmDoc = new DepartmentMessage(dm);
      await dmDoc.save();
    }

    const notificationsSeed = [
      {
        user_id: adminUser._id,
        target_id: "Green Valley Phase 1",
        message: "New booking registered for Plot 102 by Karan Mehta.",
        action_type: "property_booking",
        is_read: false
      },
      {
        user_id: execUser._id,
        target_id: "Vikramaditya Rao",
        message: "New high-priority lead assigned to you by Admin Ravi Verma.",
        action_type: "lead_assigned",
        is_read: false
      },
      {
        user_id: (usersMap["driver"] || adminUser)._id,
        target_id: "Site Visit Trip",
        message: "New cab trip assigned from Corporate HQ to Green Valley Phase 1.",
        action_type: "cab_booking",
        is_read: false
      },
      {
        user_id: (usersMap["management"] || adminUser)._id,
        target_id: "Cyber Hills Prime Reserve",
        message: "Monthly valuation report updated for exclusive holdings.",
        action_type: "report_update",
        is_read: false
      }
    ];

    for (const notif of notificationsSeed) {
      const nDoc = new Notification(notif);
      await nDoc.save();
    }
    console.log("✅ Seeded Chat Messages and System Notifications.");

    console.log("🎉 ALL MONGODB COLLECTIONS HAVE BEEN COMPLETELY AND RICHLY SEEDED!");
    return { success: true, message: "Site fully seeded with rich interconnected data." };

  } catch (err) {
    console.error("❌ Seeding Error:", err);
    throw err;
  }
}

module.exports = seedAll;
