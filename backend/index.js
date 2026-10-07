// server.js - Real Estate CRM Backend
// Reloaded: 2026-10-07
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const multer = require("multer");
const path = require('path');
const fs = require('fs');
const PendingProperty = require('./models/PendingProperty.js')
const Employee = require("./models/Employee.js"); 
const Appointment = require("./models/Appointment.js");
const Cabbooking = require("./models/Cabbooking.js");
const Referal = require("./models/Referal.js");
const TerminationRequest = require("./models/TerminationRequest.js");
const Calllog = require("./models/Calllog.js");
const Walkin = require("./models/Walkin.js");
const Recruitment = require("./models/Recruitment.js");
const Attendence = require("./models/Attendence.js");
const Notification = require('./models/Notification.js');
const Message = require("./models/Message.js");
const DepartmentMessage = require("./models/DepartmentMessage.js");
const Plots = require("./models/Plots.js");
const Leave = require("./models/Leave.js");
const seedAll = require("./seedData.js");

// Setup
dotenv.config();
const app = express();

const allowedOrigins = [
  "https://remap123.netlify.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5000"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (mobile, curl, server-to-server)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, "");
    if (
      allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith(".netlify.app") ||
      cleanOrigin.endsWith(".onrender.com") ||
      cleanOrigin.includes("localhost")
    ) {
      return callback(null, true);
    }
    // Fallback: allow origin
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"]
};
app.use(cors(corsOptions));

// Explicit preflight and CORS header fallback for proxies and cloud environments
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "https://remap123.netlify.app");
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve uploaded files

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


// DB Connection
const seedDefaultAdmin = async () => {
  try {
    const adminEmail = "admin@remap-digitalness.com";
    const hashedPassword = await bcrypt.hash("22446688", 10);
    const existing = await User.findOne({ email: adminEmail });

    if (!existing) {
      const admin = new User({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      await admin.save();
      console.log("✅ Seeded default admin account: admin@remap-digitalness.com");
    } else {
      existing.password = hashedPassword;
      existing.role = "admin";
      if (!existing.name) existing.name = "Admin";
      await existing.save();
      console.log("✅ Verified and updated admin credentials for: admin@remap-digitalness.com");
    }
  } catch (err) {
    console.error("⚠️ Failed to seed default admin:", err.message);
  }
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedDefaultAdmin();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Endpoint to manually trigger database seeding anytime
app.all("/api/seed-all", async (req, res) => {
  try {
    delete require.cache[require.resolve("./seedData.js")];
    const freshSeed = require("./seedData.js");
    const result = await freshSeed();
    res.json({ success: true, result });
  } catch (err) {
    console.error("Seed-all route error:", err);
    res.json({ success: false, error: err.message, stack: err.stack });
  }
});

// Register
app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, name: user.name, role: user.role },
      "BANNU9",
      { expiresIn: "1d" }
    );

    let clientId = undefined;
    const clientDoc = await Client.findOne({ email: user.email });
    if (clientDoc) {
      clientId = clientDoc._id;
    }

    res
      .status(200)
      .json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, employeeId: user.employeeId, clientId },
      });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});
