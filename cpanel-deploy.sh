#!/bin/bash
# Deployment script for cPanel
# Run this script after uploading files to cPanel

echo "========================================="
echo "Construction Management App - cPanel Deployment"
echo "========================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js via cPanel Node.js Selector"
    exit 1
fi

echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install dependencies
echo ""
echo "Step 1: Installing dependencies..."
npm install --production=false

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

# Generate Prisma Client
echo ""
echo "Step 2: Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to generate Prisma Client"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo ""
    echo "WARNING: .env.local file not found!"
    echo "Please create .env.local with your database credentials and AUTH_SECRET"
    echo ""
    echo "Example .env.local:"
    echo "DATABASE_URL=\"postgresql://user:password@localhost:5432/dbname\""
    echo "DIRECT_URL=\"postgresql://user:password@localhost:5432/dbname\""
    echo "AUTH_SECRET=\"your-secret-here\""
    echo "NEXTAUTH_URL=\"https://yourdomain.com\""
    echo "NODE_ENV=\"production\""
    exit 1
fi

# Run database migrations
echo ""
echo "Step 3: Running database migrations..."
npx prisma db push --skip-generate

if [ $? -ne 0 ]; then
    echo "WARNING: Database migration failed. Please check your DATABASE_URL"
    echo "You may need to run: npx prisma db push"
fi

# Build the application
echo ""
echo "Step 4: Building Next.js application..."
npm run build

if [ $? -ne 0 ]; then
    echo "ERROR: Build failed"
    exit 1
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo ""
    echo "Step 5: Creating uploads directory..."
    mkdir -p uploads
    chmod 755 uploads
fi

echo ""
echo "========================================="
echo "Deployment completed successfully!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Ensure your Node.js application is configured in cPanel Node.js Selector"
echo "2. Set the startup file to: server.js"
echo "3. Restart your application in Node.js Selector"
echo "4. Visit your domain to verify the application is running"
echo ""

