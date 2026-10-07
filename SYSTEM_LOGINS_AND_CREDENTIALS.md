# 🏢 REMS (ReMAP) Real Estate CRM — Master Login & Access Credentials Guide

This document contains the complete directory of all seeded user accounts, login credentials, role hierarchies, and dashboard URLs created by `backend/seedData.js` / `backend/runSeed.js`.

---

## 🔑 Quick Login Reference Table

All test accounts use the universal password: **`password123`** *(The Admin account also accepts legacy pin: `22446688`)*.

| # | Role | Designation / Name | Email | Password | Dashboard Route |
|---|:---|:---|:---|:---|:---|
| 1 | **Management** (Rank-S) | Akhilesh Sharma | `management@remap.com` | `password123` | `/Management-dashboard` |
| 2 | **Admin** (Rank-AA) | Ravi Verma | `admin@remap-digitalness.com` | `22446688` / `password123` | `/Admin-dashboard` |
| 3 | **Director** (Rank-A) | Karan Kapoor | `director@remap.com` | `password123` | `/Director-dashboard` |
| 4 | **Executive** (Rank-B) | Karan Mehta (Lead) | `executive@remap.com` | `password123` | `/Executive-dashboard` |
| 5 | **Executive** (Rank-B) | Sneha Reddy | `sneha.executive@remap.com` | `password123` | `/Executive-dashboard` |
| 6 | **Executive** (Rank-B) | Rahul Sharma | `rahul.executive@remap.com` | `password123` | `/Executive-dashboard` |
| 7 | **Telecaller** (Rank-C) | Pooja Reddy (Senior) | `telecaller@remap.com` | `password123` | `/Telecaller-dashboard` |
| 8 | **Telecaller** (Rank-C) | Ananya Rao | `ananya.telecaller@remap.com` | `password123` | `/Telecaller-dashboard` |
| 9 | **HR** (Rank-D) | Priya Patel | `hr@remap.com` | `password123` | `/Hr-dashboard` |
| 10 | **Receptionist** (Rank-E) | Anita Desai | `receptionist@remap.com` | `password123` | `/Receptionist-dashboard` |
| 11 | **Driver** (Rank-F) | Rajesh Kumar (Innova Crysta) | `driver@remap.com` | `password123` | `/Driver-dashboard` |
| 12 | **Driver** (Rank-F) | Vikram Singh (Maruti Ertiga) | `vikram.driver@remap.com` | `password123` | `/Driver-dashboard` |
| 13 | **Customer / Client** | Akhilesh Reddy | `customer@remap.com` | `password123` | `/Customer-dashboard` |

---

## 👥 Secondary Client Accounts (Pre-linked Property Portfolios)

These clients have pre-configured property plots, documents, payment receipts, and milestone updates:

| Client Name | Email | Password | Assigned Property | Plot | Status |
|:---|:---|:---|:---|:---|:---|
| **Akhilesh Reddy** | `customer@remap.com` | `password123` | Green Valley Phase 1 | Plot 105 | Active (Phase 3) |
| **Dr. Sandeep Varma** | `sandeep.varma@example.com` | `password123` | Royal Palms County | Plot 201 | Active (Phase 4) |
| **Meenakshi Sundaram** | `meenakshi.s@example.com` | `password123` | Aerocity Prestige | Plot 301 | Active (Phase 2) |

---

## 🛡️ Role Breakdown & Capabilities

### 1. Management (Rank-S)
* **Login**: `management@remap.com` / `password123`
* **Dashboard**: `/Management-dashboard`
* **Privileges**:
  * Complete top-level executive visibility across all branches, ventures, and revenue.
  * Exclusive access to **Hidden Properties** (High-value parcels restricted to Rank-S).
  * System-wide financial metrics, total inventory status, and board-level reporting.
  * Access to all departmental chat channels (`General`, `Sales`, `HR`).

### 2. Admin (Rank-AA)
* **Login**: `admin@remap-digitalness.com` / `22446688` (or `password123`)
* **Dashboard**: `/Admin-dashboard`
* **Privileges**:
  * Full administrative control over user accounts and employee profiles.
  * **Property Approvals**: Review and approve/reject submitted pending properties.
  * System Settings, Staff Directory management (Admins, Directors, Executives, HR, Telecallers, Drivers).
  * Lead management and reassignment, cab booking approvals, and commission audits.

### 3. Director (Rank-A)
* **Login**: `director@remap.com` / `password123`
* **Dashboard**: `/Director-dashboard`
* **Privileges**:
  * Oversees sales campaigns, venture launches, and marketing pipeline.
  * Direct oversight over executives and telecallers.
  * Review site visit schedules, conversion rates, and revenue projections.

### 4. Executive (Rank-B)
* **Logins**: 
  * `executive@remap.com` / `password123`
  * `sneha.executive@remap.com` / `password123`
  * `rahul.executive@remap.com` / `password123`
