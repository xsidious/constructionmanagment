# Construction Management System

A fully self-hosted, production-ready Construction Management System built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

- Multi-tenant SaaS architecture with company-level data isolation
- Role-based access control (Owner, Admin, Manager, Worker, Accountant, Client)
- Customer and project management
- Quotes and invoices with PDF generation
- Real-time chat with Socket.IO
- Material inventory and purchase orders
- Job/work order management
- Analytics dashboard with charts
- File storage and management

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Auth.js (NextAuth) v5 with JWT
- **Real-time:** Socket.IO
- **Charts:** Recharts
- **Animations:** Framer Motion

## Getting Started

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM
- Ports 3000 and 5432 available

### Quick Start with Docker (Recommended)

1. **Clone the repository:**
```bash
git clone <repository-url>
cd ConstructionManagment
```

2. **Start everything with Docker:**
```bash
# Using the setup script (recommended)
./scripts/docker-setup.sh

# Or manually
docker-compose up -d --build
```

3. **Access the application:**
   - Application: http://localhost:3000
   - Database: localhost:5432

4. **View logs:**
```bash
docker-compose logs -f app
```

5. **Stop containers:**
```bash
docker-compose down
```

### Manual Setup (Without Docker)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL with Docker:
```bash
docker-compose up -d postgres
```

4. Run database migrations:
```bash
npm run db:push
# or
npm run db:migrate
```

5. Generate Prisma Client:
```bash
npm run db:generate
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For detailed Docker instructions, see [README.Docker.md](README.Docker.md)

## Docker Deployment

Build and run with Docker:

```bash
docker-compose -f docker-compose.yml up -d
```

## Project Structure

```
├── app/              # Next.js App Router pages and API routes
├── components/       # React components
├── lib/             # Utility functions and configurations
├── prisma/          # Database schema and migrations
├── hooks/           # Custom React hooks
├── uploads/         # File storage (gitignored)
└── public/          # Static assets
```

## License

MIT

