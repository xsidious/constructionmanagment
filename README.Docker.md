# Docker Setup for Construction Management System

This guide explains how to run the Construction Management System using Docker.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- At least 4GB of available RAM
- Ports 3000 and 5432 available

## Quick Start

### Development Mode

1. **Start the containers:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

3. **Access the application:**
   - Application: http://localhost:3000
   - Database: localhost:5432

4. **Stop the containers:**
   ```bash
   docker-compose down
   ```

### Production Mode

1. **Create a `.env.prod` file with your production secrets:**
   ```env
   POSTGRES_USER=your_db_user
   POSTGRES_PASSWORD=your_secure_password
   POSTGRES_DB=construction_management
   NEXTAUTH_SECRET=your-nextauth-secret
   JWT_SECRET=your-jwt-secret
   JWT_REFRESH_SECRET=your-refresh-secret
   NEXTAUTH_URL=https://your-domain.com
   ```

2. **Build and start:**
   ```bash
   docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
   ```

## Database Management

### Access the database directly:
```bash
docker-compose exec postgres psql -U construction_user -d construction_management
```

### Run Prisma Studio:
```bash
docker-compose exec app npx prisma studio
```

### Run database migrations:
```bash
docker-compose exec app npx prisma migrate dev
```

### Reset the database:
```bash
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs app`
- Ensure ports 3000 and 5432 are not in use
- Verify Docker has enough resources allocated

### Database connection errors
- Wait for PostgreSQL to be healthy: `docker-compose ps`
- Check database logs: `docker-compose logs postgres`

### Application errors
- Check application logs: `docker-compose logs -f app`
- Verify environment variables are set correctly
- Ensure Prisma Client is generated: `docker-compose exec app npx prisma generate`

### Rebuild containers
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Volumes

Data is persisted in Docker volumes:
- `postgres_data`: Database files
- `uploads_data`: Uploaded files

To remove all data:
```bash
docker-compose down -v
```

## Environment Variables

Key environment variables (set in docker-compose.yml or .env file):

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Secret for NextAuth (generate with: `openssl rand -base64 32`)
- `JWT_SECRET`: Secret for JWT tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `MAX_FILE_SIZE`: Maximum file upload size in bytes (default: 10MB)

## Development Workflow

1. Make code changes in your editor
2. Changes are automatically reflected (hot reload)
3. Database changes require Prisma migration:
   ```bash
   docker-compose exec app npx prisma migrate dev --name your_migration_name
   ```

## Production Deployment

1. Set strong secrets in environment variables
2. Use `docker-compose.prod.yml` for production
3. Set up reverse proxy (nginx/traefik) for HTTPS
4. Configure backup strategy for volumes
5. Set up monitoring and logging

