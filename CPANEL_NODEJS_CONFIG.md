# cPanel Node.js Selector Configuration

## Your Project Location
- **Path**: `public_html/constructionnode`
- **Full Path**: `/home/eraba/public_html/constructionnode` (replace `eraba` with your cPanel username)
- **Domain**: Your primary domain (root)

## Node.js Selector Configuration

When creating your Node.js application in cPanel, use these settings:

### 1. Node.js Version
- **Select**: `18.x` or `20.x` (recommended: `20.x` if available)
- **⚠️ CRITICAL**: Next.js 14 requires Node.js 18.0.0 or higher
- **If only Node.js 16.x is available**: You have two options:
  1. **Contact your hosting provider** to upgrade Node.js to version 18+
  2. **Use alternative hosting** (see solutions below)

### 2. Application Mode
- **Select**: `Production`
- This ensures optimal performance and error handling

### 3. Application Root
- **Enter**: `/home/eraba/public_html/constructionnode`
- Replace `eraba` with your actual cPanel username
- This is the full path to your project folder

**To find your exact path:**
1. In cPanel File Manager, navigate to `public_html/constructionnode`
2. Look at the path shown in the address bar
3. It will show something like: `/home/username/public_html/constructionnode`

### 4. Application URL
- **Enter**: Your primary domain (e.g., `yourdomain.com` or `www.yourdomain.com`)
- Since `constructionnode` is the root for your primary domain, use just the domain
- **Do NOT include** `/constructionnode` in the URL
- Examples:
  - `https://yourdomain.com`
  - `https://www.yourdomain.com`
  - Use the exact domain that points to your primary domain

### 5. Application Startup File
- **Enter**: `server.js`
- This file already exists in your project root
- Make sure `server.js` is in the `constructionnode` folder

### 6. Application Port
- **Leave as**: Auto-assigned (cPanel will assign a port automatically)
- You don't need to specify this manually

## Complete Configuration Summary

```
Node.js Version: 20.x (or 18.x)
Application Mode: Production
Application Root: /home/YOUR_USERNAME/public_html/constructionnode
Application URL: https://yourdomain.com
Application Startup File: server.js
Application Port: (Auto-assigned)
```

## Environment Variables in Node.js Selector

After creating the application, you'll need to add environment variables:

1. Click on your application in Node.js Selector
2. Look for **Environment Variables** or **.env** section
3. Add these variables:

```
DATABASE_URL=postgresql://eraba_eraba_constructiondb:eraba_eraba_constructiondb@localhost:5432/eraba_eraba_constructiondb
DIRECT_URL=postgresql://eraba_eraba_constructiondb:eraba_eraba_constructiondb@localhost:5432/eraba_eraba_constructiondb
AUTH_SECRET=XtnLfABPQ9Jf9lAt6+3mfj9Gz1Hk8jehykFdBEV0Ixs=
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**Important**: Replace `yourdomain.com` with your actual domain name.

## After Configuration

1. **Run NPM Install**: Click the "Run NPM Install" button in Node.js Selector
2. **Wait for installation** to complete (may take several minutes)
3. **Run build commands** via SSH or Terminal:
   ```bash
   cd ~/public_html/constructionnode
   npx prisma generate
   npx prisma db push
   npm run build
   ```
4. **Start/Restart Application**: Click "Restart Application" in Node.js Selector

## Verifying Your Setup

1. Check that `server.js` exists in `public_html/constructionnode/`
2. Verify all files are uploaded to `constructionnode` folder
3. Ensure `.env.local` file exists (or environment variables are set in Node.js Selector)
4. Check application logs in Node.js Selector for any errors

## ⚠️ IMPORTANT: Node.js Version Issue

### Problem: Only Node.js 16.20.2 Available

If your cPanel only offers Node.js 16.20.2, **Next.js 14 will NOT work** because it requires Node.js 18+.

### Solutions:

#### Option 1: Request Node.js Upgrade (Recommended)
1. **Contact your hosting provider** support
2. Request Node.js 18.x or 20.x to be added to cPanel
3. Many providers can add newer versions upon request
4. This is the best solution if you want to stay on cPanel

#### Option 2: Use Alternative Hosting
Since cPanel Node.js support is limited, consider these alternatives:

**Best Options for Next.js:**
- **Vercel** (Free tier available, easiest for Next.js)
- **Railway** (Easy deployment, good pricing)
- **Render** (Free tier available)
- **Netlify** (Good for Next.js)
- **DigitalOcean App Platform** (Simple deployment)

**Why these are better:**
- Automatic Node.js 18+ support
- Built-in CI/CD
- Easy environment variable management
- Better performance
- Automatic SSL

#### Option 3: Downgrade Next.js (Not Recommended)
You could downgrade to Next.js 13, but you'll lose features and it's not recommended.

**Steps if downgrading:**
```bash
npm install next@13 react@18 react-dom@18
```

**Limitations:**
- Missing Next.js 14 features
- May have compatibility issues
- Not a long-term solution

#### Option 4: Use VPS with cPanel Alternative
- Get a VPS (DigitalOcean, Linode, etc.)
- Install Node.js 20 manually
- Use PM2 for process management
- More control but requires server management

### Recommended Action

**If you can't get Node.js 18+ on cPanel:**
1. **Deploy to Vercel** (easiest, free tier)
   - Connect your GitHub repo
   - Automatic deployments
   - Free SSL
   - Node.js 20 by default

2. **Or use Railway/Render** for similar ease

3. **Keep cPanel for database only** if needed
   - Use cPanel PostgreSQL
   - Connect from Vercel/Railway using external database URL

## Troubleshooting

### If application won't start:
- Verify the Application Root path is correct
- Check that `server.js` exists in the root folder
- Review application logs in Node.js Selector
- Ensure all environment variables are set

### If you get 404 errors:
- Verify Application URL matches your actual domain
- Check that your domain is pointing to the correct directory
- Ensure the application is running (green status in Node.js Selector)

### If database connection fails:
- Verify database credentials in environment variables
- Check that database host is `localhost` (or correct host)
- Ensure database user has proper permissions