* **Dashboard**: `/Executive-dashboard`
* **Privileges**:
  * Lead handling (`My Leads`), call logs, follow-up dates, and appointment scheduling.
  * Direct cab booking for client site visits (`Book Cab`).
  * Real estate commissions tracker (`My Commission`).
  * Venture layout explorer with real-time plot availability (`available`, `booked`, `sold`).

### 5. Telecaller (Rank-C)
* **Logins**: 
  * `telecaller@remap.com` / `password123`
  * `ananya.telecaller@remap.com` / `password123`
* **Dashboard**: `/Telecaller-dashboard`
* **Privileges**:
  * Inbound & outbound lead calling pipeline.
  * Call outcome logger (`Interested`, `Follow Up Required`, `Site Visit Requested`, `Not Interested`).
  * Direct appointment scheduling forwarding to Executives.

### 6. HR (Rank-D)
* **Login**: `hr@remap.com` / `password123`
* **Dashboard**: `/Hr-dashboard`
* **Privileges**:
  * **Leave Management**: Review, approve, or reject employee leave requests with status updates.
  * **Staff Attendance**: Daily logs and 7-day attendance distribution charts.
  * **Recruitment Pipeline**: Track candidates from Applied -> Screened -> Interview Scheduled -> Offer Extended.
  * **Termination Requests**: Manage exit documentation and employee offboarding.

### 7. Receptionist (Rank-E)
* **Login**: `receptionist@remap.com` / `password123`
* **Dashboard**: `/Receptionist-dashboard`
* **Privileges**:
  * Front desk visitor registration and **Walk-ins** logging.
  * In-person appointment check-ins.
  * Dispatching visitors to available executives.

### 8. Driver (Rank-F)
* **Logins**: 
  * `driver@remap.com` (Rajesh Kumar - Innova Crysta TS09-EA-4521)
  * `vikram.driver@remap.com` (Vikram Singh - Maruti Ertiga TS07-UB-7788)
* **Dashboard**: `/Driver-dashboard`
* **Privileges**:
  * Site visit trip assignments (`Pending`, `In Progress`, `Completed`).
  * Route tracking, pickup locations, passenger client details, and assigned executive details.

### 9. Customer / Client
* **Login**: `customer@remap.com` / `password123`
* **Dashboard**: `/Customer-dashboard`
* **Privileges**:
  * **My Property**: Detailed overview of purchased plot (Facing, Dimensions, Vaastu, Survey Number).
  * **Documents Vault**: Direct access to Allotment Letters, Payment Receipts, Demarcation Maps.
  * **Phase Progress Updates**: Real-time milestones and site development construction updates.
  * Referral submissions and reward tracking.

---

## 🗄️ Seeded Database Overview

| Collection | Count | Description |
|:---|:---|:---|
| **Users** | 13 | Full system users with bcrypt hashed credentials across all 9 roles |
| **Employees** | 12 | Staff profiles with department, duties, phone, address, and status |
| **Ventures** | 4 | *Green Valley Phase 1*, *Royal Palms County*, *Aerocity Prestige*, *Sunshine Meadows* |
| **Plots** | 30+ | Plots with varied statuses (`available`, `booked`, `sold`), East/West/North facing, Vaastu ratings |
| **Properties** | 4 | 3 HMDA/RERA approved land parcels + 1 **Management-only Hidden Property** |
| **Pending Properties** | 2 | Properties pending Admin/Management approval |
| **Clients** | 3 | Complete client profiles with documents, survey numbers, and phase updates |
| **Leads & Call Logs** | 7 | Real estate leads across `New`, `Contacted`, `Interested`, `Closed`, and `Lost` |
| **Appointments & Walk-ins**| 8 | Site tour bookings and front-desk visitor entries |
| **Cab Bookings** | 4 | Site tour logistics assigned to chauffeurs |
| **Referrals & Commissions**| 4 | Multi-tier commission calculations & rewards |
| **Staff Attendance** | 7 days | Sunday to Saturday attendance entries for HR analytics |
| **Leaves** | 4 | Employee leave applications (`Pending`, `Approved`, `Rejected`) |
| **Recruitment** | 4 | Job applicants across recruitment stages |
| **Department Messages** | 6 | Communication threads in `General`, `Sales`, and `HR` |
| **Notifications** | 5 | System notifications and alerts |

---

## 🚀 How to Run or Re-seed

At any time you wish to reset or refresh all collections to clean test state:

### Method 1: Using the Standalone Runner (Terminal)
```bash
cd backend
node runSeed.js
```

### Method 2: In Browser via HTTP Endpoint
Make sure your backend is running (`http://localhost:5000`), then simply visit:
```
http://localhost:5000/api/seed-all
```