app.post("/api/employee/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Find the employee by email in the Employee collection
        const employee = await Employee.findOne({ email });

        // Check if employee exists
        if (!employee) {
            return res.status(400).json({ message: "Invalid credentials (employee not found)" });
        }

        // 2. Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, employee.password);
        
        // Check if passwords match
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials (password mismatch)" });
        }

        // 3. Generate a JWT token for the employee
        // Note: You might want to use a different secret or extend the payload if necessary.
        const token = jwt.sign(
            { id: employee._id, name: employee.firstName + ' ' + employee.lastName, role: employee.role },
            "BANNU9_EMPLOYEE", // ⚠️ It's best practice to use a different secret key for different user types
            { expiresIn: "1d" }
        );

        // 4. Send back the token and employee data
        res
            .status(200)
            .json({
                token,
                user: { 
                    _id: employee._id, 
                    name: employee.firstName + ' ' + employee.lastName, 
                    email: employee.email, 
                    role: employee.role 
                },
            });
            
    } catch (err) {
        console.error("❌ Employee Login Error:", err.message);
        res.status(500).json({ message: "Server error during employee login" });
    }
});
// Protected route example
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.name}, your role is ${req.user.role}`,
  });
});
app.post("/api/validate-token", (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
});
// Auth Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
}
// ✅ 1. Create Lead

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  project: { type: String, required: true },
  source: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['New', 'Contacted', 'Interested', 'Closed', 'Lost'], 
    default: 'New' 
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const leadStatusHistorySchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  oldStatus: { type: String },
  newStatus: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const leadAssignmentHistorySchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  oldAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  newAssignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


const Lead = mongoose.model('Lead', leadSchema);
const LeadStatusHistory = mongoose.model('LeadStatusHistory', leadStatusHistorySchema);
const LeadAssignmentHistory = mongoose.model('LeadAssignmentHistory', leadAssignmentHistorySchema);

app.get('/api/leads', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status && status !== 'All') {
      filter.status = status;
    }
    
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name role')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/leads/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name role')
      .populate('createdBy', 'name');
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/api/lead/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all leads assigned to this telecaller
    const leads = await Lead.find({ assignedTo: userId }).sort({ createdAt: -1 });

    res.json(leads);
  } catch (err) {
    console.error("Error fetching leads:", err);
    res.status(500).json({ error: "Server error fetching leads" });
  }
});
app.post("/api/leads", async (req, res) => {
    try {
    const { name, contact, email, project, source, status, assignedTo, createdBy } = req.body;

    // 1️⃣ Create and save the lead
    const lead = new Lead({
      name,
      contact,
      email,
      project,
      source,
      status: status || "New",
      assignedTo: assignedTo || null,
      createdBy: createdBy || null,
    });

    const savedLead = await lead.save();
    await savedLead.populate("assignedTo", "name role");

    // 2️⃣ Prepare notification recipient and message
    let notificationUser = createdBy;
    let message = "";

    if (savedLead.assignedTo) {
      // If assigned, the notification is only for the assigned user
      notificationUser = savedLead.assignedTo._id;
      message = `New lead "${name}" has been assigned to you.`;
    } else {
      // If not assigned, show it to the creator
      message = `New lead "${name}" has been created.`;
    }

    // 3️⃣ Create the notification
    const notification = new Notification({
      user_id: notificationUser,
      target_id: savedLead._id,
      message,
      action_type: "lead_created",
      is_read: false,
    });

    await notification.save();

    // 4️⃣ Respond with data
    res.status(201).json({
      success: true,
      message: "Lead created and notification saved successfully.",
      lead: savedLead,
      notification,
    });
  } catch (error) {
    console.error("Error creating lead:", error);
    res.status(400).json({ message: error.message });
  }

});
app.get("/api/notifications/:userId", async (req, res) => {
  try {

    const notifications = await Notification.find({ user_id: req.params.userId })
      .populate("target_id", "name project")
      .sort({ created_at: -1 });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/role/leads', async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    // if role = admin → all leads
    if (req.user.role !== 'admin') {
      // 👇 only leads created by logged-in user
      filter.createdBy = req.user.id;
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name role')
      .populate('createdBy', 'name _id')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.put('/api/leads/:id', async (req, res) => {
  try {
    const { name, contact, email, project, source, status, assignedTo } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Record status change if applicable
    if (status && status !== lead.status) {
      const statusHistory = new LeadStatusHistory({
        leadId: lead._id,
        oldStatus: lead.status,
        newStatus: status,
        changedBy: req.body.changedBy || null, // In a real app, this would come from auth
      });
      await statusHistory.save();
    }
    
    // Record assignment change if applicable
    if (assignedTo && assignedTo.toString() !== lead.assignedTo?.toString()) {
      const assignmentHistory = new LeadAssignmentHistory({
        leadId: lead._id,
        oldAssignee: lead.assignedTo,
        newAssignee: assignedTo,
        assignedBy: req.body.assignedBy || null, // In a real app, this would come from auth
      });
      await assignmentHistory.save();
    }
    
    // Update the lead
    lead.name = name || lead.name;
    lead.contact = contact || lead.contact;
    lead.email = email || lead.email;
    lead.project = project || lead.project;
    lead.source = source || lead.source;
    lead.status = status || lead.status;
    lead.assignedTo = assignedTo !== undefined ? assignedTo : lead.assignedTo;
    
    const updatedLead = await lead.save();
    await updatedLead.populate('assignedTo', 'name role');
    
    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.patch('/api/leads/:id/status', async (req, res) => {
  try {
    const { newStatus, changedBy } = req.body;
    
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Record status change
    const statusHistory = new LeadStatusHistory({
      leadId: lead._id,
      oldStatus: lead.status,
      newStatus,
      changedBy: changedBy || null, // In a real app, this would come from auth
    });
    await statusHistory.save();
    
    // Update lead status
    lead.status = newStatus;
    const updatedLead = await lead.save();
    await updatedLead.populate('assignedTo', 'name role');
    
    res.json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post('/api/leads/assign', async (req, res) => {
  try {
    const { leadIds, memberId, assignedBy } = req.body;
    
    // Verify the member exists
    const member = await User.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    // Process each lead
    const results = await Promise.all(
      leadIds.map(async (leadId) => {
        try {
          const lead = await Lead.findById(leadId);
          if (!lead) {
            return { leadId, success: false, message: 'Lead not found' };
          }
          
          // Record assignment change
          const assignmentHistory = new LeadAssignmentHistory({
            leadId: lead._id,
            oldAssignee: lead.assignedTo,
            newAssignee: memberId,
            assignedBy: assignedBy || null, // In a real app, this would come from auth
          });
          await assignmentHistory.save();
          
          // Update lead assignment
          lead.assignedTo = memberId;
          const updatedLead = await lead.save();
          await updatedLead.populate('assignedTo', 'name role');
          
          return { leadId, success: true, lead: updatedLead };
        } catch (error) {
          return { leadId, success: false, message: error.message };
        }
      })
    );
    
    res.json({
      message: `Assigned ${results.filter(r => r.success).length} of ${leadIds.length} leads`,
      results
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.get('/api/team-members', async (req, res) => {
  try {
    const { role } = req.query;
    let filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    const members = await User.find(filter).select('-password');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/team-members/:id', async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('-password');
    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.post('/api/team-members', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    // In a real app, you would hash the password
    // For simplicity, we're storing it as plain text (not recommended for production)
    const user = new User({
      name,
      email,
      password, // In production: await bcrypt.hash(password, 10)
      role: role || 'Telecaller'
    });
    
    const savedUser = await user.save();
    // Remove password from response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.get('/api/leads-dashboard/counts', async (req, res) => {
  try {
    const counts = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format the counts
    const statusCounts = {
      All: 0,
      New: 0,
      Contacted: 0,
      Interested: 0,
      Closed: 0,
      Lost: 0
    };
    
    counts.forEach(item => {
      statusCounts[item._id] = item.count;
      statusCounts.All += item.count;
    });
    
    res.json(statusCounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/leads/:id/status-history', async (req, res) => {
  try {
    const history = await LeadStatusHistory.find({ leadId: req.params.id })
      .populate('changedBy', 'name')
      .sort({ changedAt: -1 });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/leads/:id/assignment-history', async (req, res) => {
  try {
    const history = await LeadAssignmentHistory.find({ leadId: req.params.id })
      .populate('oldAssignee', 'name')
      .populate('newAssignee', 'name')
      .populate('assignedBy', 'name')
      .sort({ assignedAt: -1 });
    
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.delete("/api/leads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedLead = await Lead.findByIdAndDelete(id);

    if (!deletedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Error deleting lead:", error);
    res.status(500).json({ message: "Server error while deleting lead" });
  }
});
app.post('/api/post/user', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = new User({ name, email, role });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/role/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const users = await User.find({ role });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/bookings/driver/:driverId', async (req, res) => {
 try {
    const { driverId } = req.params;
    // Find bookings assigned to the driver, sorted by date and time
    const bookings = await Cabbooking.find({ driver: driverId }).sort({ date: 1, time: 1 });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cab bookings" });
  }
});
app.put('/api/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const booking = await Cabbooking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json({ message: 'Status updated', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});
app.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role },
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// --- Setup/Imports (Assumed) ---
// const express = require('express');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const app = express();
// app.use(express.json()); // To parse JSON bodies

// --- Mongoose Connection (Assumed) ---
// mongoose.connect('mongodb://localhost:27017/yourdatabase');

// --- 1. Mongoose Schema ---
const propertySchema = new mongoose.Schema({
  // Basic Details
  property_title: { 
    type: String, 
    required: [true, 'Property title is required.'], 
    trim: true, 
    maxlength: 255 
  },
  property_status: { type: String, default: 'Available' },
  property_synopsis: { type: String },
  approval_status: { 
    type: String, 
    enum: ['approve', 'reject', 'pending'], 
    default: 'pending' 
  },
  
  // Land Details
  extent: { type: String },
  sy_nos: { type: String },
  master_plan_url: { type: String }, // Renamed from master_plan to be the file URL
  master_plan_desc: { type: String }, // New field for description if needed
  owner_name: { type: String },
  owner_contact: { type: String },
  broker: { type: String },
  broker_contact: { type: String },
  
  // Location
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
  
  // Survey
  surveyor: { type: String},
  surveyor_contact: { type: String },
  survey_status: { type: String },
  last_survey_date: { type: Date},
  
  // Legal
  litigation: { type: String, default: 'No' },
  permissions: { type: String, default: 'Approved' },
  advocate: { type: String },
  advocate_contact: { type: String },
  
  // Documents (Stored as file paths/URLs)
  images: [{ type: String }],
  videos: [{ type: String }],
  excel_files: [{ type: String }],
  pdf_docs: [{ type: String }],
  word_docs: [{ type: String }],
  management_visibility: { type: String, default: 'All Users' },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

propertySchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
});

const Property = mongoose.model('Property', propertySchema);

// --- 2. Multer Configuration ---
// Assume 'path' and 'fs' are required: const path = require('path'); const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fieldName = file.fieldname;
    let uploadPath = 'uploads'; // Default base directory

    // --- Directory Mapping based on Schema Fields ---
    if (fieldName === 'brochure') {
      uploadPath = path.join(uploadPath, 'venture_brochures');
    } else if (fieldName === 'layout') {
      uploadPath = path.join(uploadPath, 'venture_layouts');
    } else if (fieldName === 'highlights') {
      uploadPath = path.join(uploadPath, 'venture_highlights');
    } 
    // Handle dynamic plot files using a prefix check
    else if (fieldName.startsWith('plot_documents_')) {
      uploadPath = path.join(uploadPath, 'plot_documents');
    } else if (fieldName.startsWith('plot_images_')) {
      uploadPath = path.join(uploadPath, 'plot_images');
    }
    // Handle other specific file types if needed
    // else if (fieldName === 'videos') {
    //   uploadPath = path.join(uploadPath, 'videos');
    // } 
    else {
      uploadPath = path.join(uploadPath, 'others');
    }
    
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// --- Unified Upload Middleware for the Combined Route ---
const uploadFields = upload.fields([
  // Venture Files (maxCount is 1 for brochure/layout, 10 for highlights)
  { name: 'brochure', maxCount: 1 },
  { name: 'layout', maxCount: 1 },
  { name: 'highlights', maxCount: 10 }, 
  { name: 'Banners', maxCount: 10 }, 
  
  // Plot Files (using the catch-all dynamic names)
  // Multer's fields() method is limited and cannot handle truly arbitrary field names.
  // We rely on the Express route using `name: /plot_documents_|plot_images_/` with `upload.fields`
  // so we must use a dummy/large maxCount here for the dynamic fields, or adjust the route.
  
  // OPTION 1: Use a massive single field to catch ALL dynamically named plot files (Requires regex in fields() array, which is not standard Multer syntax)
  // Since Multer's `fields` array only accepts strings for names, we need a special way to handle the dynamic fields.
  
  // OPTION 2 (RECOMMENDED): Define the dynamic field pattern directly in the route, and use a simple array here if possible. 
  // Since the route definition already uses the regex `{ name: /plot_documents_|plot_images_/, maxCount: 50 }`, 
  // you should generally define `uploadFields` *inside* the route handler itself to make sure the regex works correctly. 
  
  // If you must define it globally, use the structure below, which is what the route expects:
  { name: 'plot_documents', maxCount: 50 }, // Placeholder/Catch-all for plot documents
  { name: 'plot_images', maxCount: 50 }    // Placeholder/Catch-all for plot images
  // NOTE: The backend route must use the Multer file parsing logic provided previously (using regex) for the dynamic names to work.
]);
// --- 3. API Route (Create Property) ---

// Ensure you define the Notification model above this route.
// const Notification = mongoose.model('Notification', notificationSchema);

app.post('/api/properties', uploadFields, async (req, res) => {
  // Placeholder for real user data (should come from authentication middleware)
  const currentUserId = req.user ? req.user.id : '60d5ec49f1325c001f3e7b1a'; // Replace with real ID
  const currentUserName = req.user ? req.user.name : 'Admin User'; // Replace with real name

  try {
    const formData = req.body;
    const files = req.files;

    // ... (File path preparation, last_survey_date handling as before) ...
    // --- START OF PREVIOUS LOGIC (Simplified) ---

    const filePaths = {
      images: files.images ? files.images.map(file => file.path) : [],
      // ... (other file arrays) ...
      master_plan_url: files.master_plan ? files.master_plan[0].path : undefined
    };

    const lastSurveyDate = formData.last_survey_date 
      ? new Date(formData.last_survey_date) 
      : undefined;
      
    if (lastSurveyDate && isNaN(lastSurveyDate.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for last_survey_date.' });
    }

    const propertyData = {
      ...formData,
      ...filePaths,
      last_survey_date: lastSurveyDate,
      approval_status: 'pending',
    };
    
    delete propertyData.master_plan; 
    
    // --- END OF PREVIOUS LOGIC ---

    // 1. Save the New Property
    const newProperty = new Property(propertyData);
    await newProperty.save();

    // 2. CREATE THE NOTIFICATION
    const notificationMessage = `${currentUserName} has successfully added a new property, "${newProperty.property_title}". Its initial status is Pending Approval.`;
    
    const newNotification = new Notification({
      user_id: currentUserId,
      target_id: newProperty._id, // Link to the newly created property
      message: notificationMessage,
      action_type: 'property_created'
    });
    
    await newNotification.save();
    
    // 3. Respond to the Client
    res.status(201).json({
      message: 'Property created and notification logged successfully',
      property: newProperty,
      notification: newNotification
    });
    
  } catch (error) {
    console.error('Error creating property or notification:', error);

    // Mongoose validation error handling
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
          error: 'Validation Failed',
          details: messages 
      });
    }

    // Generic server error
    res.status(500).json({ error: 'Failed to create property due to a server error.' });
  }
});

// --- Server Listening (Assumed) ---
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/api/properties/pending', async (req, res) => {
  try {
    const pendingProperties = await Property.find({ approved: false });
    res.status(200).json(pendingProperties);
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    res.status(500).json({ error: 'Failed to get pending properties' });
  }
});

// Get all properties
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await Property.find().sort({ created_at: -1 });
    res.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get a single property by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Update a property
app.put('/api/properties/:id', uploadFields, async (req, res) => {
  try {
    const formData = req.body;
    const files = req.files;
    
    // Prepare updated data
    const updateData = { ...formData, updated_at: Date.now() };
    
    // Add file paths if files were uploaded
    if (files) {
      if (files.images) updateData.images = files.images.map(file => file.path);
      if (files.videos) updateData.videos = files.videos.map(file => file.path);
      if (files.excel_files) updateData.excel_files = files.excel_files.map(file => file.path);
      if (files.pdf_docs) updateData.pdf_docs = files.pdf_docs.map(file => file.path);
      if (files.word_docs) updateData.word_docs = files.word_docs.map(file => file.path);
      if (files.master_plan) updateData.master_plan = files.master_plan[0].path;
    }
    
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});
app.patch('/api/properties/:id/status', async (req, res) => {
  try {
    const { status, updatedBy } = req.body; // status = 'approve' | 'reject' | 'pending'
    const propertyId = req.params.id;

    // 1️⃣ Update property in DB
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      { approval_status: status },
      { new: true }
    ).populate("createdBy", "name _id");

    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    // 2️⃣ Create a readable message
    const message = `Your property "${updatedProperty.title}" has been ${status}.`;

    // 3️⃣ Save notification for the property owner
    const notification = new Notification({
      user_id: updatedProperty.createdBy._id, // property owner
      target_id: updatedProperty._id,
      message,
      action_type: "status_change",
      is_read: false,
    });

    await notification.save();

    // 4️⃣ Respond with updated property + notification
    res.status(200).json({
      success: true,
      message: "Property status updated and notification saved.",
      property: updatedProperty,
      notification,
    });
  } catch (error) {
    console.error("Error updating property status:", error);
    res.status(500).json({ error: "Failed to update property status" });
  }

});
// Delete a property
app.delete('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    // Delete associated files from the file system
    const deleteFile = (filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    };
    
    // Delete all associated files
    if (property.images) property.images.forEach(deleteFile);
    if (property.videos) property.videos.forEach(deleteFile);
    if (property.excel_files) property.excel_files.forEach(deleteFile);
    if (property.pdf_docs) property.pdf_docs.forEach(deleteFile);
    if (property.word_docs) property.word_docs.forEach(deleteFile);
    if (property.master_plan) deleteFile(property.master_plan);
    
    // Delete from database
    await Property.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});


app.post("/api/employees", upload.array("files"), async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      phoneNumber,
      dob,
      email,
      password,
      duties,
      address,
      zip,
      role,
    } = req.body;

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save Employee
    const newEmployee = new Employee({
      firstName,
      lastName,
      gender,
      phoneNumber,
      dob,
      email,
      password: hashedPassword,
      duties,
      address,
      zip,
      role,
      files: req.files ? req.files.map((f) => f.path) : [],
    });
    await newEmployee.save();

    // ✅ Also Save User (linked to Employee)
    const newUser = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      role: role, // if not given, default is F
      employeeId: newEmployee._id, // <-- Link Employee ID here
    });
    await newUser.save();

    res.status(201).json({
      message: "Employee & User created successfully",
      employee: newEmployee,
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating employee & user:", error);
    res.status(500).json({ error: error.message });
  }
});


app.patch('/api/employees/:id', async (req, res) => {
  try {
    const updated = await Employee.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status }, // expects { status: "terminated" }
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Admin not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: error.message });
  }
});
app.patch("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // validate input
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // find and update
    const employee = await Employee.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({
      message: "Employee status updated successfully",
      employee,
    });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/admin", async (req, res) => {
  try {
    const executives = await Employee.find({ role: "Admin" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/directers", async (req, res) => {
  try {
    const executives = await User.find({ role: "director" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/Receptionist", async (req, res) => {
  try {
    const executives = await Employee.find({ role: "Receptionist" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/executives", async (req, res) => {
  try {
    const executives = await User.find({ role: "executive" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/driver", async (req, res) => {
  try {
    const executives = await Employee.find({ role: "Driver" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/drivers", async (req, res) => {
  try {
    const executives = await User.find({ role: "Driver" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/hrs", async (req, res) => {
  try {
    const executives = await Employee.find({ role: "Hr" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/tellecaller", async (req, res) => {
  try {
    const executives = await Employee.find({ role: "Tellecaller" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/director", async (req, res) => {
  try {
    const executives = await Employee.find({ role: "director" });
    res.json(executives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/appointments", async (req, res) => {
  try {
    const appts = await Appointment.find();
    res.json(appts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { id, executiveId, executiveName, date, time } = req.body;

    // Build appointment data
    const appointmentData = {
      ...req.body,
      createdBy: id,
      assignedTo: executiveId, // ✅ Mongoose requires this field
    };

    const appointment = new Appointment(appointmentData);
    await appointment.save();

    // Create notification for executive
    const notificationMessage = `An appointment has been scheduled for Executive ${executiveName} on ${date} at ${time}.`;

    const notification = new Notification({
      user_id: id,
      target_id: executiveId,
      message: notificationMessage,
      type: 'appointment',
      createdAt: new Date(),
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Appointment and notification created successfully.',
      appointment,
      notification,
    });
  } catch (err) {
    console.error('Error saving appointment or notification:', err);
    res.status(500).json({ error: 'Failed to save appointment or notification' });
  }
});



// Update appointment
app.put("/api/appointments/:id", async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(appt);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete appointment
app.delete("/api/appointments/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/api/cabs", async (req, res) => {
  try {
    const bookings = await Cabbooking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});
// POST create a cab booking
app.post("/api/cabs", async (req, res) => {
  try {
    // Create and save the booking
    const booking = new Cabbooking(req.body);
    await booking.save();

    // Prepare notification message
    const message = `New cab booking created for ${booking.executive || "a passenger"}.`;

    // Create and save notification - matching the schema
    const notification = new Notification({
      user_id: req.body.id , // Use the user ID from frontend or create a dummy one
      target_id: booking.driver, // Use the booking ID as target_id
      message: message,
      action_type: "cab_booking",
      is_read: false,
      created_at: new Date(),
    });

    await notification.save();


    // Respond with booking
    res.status(201).json({ 
      booking, 
      notification: {
        id: notification._id,
        message: notification.message,
        action_type: notification.action_type,
        created_at: notification.created_at
      }
    });
  } catch (err) {
    console.error("Error creating cab booking:", err);
    res.status(400).json({ message: "Failed to create booking", error: err.message });
  }
});
app.get("/api/analytics", async (req, res) => {
  try {
    // --- Basic Stats ---
    const totalLeads = await Lead.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalCabsBooked = await Cabbooking.countDocuments();
    const totalClientsVisited = await Client.countDocuments();
   
    const totalRevenue =  0;

    // --- Leads by Status ---
    const leadStatuses = ["New", "Follow-up", "Interested", "Booked"];
    const leadsByStatus = {};
    for (const status of leadStatuses) {
      leadsByStatus[status] = await Lead.countDocuments({ status });
    }

    // --- Appointments Overview ---
    const appointmentsOverview = {
      Scheduled: await Appointment.countDocuments({ status: "Scheduled" }),
      Completed: await Appointment.countDocuments({ status: "Completed" }),
    };

    // --- Revenue Growth (Monthly Example) ---
    const revenueGrowth = 0;

    res.json({
      totalLeads,
      totalAppointments,
      totalCabsBooked,
      totalClientsVisited,
      totalRevenue,
      leadsByStatus,
      appointmentsOverview,
      revenueGrowth,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});
app.put("/api/cabs/:id", async (req, res) => {
  try {
    const booking = await Cabbooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: "Update Failed", error: err.message });
  }
});

// ✅ PATCH update status only
app.patch("/api/cabs/:id/status", async (req, res) => {
  try {
    const booking = await Cabbooking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: "Status Update Failed", error: err.message });
  }
});

// ✅ DELETE booking
app.delete("/api/cabs/:id", async (req, res) => {
  try {
    const booking = await Cabbooking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete Failed", error: err.message });
  }
});

// Get cab bookings by driverId
app.get("/api/cabs/driver/:driverId", async (req, res) => {
  try {
    const { driverId } = req.params;
    console.log("DriverId received:", driverId);

    const bookings = await Cabbooking.find({ driver: driverId })

    console.log("Bookings found:", bookings);

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings by driver:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// API Routes

// Get all referrals with optional filtering
app.get('/api/referrals', async (req, res) => {
  try {
    const { search, status, dateFrom, dateTo } = req.query;
    let filter = {};

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { referrer: searchRegex },
        { referred: searchRegex },
        { phone: searchRegex },
        { director: searchRegex },
        { executive: searchRegex },
        { venture: searchRegex },
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    const referrals = await Referal.find(filter).sort({ date: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single referral by ID
app.get('/api/referrals/:id', async (req, res) => {
  try {
    const referral = await Referal.findById(req.params.id);
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    res.json(referral);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new referral
app.post('/api/referrals', async (req, res) => {
  try {
    const {
      referrer,
      referred,
      phone,
      relation,
      status,
      date,
      notes,
      director,
      executive,
      venture,
      originalPrice,
      commissionPct,
    } = req.body;

    // Calculate commission amount if status is Booked
    let commissionAmt = 0;
    if (status === 'Booked') {
      commissionAmt = (originalPrice || 0) * ((commissionPct || 0) / 100);
    }

    const newReferral = new Referal({
      referrer,
      referred,
      phone,
      relation,
      status,
      date: date || new Date(),
      reward: status === 'Booked' ? '5000' : 'Pending',
      notes,
      director,
      executive,
      venture,
      originalPrice: originalPrice || 0,
      commissionPct: commissionPct || 0,
      commissionAmt,
    });

    const savedReferral = await newReferral.save();
    res.status(201).json(savedReferral);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a referral
app.put('/api/referrals/:id', async (req, res) => {
  try {
    const {
      referrer,
      referred,
      phone,
      relation,
      status,
      date,
      notes,
      director,
      executive,
      venture,
      originalPrice,
      commissionPct,
    } = req.body;

    // Calculate commission amount if status is Booked
    let commissionAmt = 0;
    let reward = 'Pending';
    
    if (status === 'Booked') {
      commissionAmt = (originalPrice || 0) * ((commissionPct || 0) / 100);
      reward = '5000';
    }

    const updatedReferral = await Referal.findByIdAndUpdate(
      req.params.id,
      {
        referrer,
        referred,
        phone,
        relation,
        status,
        date,
        reward,
        notes,
        director,
        executive,
        venture,
        originalPrice: originalPrice || 0,
        commissionPct: commissionPct || 0,
        commissionAmt,
      },
      { new: true, runValidators: true }
    );

    if (!updatedReferral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    res.json(updatedReferral);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Mark a referral as booked
app.patch('/api/referrals/:id/book', async (req, res) => {
  try {
    const { rewardValue = 5000 } = req.body;
    const referral = await Referral.findById(req.params.id);
    
    if (!referral) {
      return res.status(404).json({ message: 'Referral not found' });
    }

    const commissionAmt = (referral.originalPrice || 0) * ((referral.commissionPct || 0) / 100);
    
    const updatedReferral = await Referal.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Booked',
        reward: rewardValue.toString(),
        commissionAmt,
      },
      { new: true }
    );

    res.json(updatedReferral);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a referral
app.delete('/api/referrals/:id', async (req, res) => {
  try {
    const deletedReferral = await Referal.findByIdAndDelete(req.params.id);
    if (!deletedReferral) {
      return res.status(404).json({ message: 'Referral not found' });
    }
    res.json({ message: 'Referral deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get summary metrics
app.get('/api/referrals-summary', async (req, res) => {
  try {
    const totalReferrals = await Referal.countDocuments();
    const totalBooked = await Referal.countDocuments({ status: 'Booked' });
    
    const rewardStats = await Referal.aggregate([
      { $match: { status: 'Booked' } },
      { $group: { _id: null, totalRewards: { $sum: { $toDouble: "$reward" } } } }
    ]);
    
    const commissionStats = await Referal.aggregate([
      { $match: { status: 'Booked' } },
      { $group: { _id: null, totalCommission: { $sum: "$commissionAmt" } } }
    ]);
    
    const totalRewards = rewardStats.length > 0 ? rewardStats[0].totalRewards : 0;
    const totalCommission = commissionStats.length > 0 ? commissionStats[0].totalCommission : 0;
    
    res.json({
      totalReferrals,
      totalBooked,
      totalRewards,
      totalCommission
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const clientSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Legacy fields for backward compatibility
  propertyName: { type: String },
  propertyLocation: { type: String },
  plote: { type: String },
  // New comprehensive fields
  ventureName: { type: String },
  location: { type: String },
  plotNumber: { type: String },
  plotSize: { type: String },
  facing: { type: String },
  status: { 
    type: String, 
    default: 'Active', 
    enum: ['Active', 'Inactive', 'Completed', 'On Hold'] 
  },
  vastu: { type: String },
  currentPhase: { type: Number, default: 1, min: 1, max: 5 },
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
  documents: [{
    type: { type: String, required: true },
    name: { type: String, required: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  updates: [{
    message: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  bannerImage: { type: String } // Store the file path or URL
}, { timestamps: true });


const Client = mongoose.model('Client', clientSchema);
// API Routes

// Get all clients with optional filtering
app.get('/api/clients', async (req, res) => {
  try {
    const { search, status } = req.query;
    let filter = {};

    // Status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { clientName: searchRegex },
        { email: searchRegex },
        { propertyName: searchRegex },
        { propertyLocation: searchRegex }
      ];
    }

    const clients = await Client.find(filter).sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/clients/:id', async (req, res) => {
  try {
    let client = null;
    if (mongoose.isValidObjectId(req.params.id)) {
      client = await Client.findById(req.params.id);
    }
    // Fallback: If not found by ID or placeholder ID, return first active client or first client
    if (!client) {
      client = await Client.findOne({ status: 'Active' }) || await Client.findOne();
    }
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Create a new client (with User & rollback on error)
app.post('/api/clients', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      clientName,
      email,
      password, // This will be hashed
      propertyName,
      propertyLocation,
      plote,
      price,
      status
    } = req.body;

    // 1. Check if a User with this email already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'A user (client) with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- CLIENT CREATION ---
    const newClient = new Client({
      clientName,
      email,
      password: hashedPassword,
      propertyName,
      propertyLocation,
      plote,
      price,
      status,
      updates: [{
        message: 'Client created',
        date: new Date()
      }]
    });

    const savedClient = await newClient.save({ session });

    // --- USER CREATION ---
    const newUser = new User({
      name: clientName,
      email,
      password: hashedPassword,
      role: 'Customer',
      employeeId: savedClient._id,
    });

    const savedUser = await newUser.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Success response
    res.status(201).json({
      client: savedClient,
      user: savedUser
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error during client/user creation:', error);
    res.status(400).json({ message: error.message });
  }
});


// Update a client
app.put('/api/clients/:id', async (req, res) => {
  try {
    const {
      clientName,
      email,
      ventureName,
      location,
      plotNumber,
      plotSize,
      facing,
      status,
      vastu,
      currentPhase,
      overview,
      previousOwner,
      registrationOffice,
      registrationNumber,
      registrationDate,
      plotAddress,
      surveyNumber,
      surveyReference,
      legalStatus,
      updates
    } = req.body;

    // Check if email is being changed to one that already exists
    if (email) {
      const existingClient = await Client.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingClient) {
        return res.status(400).json({ message: 'Client with this email already exists' });
      }
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      {
        clientName,
        email,
        ventureName,
        location,
        plotNumber,
        plotSize,
        facing,
        status,
        vastu,
        currentPhase: Number(currentPhase) || 1,
        overview,
        previousOwner,
        registrationOffice,
        registrationNumber,
        registrationDate,
        plotAddress,
        surveyNumber,
        surveyReference,
        legalStatus,
        updates
      },
      { new: true, runValidators: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Add update record if updates array is modified
    if (updates && Array.isArray(updates)) {
      const newUpdatesCount = updates.length - (updatedClient.updates ? updatedClient.updates.length : 0);
      if (newUpdatesCount > 0) {
        updatedClient.updates.push({
          message: `Client details updated with ${newUpdatesCount} new update(s)`,
          date: new Date()
        });
      }
    } else {
      // Add general update record for other field changes
      updatedClient.updates.push({
        message: 'Client property details updated',
        date: new Date()
      });
    }
    
    await updatedClient.save();

    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// Delete a client
app.delete('/api/clients/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Delete associated documents
    for (const doc of client.documents) {
      const filePath = path.join(__dirname, 'uploads/documents', doc.fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a document to a client
app.post('/api/clients/:id/documents', upload.single('file'), async (req, res) => {
  try {
    const { type, name } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      // Delete the uploaded file if client not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Client not found' });
    }

    const newDocument = {
      type,
      name,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      date: new Date()
    };

    client.documents.push(newDocument);
    client.updates.push({
      message: `Document "${name}" added`,
      date: new Date()
    });

    await client.save();
    res.status(201).json(newDocument);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a document
app.delete('/api/clients/:clientId/documents/:docId', async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const document = client.documents.id(req.params.docId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete the file from the filesystem
    const filePath = path.join(__dirname, 'uploads/documents', document.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Remove the document from the array
    client.documents.pull({ _id: req.params.docId });
    client.updates.push({
      message: `Document "${document.name}" deleted`,
      date: new Date()
    });

    await client.save();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Download a document
app.get('/api/clients/:clientId/documents/:docId/download', async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const document = client.documents.id(req.params.docId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const filePath = path.join(__dirname, 'uploads/documents', document.fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.download(filePath, document.originalName);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add an update to a client
app.post('/api/clients/:id/updates', async (req, res) => {
  try {
    const { message } = req.body;

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    client.updates.push({
      message,
      date: new Date()
    });

    await client.save();
    res.status(201).json({ message: 'Update added successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
app.post('/api/termination-requests', async (req, res) => {
  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const newRequest = new TerminationRequest({
      userId,
      reason,
      status: 'pending',
      createdAt: new Date(),
    });

    await newRequest.save();

    return res.status(201).json({
      message: 'Termination request created successfully',
      request: newRequest,
    });
  } catch (error) {
    console.error('Error saving termination request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Get all pending termination requests
app.get('/api/termination-requests', async (req, res) => {
  const requests = await TerminationRequest.find({ status: 'pending' }).populate('userId');
  res.json(requests);
});

app.put('/api/termination-requests/:id/approve', async (req, res) => {
  try {
    const request = await TerminationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Termination request not found' });

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Termination request already processed' });
    }

    request.status = 'approved';
    request.updatedAt = new Date();
    await request.save();

    // Update user status to 'terminated'
    await User.findByIdAndUpdate(request.userId, { status: 'terminated' });

    res.json({ message: 'Termination approved and user status updated', request });
  } catch (error) {
    console.error('Error approving termination request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Reject termination request
app.put('/api/termination-requests/:id/reject', async (req, res) => {
  try {
    const request = await TerminationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Termination request not found' });

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Termination request already processed' });
    }

    request.status = 'rejected';
    request.updatedAt = new Date();
    await request.save();

    res.json({ message: 'Termination request rejected', request });
  } catch (error) {
    console.error('Error rejecting termination request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// backend/routes/dashboard.js
app.get("/api/dashboard/summary", async (req, res) => {
  try {
    const leadsCount = await Lead.countDocuments();
    const propertiesCount = await Property.countDocuments();
    const employeesCount = await Employee.countDocuments();

    // Example: Calculate total revenue from a Revenue model

    // Example: Fetch last 10 activities
    
    res.json({
      leadsCount,
      propertiesCount,
      employeesCount,
   
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

// Create a new call log
app.post('/api/calllogs', async (req, res) => {
  try {
    const { leadId, userId, timestamp, duration, notes } = req.body;
    if (!leadId || !userId || !timestamp) {
      return res.status(400).json({ error: 'leadId, userId and timestamp are required' });
    }

    const newCallLog = new Calllog({ leadId, userId, timestamp, duration, notes });
    await newCallLog.save();

    return res.status(201).json(newCallLog);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create call log' });
  }
});


// Get call logs for a lead
app.get('/api/calllogs', async (req, res) => {
  try {
    const { leadId } = req.query;
    if (!leadId) return res.status(400).json({ error: 'leadId query parameter is required' });

    const logs = await Calllog.find({ leadId }).sort({ timestamp: -1 });
    return res.json(logs);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch call logs' });
  }
});
app.put('/api/calllogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g., { duration, notes }

    const updatedLog = await Calllog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedLog) {
      return res.status(404).json({ error: 'Call log not found' });
    }

    return res.json(updatedLog);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update call log' });
  }
});
app.get('/api/walkins', async (req, res) => {
  const { search = '', status } = req.query;
  const filter = {
    ...(search && {
      $or: [
        { name: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ],
    }),
    ...(status && { status }),
  };
  const walkins = await Walkin.find(filter).sort({ createdAt: -1 });
  res.json(walkins);
});

// Create a new walk-in
app.post('/api/walkins', async (req, res) => {
  try {
    // Validation: Check required fields
    const { name, phone } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }

    // Save new walk-in
    const walkin = new Walkin(req.body);
    await walkin.save();

    res.status(201).json(walkin);
  } catch (error) {
    // Handle Mongoose or server errors
    console.error(error); // Optional: for debugging
    res.status(500).json({ error: 'Something went wrong while saving walk-in.' });
  }
});


// Edit an existing walk-in
app.put('/api/walkins/:id', async (req, res) => {
  const walkin = await Walkin.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!walkin) return res.status(404).send('Not found');
  res.json(walkin);
});

// Delete a walk-in
app.delete('/api/walkins/:id', async (req, res) => {
  await Walkin.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
app.get("/api/recruitments", async (req, res) => {
  try {
    const candidates = await Recruitment.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching candidates", error });
  }
});

// ✅ Add new candidate
app.post("/api/recruitments", async (req, res) => {
  try {
    const newCandidate = new Recruitment(req.body);
    await newCandidate.save();
    res.status(201).json(newCandidate);
  } catch (error) {
    res.status(400).json({ message: "Error adding candidate", error });
  }
});

// ✅ Update candidate status (or other fields)
app.put("/api/recruitments/:id", async (req, res) => {
  try {
    const updatedCandidate = await Recruitment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(updatedCandidate);
  } catch (error) {
    res.status(400).json({ message: "Error updating candidate", error });
  }
});

// ✅ Delete candidate
app.delete("/api/recruitments/:id", async (req, res) => {
  try {
    const deletedCandidate = await Recruitment.findByIdAndDelete(req.params.id);
    if (!deletedCandidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json({ message: "Candidate deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting candidate", error });
  }
});
app.post("/api/attendance/start", async (req, res) => {
  try {
    const { userId } = req.body;
    const attendance = new Attendence({ userId });
    await attendance.save();
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Failed to start attendance" });
  }
});
app.get("/api/attendance", async (req, res) => {
  try {
    const { start, end } = req.query; // example: /api/attendance?start=2025-07-01&end=2025-07-31
    const filter = {};
    if (start && end) {
      filter.loginTime = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    const records = await Attendence.find(filter)
      .populate("userId", "name email role")
      .sort({ loginTime: -1 });
    res.json(records);
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ message: "Failed to fetch attendance records" });
  }
});

// PATCH /api/attendance/end/:id - save logout time for given attendance record
app.patch("/api/attendance/end/:id", async (req, res) => {
  try {
    const attendance = await Attendence.findByIdAndUpdate(
      req.params.id,
      { logoutTime: new Date() },
      { new: true }
    );
    if (!attendance) return res.status(404).json({ message: "Attendance not found" });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Failed to end attendance" });
  }
});

// GET /api/attendance/user/:userId - get attendance records for user
app.get("/api/attendance/user/:userId", async (req, res) => {
  try {
    const records = await Attendence.find({ userId: req.params.userId }).sort({ loginTime: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to get attendance records" });
  }
});
app.get('/api/hr/stats', async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
    const activeRecruitments = await Recruitment.countDocuments({ status: 'Pending' });

    res.json({ totalEmployees, pendingLeaves, activeRecruitments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

app.get('/api/leaves', async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch leaves', error: err.message });
  }
});

app.put('/api/leaves/:id', async (req, res) => {
  try {
    const updated = await Leave.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update leave', error: err.message });
  }
});

app.get('/api/hr/weekly-attendance', async (req, res) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const records = await Attendence.find({
      loginTime: { $gte: startOfWeek, $lte: endOfWeek }
    });

    // Prepare data for chart
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weeklyData = days.map((day, idx) => {
      const dayRecords = records.filter(r => {
        const d = new Date(r.loginTime);
        return d.getDay() === idx;
      });
      const present = dayRecords.length;
      const late = dayRecords.filter(r => {
        const d = new Date(r.loginTime);
        return d.getHours() > 9 || (d.getHours() === 9 && d.getMinutes() > 0);
      }).length;
      return { day, present, late };
    });

    res.json(weeklyData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch weekly attendance' });
  }
});
app.get('/api/employee/:userId', async (req, res) => {
    try {
        const employeeId = req.params.userId;

        // Use findById() to search the Employee collection by the _id
        const employee = await Employee.findById(employeeId).select('-password'); 

        if (!employee) {
            return res.status(404).json({ message: "Employee not found for ID: " + employeeId });
        }

        // Success: return the full employee data
        res.status(200).json(employee);

    } catch (error) {
        console.error("Error fetching employee details by ID:", error.message);
        
        // Handle the specific CastError you saw earlier if the ID format is wrong
        if (error.name === 'CastError') {
            return res.status(400).json({ message: "Invalid ID format provided." });
        }
        
        res.status(500).json({ message: "Server error fetching details." });
    }
});

app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }); // Sort by timestamp
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Save new message
app.post("/api/messages", async (req, res) => {
  try {
    const { senderId, senderName, text, time, timestamp } = req.body;
    
    // Validate required fields
    if (!senderId || !text) {
      return res.status(400).json({ error: "Sender ID and text are required" });
    }

    // If senderName is not provided, use a default or fetch from user data
    const displayName = senderName || "Unknown User";

    const newMessage = new Message({ 
      senderId, 
      senderName: displayName, 
      text, 
      time,
      timestamp: timestamp || new Date().toISOString()
    });
    
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});
app.get("/api/messages/department/:departmentId", async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    if (!departmentId) {
      return res.status(400).json({ error: "Department ID is required" });
    }

    // ✅ Use find(), not findById()
    const messages = await DepartmentMessage.find({ departmentId })
      .sort({ createdAt: 1 })
      .select('senderId senderName senderRole text time timestamp createdAt');
    
    res.json(messages);
  } catch (err) {
    console.error("Error fetching department messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Save department message
app.post("/api/messages/department", async (req, res) => {
  try {
    const { 
      departmentId, 
      senderId, 
      senderName, 
      senderRole, 
      text, 
      time, 
      timestamp 
    } = req.body;

    // Validate required fields
    if (!departmentId || !senderId || !text) {
      return res.status(400).json({ 
        error: "Department ID, sender ID, and text are required" 
      });
    }

    const newMessage = new DepartmentMessage({ 
      departmentId, 
      senderId, 
      senderName: senderName || "Unknown User",
      senderRole: senderRole || "User",
      text, 
      time: time || new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      timestamp: timestamp || new Date().toISOString()
    });

    await newMessage.save();
    
    // Return the saved message with all fields
    res.status(201).json({
      _id: newMessage._id,
      departmentId: newMessage.departmentId,
      senderId: newMessage.senderId,
      senderName: newMessage.senderName,
      senderRole: newMessage.senderRole,
      text: newMessage.text,
      time: newMessage.time,
      timestamp: newMessage.timestamp,
      createdAt: newMessage.createdAt
    });
  } catch (err) {
    console.error("Error saving department message:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
});


// Fetch unread notifications
app.get('/api/notifications/unread', async (req, res) => {
  try {
    const notifications = await Notification.findOne({ is_read: false })
      .sort({ created_at: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Mark all notifications as read
app.put('/api/notifications/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({}, { is_read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
app.get("/api/dashboard", async (req, res) => {
  try {
    // KPI Data
    const totalLeads = await Lead.countDocuments();
    const totalSales = await Property.aggregate([
      { $match: { status: "Sold" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const activeProjects = await Property.countDocuments({ status: "Active" });
    const employeeCount = await Employee.countDocuments();

    // Sales by Month
    const salesByMonth = await Property.aggregate([
      { $match: { status: "Sold" } },
      {
        $group: {
          _id: { $month: "$soldAt" },
          sales: { $sum: "$price" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const salesData = salesByMonth.map((item) => ({
      month: monthNames[item._id - 1],
      sales: item.sales,
    }));

    // Conversion Funnel
    const leadStatusCounts = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const conversionData = leadStatusCounts.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentReferrals = await Lead.find({ referredBy: { $ne: null } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("referredBy name rewardStatus")
      .lean();

    res.json({
      kpis: {
        totalLeads,
        totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
        activeProjects,
        employeeCount,
      },
      salesData,
      conversionData,
      recentAppointments,
      recentReferrals,
    });
  } catch (err) {
    console.error("Dashboard Fetch Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


app.post('/api/plots', async (req, res) => {
  try {
    const plotData = req.body;
    const plot = new Plots(plotData);
    const savedPlot = await plot.save();
    
    // Populate venture details
    await savedPlot.populate('ventureId');
    
    res.status(201).json({
      success: true,
      message: 'Plot created successfully',
      data: savedPlot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating plot',
      error: error.message
    });
  }
});

// Get all plots with venture details
app.get('/api/plots', async (req, res) => {
  try {
    const plots = await Plots.find().populate('ventureId').sort({ createdAt: -1 });
    res.json({
      success: true,
      data: plots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plots',
      error: error.message
    });
  }
});

// Get plots by venture ID
app.get('/api/plots/venture/:ventureId', async (req, res) => {
  try {
    const plots = await Plots.find({ ventureId: req.params.ventureId })
      .populate('ventureId')
      .sort({ plotNumber: 1 });
    
    res.json({
      success: true,
      data: plots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plots',
      error: error.message
    });
  }
});

// Update plot
app.put('/api/plots/:id', async (req, res) => {
  try {
    const plot = await Plots.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('ventureId');
    
    if (!plot) {
      return res.status(404).json({
        success: false,
        message: 'Plot not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Plot updated successfully',
      data: plot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating plot',
      error: error.message
    });
  }
});

// Update plot status
app.patch('/api/plots/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const plot = await Plots.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('ventureId');
    
    if (!plot) {
      return res.status(404).json({
        success: false,
        message: 'Plot not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Plot status updated successfully',
      data: plot
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating plot status',
      error: error.message
    });
  }
});

// Delete plot
app.delete('/api/plots/:id', async (req, res) => {
  try {
    const plot = await Plots.findByIdAndDelete(req.params.id);
    
    if (!plot) {
      return res.status(404).json({
        success: false,
        message: 'Plot not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Plot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting plot',
      error: error.message
    });
  }
});

app.post('/api/ventures', async (req, res) => {
  try {
    const ventureData = req.body;
    
    // For file uploads, you would typically handle this with multer
    // For now, we'll assume file paths are sent in the request
    const venture = new Venture(ventureData);
    const savedVenture = await venture.save();
    
    res.status(201).json({
      success: true,
      message: 'Venture created successfully',
      data: savedVenture
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating venture',
      error: error.message
    });
  }
});

// Get all ventures
app.get('/api/ventures', async (req, res) => {
  try {
    const ventures = await Venture.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: ventures
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching ventures',
      error: error.message
    });
  }
});

// Get venture by ID
app.get('/api/ventures/:id', async (req, res) => {
  try {
    const venture = await Venture.findById(req.params.id);
    if (!venture) {
      return res.status(404).json({
        success: false,
        message: 'Venture not found'
      });
    }
    res.json({
      success: true,
      data: venture
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching venture',
      error: error.message
    });
  }
});

app.put('/api/ventures/:id', async (req, res) => {
  try {
    const venture = await Venture.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!venture) {
      return res.status(404).json({
        success: false,
        message: 'Venture not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Venture updated successfully',
      data: venture
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating venture',
      error: error.message
    });
  }
});

app.delete('/api/ventures/:id', async (req, res) => {
  try {
    const venture = await Venture.findByIdAndDelete(req.params.id);
    
    if (!venture) {
      return res.status(404).json({
        success: false,
        message: 'Venture not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Venture deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting venture',
      error: error.message
    });
  }
});
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});
// 📩 Get notifications for a specific target (executive/user)
app.get('/api/notifications/:target_id', async (req, res) => {
  try {
    const { target_id } = req.params;

    // Fetch notifications for that target (executive)
    const notifications = await Notification.findOne({ target_id })
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});
const plotSubSchema = new mongoose.Schema({
    plotNumber: { type: String, required: true },
    plotLocation: String,
    plotFacing: String,
    plotVaastu: String,
    status: { type: String, enum: ['available', 'booked', 'sold'], default: 'available' },
    documents: String, // Storing filename
    images: [String],  // Storing array of filenames
    additionalDetails: String,
});

const ventureSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    registered: String,
    approvedBy: String,
    googleMapLink: String,
    brochure: String,
    layout: String,
    highlights: [String],
    units: { type: Number, required: true },
    // Plots array is now nested within the Venture document
    plots: [plotSubSchema], 
    createdAt: { type: Date, default: Date.now }
});

const Venture = mongoose.model('Venture', ventureSchema);
// Note: The separate 'Plot' model is removed since plots are nested in 'Venture'.

// --- Helper Function for Mapping Files ---
// This function maps dynamically named files from Multer back to the plot objects
const mapUploadedFilesToPlots = (plots, files) => {
    if (!files) return plots;
    
    return plots.map(plot => {
        const plotNumber = plot.plotNumber;
        
        // 1. Map document file (fieldname: plot_documents_N)
        const documentFile = files.find(file => file.fieldname === `plot_documents_${plotNumber}`);
        if (documentFile) {
            plot.documents = documentFile.filename;
        }

        // 2. Map image files (fieldname: plot_images_N_I)
        plot.images = files
            .filter(file => file.fieldname.startsWith(`plot_images_${plotNumber}_`))
            // Sort them to preserve the order they were uploaded/sent by the frontend
            .sort((a, b) => {
                const indexA = parseInt(a.fieldname.split('_').pop());
                const indexB = parseInt(b.fieldname.split('_').pop());
                return indexA - indexB;
            })
            .map(file => file.filename);

        return plot;
    });
};


// --- ROUTES ---

// 2. NEW Combined Route: Create Venture and all nested Plots
// New Combined Route: Create Venture and all nested Plots
app.post('/api/ventures/combined', upload.any(), async (req, res, next) => {
    try {
        // req.files is now an array containing ALL uploaded files
        const uploadedFiles = req.files; 
        
        // 1. Manually separate the static files from the dynamic plot files
        const ventureFiles = {};
        const plotFiles = [];
        
        // Define static fields expected from the venture form
        const staticFields = ['brochure', 'layout', 'units']; // Note: 'units' is body field, not file field
        
        uploadedFiles.forEach(file => {
            if (staticFields.includes(file.fieldname) || file.fieldname === 'highlights') {
                // If it's a known static venture field (brochure, layout, highlights)
                // We map these manually as Multer `fields()` would normally do.
                if (ventureFiles[file.fieldname]) {
                    ventureFiles[file.fieldname].push(file);
                } else {
                    ventureFiles[file.fieldname] = [file];
                }
            } else if (file.fieldname.startsWith('plot_documents_') || file.fieldname.startsWith('plot_images_')) {
                // If it's a dynamic plot field, add it to the plotFiles array
                plotFiles.push(file);
            }
            // Any other field is ignored here, preventing 'Unexpected field' errors.
        });
        

        // 2. Map Venture Data (using the manually separated files)
        const ventureData = {
            name: req.body.name,
            location: req.body.location,
            registered: req.body.registered || '',
            approvedBy: req.body.approvedBy || '',
            googleMapLink: req.body.googleMapLink || '',
            units: parseInt(req.body.units) || 0,
            
            // Map the manually filtered files
            brochure: ventureFiles.brochure ? ventureFiles.brochure[0].filename : null,
            layout: ventureFiles.layout ? ventureFiles.layout[0].filename : null,
            highlights: ventureFiles.highlights ? ventureFiles.highlights.map(file => file.filename) : []
        };
        
        if (!ventureData.name || !ventureData.location || !ventureData.units) {
            return res.status(400).json({ message: 'Missing required fields: name, location, and units' });
        }

        // 3. Process Nested Plot Data
        const rawPlots = JSON.parse(req.body.plotsData || '[]');
        
        // Map dynamic plot filenames (from plotFiles) back into the nested plot objects
        ventureData.plots = mapUploadedFilesToPlots(rawPlots, plotFiles);

        const venture = new Venture(ventureData);
        await venture.save();

        res.status(201).json({ 
            message: 'Venture and all plots created successfully', 
            venture: {
                _id: venture._id,
                name: venture.name,
                location: venture.location,
                units: venture.units
            }
        });
    } catch (error) {
        console.error('Error creating combined venture:', error);
        next(error); 
    }
});

// 3. Keep GET /api/ventures (fetching the main document, which now includes plots)
app.get('/api/ventures', async (req, res, next) => {
    try {
        // Since plots are embedded, use .find()
        const ventures = await Venture.find().sort({ createdAt: -1 });
        res.json(ventures);
    } catch (error) {
        next(error);
    }
});
app.get('/api/ventures/:ventureId', async (req, res, next) => {
    try {
        const { ventureId } = req.params;

        // Fetch the venture, explicitly excluding the large 'plots' subdocument array
        const venture = await Venture.findById(ventureId).select('-plots');

        if (!venture) {
            return res.status(404).json({ message: 'Venture details not found' });
        }
        
        // Return the main venture object
        res.json(venture);

    } catch (error) {
        console.error("Error fetching venture details:", error);
        
        // Check for common Mongoose CastError (invalid ID format)
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Venture ID format' });
        }
        
        next(error); // Pass other errors to the Express error handler
    }
});
app.get('/api/ventures/:ventureId/plots', async (req, res, next) => {
    try {
        const venture = await Venture.findById(req.params.ventureId).select('plots');
        
        if (!venture) {
            return res.status(404).json({ message: 'Venture not found' });
        }
        
        // Return only the nested plots array
        res.json(venture.plots.sort((a, b) => a.plotNumber.localeCompare(b.plotNumber, undefined, { numeric: true })));
    } catch (error) {
        next(error);
    }
});
app.post('/api/clients/:id/banner', upload.single('BannerImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No banner image provided' 
      });
    }
    
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }
    
    // Delete old banner if exists
    if (client.bannerImage) {
      const oldBannerPath = path.join(__dirname, '../', client.bannerImage);
      if (fs.existsSync(oldBannerPath)) {
        fs.unlinkSync(oldBannerPath);
      }
    }
    
    // Update client with new banner path
    client.bannerImage = `/uploads/banners/${req.file.filename}`;
    client.updatedAt = Date.now();
    
    const updatedClient = await client.save();
    
    res.json({
      success: true,
      message: 'Banner uploaded successfully',
      client: updatedClient
    });
    
  } catch (error) {
    console.error('Error uploading banner:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error uploading banner',
      error: error.message 
    });
  }
});
app.delete('/api/clients/:id/banner', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }
    
    if (!client.bannerImage) {
      return res.status(400).json({ 
        success: false,
        message: 'No banner exists for this client' 
      });
    }
    
    // Delete banner file
    const bannerPath = path.join(__dirname, '../', client.bannerImage);
    if (fs.existsSync(bannerPath)) {
      fs.unlinkSync(bannerPath);
    }
    
    // Remove banner reference from client
    client.bannerImage = null;
    client.updatedAt = Date.now();
    
    const updatedClient = await client.save();
    
    res.json({
      success: true,
      message: 'Banner removed successfully',
      client: updatedClient
    });
    
  } catch (error) {
    console.error('Error removing banner:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error removing banner',
      error: error.message 
    });
  }
});
app.get('/api/clients/:id/banner', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ 
        success: false,
        message: 'Client not found' 
      });
    }
    
    if (!client.bannerImage) {
      return res.status(404).json({ 
        success: false,
        message: 'No banner found for this client' 
      });
    }
    
    res.json({
      success: true,
      bannerUrl: client.bannerImage
    });
    
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching banner',
      error: error.message 
    });
  }
});


// Keep the health check and error handling middleware (not shown here, but essential)
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});