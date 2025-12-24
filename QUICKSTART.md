# Quick Start Guide

## 🚀 Run Everything in Docker (Easiest Way)

### Step 1: Start the Application

**On Windows:**
```bash
scripts\docker-setup.bat
```

**On Linux/Mac:**
```bash
./scripts/docker-setup.sh
```

**Or manually:**
```bash
docker-compose up -d --build
```

### Step 2: Wait for Services

The setup script will:
- Build the Docker containers
- Start PostgreSQL database
- Generate Prisma Client
- Run database migrations
- Start the Next.js application

### Step 3: Access the Application

- **Application:** http://localhost:3000
- **Database:** localhost:5432

### Step 4: Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign up" or go to http://localhost:3000/register
3. Create your account
4. Log in and create your first company

## 📋 Common Commands

### View Logs
```bash
docker-compose logs -f app
```

### Stop Containers
```bash
docker-compose down
```

### Restart Containers
```bash
docker-compose restart
```

### Access Database
```bash
docker-compose exec postgres psql -U construction_user -d construction_management
```

### Run Prisma Studio
```bash
docker-compose exec app npx prisma studio
```

### Reset Everything
```bash
docker-compose down -v
docker-compose up -d --build
```

## 🔧 Troubleshooting

### Port Already in Use
If port 3000 or 5432 is already in use:
1. Stop the conflicting service
2. Or change ports in `docker-compose.yml`

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues
```bash
# Check if PostgreSQL is ready
docker-compose exec postgres pg_isready -U construction_user

# View database logs
docker-compose logs postgres
```

### Application Errors
```bash
# View application logs
docker-compose logs -f app

# Restart the app container
docker-compose restart app
```

## 🎯 Next Steps

1. Create your account
2. Create your first company
3. Add customers
4. Create projects
5. Start managing your construction business!

For more details, see [README.md](README.md) and [README.Docker.md](README.Docker.md)

