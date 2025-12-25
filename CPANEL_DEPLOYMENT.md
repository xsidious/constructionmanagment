# cPanel Deployment Guide for Construction Management App

This guide will help you deploy your Next.js application to cPanel hosting with a PostgreSQL database.

## Prerequisites

1. **cPanel Access** with Node.js support enabled
2. **PostgreSQL Database** access in cPanel (or MySQL if PostgreSQL is not available)
3. **SSH Access** (recommended, but not always required)
4. **Domain/Subdomain** configured in cPanel

## Step 1: Check cPanel Node.js Support

1. Log into your cPanel account
2. Look for "Node.js" or "Node.js Selector" in the cPanel interface
3. If available, note the Node.js version (you'll need Node.js 18+ for Next.js 14)

**If Node.js is NOT available:**
- Contact your hosting provider to enable Node.js support
- Consider using a VPS or cloud hosting that supports Node.js
- Alternative: Use a static export (limited functionality)

## Step 2: Database Setup

### Option A: PostgreSQL (Recommended)

1. In cPanel, go to **PostgreSQL Databases**
2. Create a new database:
   - Database name: `construction_db` (or your preferred name)
   - Note the full database name (usually `cpaneluser_dbname`)
3. Create a database user:
   - Username: `construction_user` (or your preferred name)
   - Password: Create a strong password
   - Note the full username (usually `cpaneluser_username`)
4. Add the user to the database with **ALL PRIVILEGES**
5. Note the connection details:
   - Host: Usually `localhost` or provided by hosting
   - Port: Usually `5432`
   - Database name: Full name from step 2
   - Username: Full username from step 3
   - Password: The password you created

### Option B: MySQL (If PostgreSQL not available)

1. In cPanel, go to **MySQL Databases**
2. Create a new database and user (same process as above)
3. You'll need to modify the Prisma schema to use MySQL instead of PostgreSQL

## Step 3: Prepare Your Application

### 3.1 Update Prisma Schema (if using MySQL)

If your cPanel only supports MySQL, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"  // Change from "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### 3.2 Create Production Build Script

Create a file `build.sh` in your project root:

```bash
#!/bin/bash
# Build script for cPanel deployment

echo "Installing dependencies..."
npm install --production=false

echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma db push --skip-generate

echo "Building Next.js application..."
npm run build

echo "Build complete!"
```

Make it executable:
```bash
chmod +x build.sh
```

### 3.3 Update package.json Scripts

Ensure your `package.json` has these scripts:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "next start",
    "dev": "next dev"
  }
}
```

## Step 4: Upload Files to cPanel

### Method 1: Using cPanel File Manager

1. Log into cPanel
2. Navigate to **File Manager**
3. Go to your domain's root directory (usually `public_html` or `subdomain_name`)
4. Create a folder for your app (e.g., `construction-app`)
5. Upload all project files EXCEPT:
   - `node_modules/` (don't upload, will install on server)
   - `.next/` (will be generated)
   - `.env.local` (create on server)
   - `.git/` (optional)

**Files to upload:**
- All source files (`app/`, `components/`, `lib/`, etc.)
- `package.json`, `package-lock.json`
- `next.config.js`
- `prisma/` folder
- `public/` folder
- `tailwind.config.ts`
- `tsconfig.json`
- `.env.example` (as reference)

### Method 2: Using Git (Recommended if SSH available)

1. In cPanel, go to **Git Version Control**
2. Create a new repository
3. Clone your GitHub repository:
   ```bash
   git clone https://github.com/xsidious/constructionmanagment.git
   ```
4. Or use SSH if configured

### Method 3: Using FTP/SFTP

Use an FTP client like FileZilla:
- Host: Your cPanel FTP host
- Username: Your cPanel username
- Password: Your cPanel password
- Port: 21 (FTP) or 22 (SFTP)

## Step 5: Configure Environment Variables

1. In cPanel File Manager, navigate to your app directory
2. Create a `.env.local` file (or `.env` for production)
3. Add your environment variables:

```env
# Database Connection
# Example format: postgresql://username:password@host:port/database
DATABASE_URL="postgresql://eraba_eraba_constructiondb:eraba_eraba_constructiondb@localhost:5432/eraba_eraba_constructiondb"
DIRECT_URL="postgresql://eraba_eraba_constructiondb:eraba_eraba_constructiondb@localhost:5432/eraba_eraba_constructiondb"

# NextAuth
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="https://yourdomain.com"

# Node Environment
NODE_ENV="production"

# File Upload (adjust paths for cPanel)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"
```

**Important Notes:**
- Replace `localhost` with your actual database host if different
- Replace `5432` with your actual PostgreSQL port if different
- Replace `yourdomain.com` with your actual domain
- Generate a secure `AUTH_SECRET` using: `openssl rand -base64 32`

**Generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

## Step 6: Install Dependencies and Build

### Option A: Using cPanel Node.js Selector

1. In cPanel, go to **Node.js Selector**
2. Click **Create Application**
3. Configure:
   - **Node.js version**: 18.x or 20.x
   - **Application mode**: Production
   - **Application root**: `/home/username/construction-app`
   - **Application URL**: Your domain/subdomain
   - **Application startup file**: `server.js` (create this)
   - **Application port**: Auto-assigned
4. In **Application startup file**, create `server.js`:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
```

