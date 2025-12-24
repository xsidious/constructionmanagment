# User Creation Guide 👥

## ✅ Created Users

The system now has three types of users ready to use:

### 1. Admin User
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:**
  - Full system access
  - Admin dashboard (`/admin`)
  - All features and modules
  - User management
  - System settings

### 2. Client User
- **Email:** `client@test.com`
- **Password:** `client123`
- **Role:** Client
- **Access:**
  - Client portal (`/client`)
  - View assigned projects
  - View quotes and invoices
  - Project progress tracking
  - Project details and phases

### 3. Contractor User
- **Email:** `contractor@test.com`
- **Password:** `contractor123`
- **Role:** Worker (Contractor)
- **Access:**
  - View projects
  - View assigned jobs
  - Time tracking
  - Chat functionality

## 🚀 Quick Start

### Run the Script
```bash
node scripts/create-all-users.js
```

This script will:
1. ✅ Create/update the demo company
2. ✅ Create admin user with Admin role
3. ✅ Create client user with Client role
4. ✅ Create customer record for the client
5. ✅ Create contractor user with Worker role
6. ✅ Create sample project for the client
7. ✅ Create sample quote and invoice

## 📋 What Gets Created

### Users
- **Admin User** - Full system access
- **Client User** - Client portal access
- **Contractor User** - Worker/contractor access

### Sample Data
- **1 Project:** Residential Building Project (45% complete)
- **4 Project Phases:**
  - Planning (Completed)
  - Foundation (Completed)
  - Framing (In Progress)
  - Finishing (Pending)
- **1 Quote:** Sent to client
- **1 Invoice:** Sent to client

## 🔐 Login Instructions

### Admin Login
1. Go to `/login`
2. Email: `admin@test.com`
3. Password: `admin123`
4. Access: Full dashboard + Admin features

### Client Login
1. Go to `/login`
2. Email: `client@test.com`
3. Password: `client123`
4. Access: Client portal at `/client`
5. Can view: Projects, quotes, invoices

### Contractor Login
1. Go to `/login`
2. Email: `contractor@test.com`
3. Password: `contractor123`
4. Access: Worker dashboard
5. Can view: Projects, jobs, time tracking

## 🎯 User Roles & Permissions

### Admin Role
- ✅ Full system access
- ✅ Admin dashboard
- ✅ User management
- ✅ System settings
- ✅ All CRUD operations

### Client Role
- ✅ View own projects
- ✅ View own quotes
- ✅ View own invoices
- ✅ Project progress tracking
- ❌ No editing capabilities
- ❌ No access to internal data

### Worker/Contractor Role
- ✅ View projects
- ✅ View assigned jobs
- ✅ Log time entries
- ✅ Chat functionality
- ❌ Limited to assigned work
- ❌ No financial data access

## 📁 Script Location

The script is located at:
```
scripts/create-all-users.js
```

## 🔄 Re-running the Script

The script uses `upsert` operations, so it's safe to run multiple times:
- Existing users will be updated
- New users will be created
- Sample data will be created if it doesn't exist

## 🛠️ Customization

To create users with different credentials, edit the script or use individual scripts:

### Create Individual Users
```bash
# Create client user
node scripts/create-client-user.js <email> <password> <name> <customer-email>

# Example:
node scripts/create-client-user.js newclient@example.com pass123 "New Client" newclient@example.com
```

## 📊 Sample Project Details

The script creates a sample project for the client:

- **Name:** Residential Building Project
- **Status:** InProgress
- **Progress:** 45%
- **Budget:** $50,000
- **Phases:** 4 phases with different statuses
- **Timeline:** Started 30 days ago, ends in 60 days

## ✅ Verification

After running the script, you can verify:

1. **Users Created:**
   - Check database or try logging in

2. **Client Access:**
   - Login as client
   - Should see project in `/client` dashboard
   - Should see quote and invoice

3. **Admin Access:**
   - Login as admin
   - Should see all features
   - Should see admin dashboard

4. **Contractor Access:**
   - Login as contractor
   - Should see projects and jobs

## 🔒 Security Notes

- All passwords are hashed using bcrypt
- Users are linked to companies via memberships
- Clients are linked to customers by email matching
- Role-based access control enforced

## 📝 Next Steps

1. **Test Logins:**
   - Try logging in with each user type
   - Verify access levels

2. **Create More Users:**
   - Use the script to create additional users
   - Or use individual creation scripts

3. **Assign Projects:**
   - Create projects and assign to customers
   - Clients will automatically see them

4. **Create Quotes/Invoices:**
   - Create quotes and invoices for customers
   - Clients will see them in their portal

---

**Status:** ✅ Complete
**Last Updated:** December 2024

