# Client Portal Guide 👥

## ✅ Client Portal Features

### Overview
The client portal allows clients to log in and view their project progress, quotes, and invoices in a dedicated, user-friendly interface.

## 🎯 Features

### 1. Client Dashboard (`/client`)
- **Overview Statistics:**
  - Active projects count
  - Completed projects count
  - Total budget across all projects
  - Pending invoices count

- **Project List:**
  - All projects assigned to the client
  - Progress bars showing completion percentage
  - Project status indicators
  - Budget information
  - Expected completion dates
  - Project phases overview

- **Recent Quotes:**
  - Latest quotes sent to the client
  - Quote status (Draft, Sent, Approved, Rejected)
  - Quote amounts
  - Associated projects

- **Recent Invoices:**
  - Latest invoices
  - Invoice status (Draft, Sent, Paid, Overdue)
  - Due dates
  - Invoice amounts
  - Associated projects

### 2. Project Details (`/client/projects/[id]`)
- **Project Information:**
  - Full project description
  - Current status
  - Progress percentage with visual progress bar
  - Budget information
  - Start and end dates
  - Customer information

- **Project Phases:**
  - All project phases listed in order
  - Phase status indicators
  - Phase timelines (start/end dates)
  - Visual phase tracking

## 🔐 Access Control

### Client Role
- Clients have the `Client` role in the system
- Clients can only see:
  - Projects where they are the customer
  - Quotes sent to them
  - Invoices sent to them
- Clients cannot access:
  - Internal company data
  - Other customers' information
  - Administrative features
  - Time tracking, materials, equipment, etc.

### Navigation
- Clients see only the "Client Portal" link in the sidebar
- Regular dashboard redirects clients to `/client`
- All other navigation items are hidden from clients

## 📋 Setup Instructions

### 1. Create a Customer
First, create a customer in the system with an email address:

```javascript
// Via API or admin interface
POST /api/customers
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### 2. Create a Client User
Use the provided script to create a client user linked to a customer:

```bash
node scripts/create-client-user.js <email> <password> <name> <customer-email>
```

**Example:**
```bash
node scripts/create-client-user.js client@example.com client123 "Client User" john@example.com
```

**Parameters:**
- `email`: The login email for the client user
- `password`: The password for the client user
- `name`: The display name for the client user
- `customer-email`: The email of the customer to link to (must match existing customer)

### 3. Assign Projects to Customer
When creating projects, assign them to the customer:

```javascript
POST /api/projects
{
  "name": "Residential Building",
  "customerId": "<customer-id>",
  "budget": 50000,
  "status": "InProgress",
  ...
}
```

## 🔌 API Endpoints

### Client Projects
- `GET /api/client/projects` - Get all projects for the logged-in client
- `GET /api/client/projects/[id]` - Get specific project details

### Client Quotes
- `GET /api/client/quotes` - Get all quotes for the logged-in client

### Client Invoices
- `GET /api/client/invoices` - Get all invoices for the logged-in client

## 🔒 Security

### Authentication
- Clients must be logged in to access the portal
- All API endpoints verify the user's role and customer association

### Data Isolation
- Clients can only see data associated with their customer record
- Customer lookup is done by matching user email to customer email
- All queries filter by `customerId` to ensure data isolation

## 📱 User Experience

### Client Dashboard
- Clean, professional interface
- Easy-to-read project cards
- Progress indicators
- Quick access to quotes and invoices
- Mobile-responsive design

### Project Details
- Comprehensive project information
- Visual progress tracking
- Phase-by-phase breakdown
- Timeline information
- Budget tracking

## 🎨 Design Features

- **Professional UI:** Clean, modern design
- **Progress Bars:** Visual progress indicators
- **Status Badges:** Color-coded status indicators
- **Responsive Design:** Works on all devices
- **No Hover Animations:** Static, professional appearance

## 📝 Usage Example

1. **Admin creates customer:**
   - Name: "ABC Construction Client"
   - Email: "client@abcconstruction.com"

2. **Admin creates client user:**
   ```bash
   node scripts/create-client-user.js client@abcconstruction.com password123 "ABC Client" client@abcconstruction.com
   ```

3. **Admin creates project:**
   - Assigns project to customer
   - Sets budget, timeline, phases

4. **Client logs in:**
   - Email: `client@abcconstruction.com`
   - Password: `password123`
   - Redirected to `/client` dashboard

5. **Client views:**
   - All their projects
   - Project progress
   - Quotes and invoices
   - Project details and phases

## 🔄 Workflow

1. **Project Creation:** Admin/Manager creates project and assigns to customer
2. **Client Access:** Client logs in and sees project in their dashboard
3. **Progress Updates:** As project progresses, client sees updates in real-time
4. **Quotes/Invoices:** Client can view and track all quotes and invoices
5. **Project Completion:** Client sees completed status and final details

## ✅ Benefits

- **Transparency:** Clients can track project progress in real-time
- **Communication:** Clear view of project status and phases
- **Documentation:** Access to quotes and invoices
- **Professional:** Clean, user-friendly interface
- **Secure:** Data isolation ensures privacy

---

**Status:** ✅ Complete
**Last Updated:** December 2024