5. Click **Run NPM Install** in Node.js Selector
6. After installation, run build commands via SSH or terminal

### Option B: Using SSH (if available)

1. Connect via SSH to your cPanel account
2. Navigate to your app directory:
   ```bash
   cd ~/construction-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Run database migrations:
   ```bash
   npx prisma db push
   ```
6. Build the application:
   ```bash
   npm run build
   ```

## Step 7: Database Migration

Run Prisma migrations to set up your database schema:

```bash
# Via SSH or cPanel terminal
cd ~/construction-app
npx prisma db push
```

Or if you have migration files:
```bash
npx prisma migrate deploy
```

## Step 8: Seed Database (Optional)

If you have seed data:

```bash
node prisma/seed.js
```

Or create users:
```bash
node scripts/create-all-users.js
```

## Step 9: Configure Application

### 9.1 Update next.config.js

Ensure your `next.config.js` is production-ready:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For better cPanel compatibility
  // Or use 'export' for static export (limited features)
};

module.exports = nextConfig;
```

### 9.2 Create .htaccess (if needed)

If using Apache, create `.htaccess` in your app root:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:PORT/$1 [P,L]
```

Replace `PORT` with your Node.js app port from cPanel Node.js Selector.

## Step 10: Start the Application

### Using cPanel Node.js Selector:

1. Go to **Node.js Selector**
2. Find your application
3. Click **Restart Application**
4. Check logs for any errors

### Using SSH:

```bash
cd ~/construction-app
npm start
```

Or use PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "construction-app" -- start
pm2 save
pm2 startup
```

## Step 11: Verify Deployment

1. Visit your domain/subdomain
2. Check if the application loads
3. Test login functionality
4. Verify database connections
5. Check file uploads (ensure uploads directory has write permissions)

## Troubleshooting

### Issue: Application won't start

**Solutions:**
- Check Node.js version (need 18+)
- Verify all dependencies installed
- Check `.env.local` file exists and has correct values
- Review application logs in cPanel

### Issue: Database connection failed

**Solutions:**
- Verify database credentials in `.env.local`
- Check database user has proper permissions
- Ensure database host is correct (might be `localhost` or specific host)
- Test connection using cPanel's database tools

### Issue: 500 Internal Server Error

**Solutions:**
- Check application logs
- Verify all environment variables are set
- Ensure Prisma Client is generated (`npx prisma generate`)
- Check file permissions (uploads directory needs write access)

### Issue: Static files not loading

**Solutions:**
- Verify `public/` folder is uploaded
- Check file permissions
- Clear browser cache
- Verify Next.js build completed successfully

### Issue: Build fails

**Solutions:**
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Check disk space quota
- Review build logs for specific errors

## File Permissions

Set proper permissions via SSH or File Manager:

```bash
# Make directories writable
chmod 755 uploads
chmod 755 .next

# Make scripts executable
chmod +x build.sh
```

## Maintenance

### Updating the Application

1. Upload new files (or pull from Git)
2. Run `npm install` to update dependencies
3. Run `npx prisma generate` if schema changed
4. Run `npx prisma db push` if database schema changed
5. Run `npm run build` to rebuild
6. Restart the application

### Backing Up

1. **Database Backup**: Use cPanel's backup tool or:
   ```bash
   pg_dump -U username -d database_name > backup.sql
   ```

2. **File Backup**: Download via File Manager or:
   ```bash
   tar -czf app-backup.tar.gz ~/construction-app
   ```

## Alternative: Static Export (Limited Features)

If Node.js is not available, you can create a static export:

1. Update `next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
};
```

2. Build:
```bash
npm run build
```

3. Upload `out/` folder contents to `public_html`

**Limitations:**
- No API routes
- No server-side features
- No dynamic routes with `getServerSideProps`
- Authentication will be limited

## Recommended Hosting Providers for Node.js

If cPanel doesn't support Node.js well, consider:
- **Vercel** (easiest for Next.js)
- **Netlify**
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **AWS Amplify**
- **Heroku** (paid)

## Security Considerations

1. **Never commit `.env.local`** to Git
2. **Use strong passwords** for database
3. **Keep dependencies updated**
4. **Enable HTTPS** via cPanel SSL/TLS
5. **Restrict file permissions**
6. **Regular backups**

## Support

If you encounter issues:
1. Check cPanel error logs
2. Check application logs in Node.js Selector
3. Verify all environment variables
4. Test database connection separately
5. Contact hosting provider support

---

**Note**: cPanel Node.js support varies by hosting provider. Some providers have excellent Node.js support, while others may have limitations. Always check with your hosting provider about Node.js capabilities before deployment.

