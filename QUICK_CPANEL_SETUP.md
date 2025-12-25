# Quick cPanel Setup Guide

## Your Database Credentials

Based on your cPanel setup:
- **Username**: `eraba_eraba_constructiondb`
- **Database**: `eraba_eraba_constructiondb`
- **Password**: `eraba_eraba_constructiondb`
- **Host**: `localhost` (usually, check your cPanel)
- **Port**: `5432` (default PostgreSQL port)

## Step 1: Create .env.local File

Create a `.env.local` file in your project root with these contents:

```env
# Database Connection
DATABASE_URL="postgresql://eraba_eraba_constructiondb:eraba_eraba_constructiondb@localhost:5432/eraba_eraba_constructiondb"
DIRECT_URL="postgresql://eraba_eraba_constructiondb:eraba_eraba_constructiondb@localhost:5432/eraba_eraba_constructiondb"

# NextAuth - Secure secret (already generated)
AUTH_SECRET="XtnLfABPQ9Jf9lAt6+3mfj9Gz1Hk8jehykFdBEV0Ixs="
# Replace with your actual primary domain (e.g., https://yourdomain.com)
NEXTAUTH_URL="https://yourdomain.com"

# Node Environment
NODE_ENV="production"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760"
```

## Step 2: Generate AUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it as the value for `AUTH_SECRET` in your `.env.local` file.

## Step 3: Update NEXTAUTH_URL

**IMPORTANT**: Since your project is in `public_html/constructionnode` and it's the root for your primary domain:

Replace `https://yourdomain.com` with your **actual primary domain name**.

Examples:
- If your domain is `example.com`, use: `https://example.com`
- If you use www, use: `https://www.example.com`
- Use the exact domain that points to your `constructionnode` folder

**Do NOT include `/constructionnode` in the URL** - just use your domain name.

## Step 4: Verify Database Connection

In cPanel:
1. Go to **PostgreSQL Databases**
2. Verify your database `eraba_eraba_constructiondb` exists
3. Verify user `eraba_eraba_constructiondb` has access to the database
4. Check the host (might be `localhost` or a specific host provided by your hosting)

## Step 5: Test Connection (Optional)

If you have SSH access, you can test the connection:

```bash
psql -h localhost -U eraba_eraba_constructiondb -d eraba_eraba_constructiondb
```

## Common Issues

### If connection fails:

1. **Check the host**: It might not be `localhost`. Check your cPanel PostgreSQL Databases page for the actual host.

2. **Check the port**: Default is `5432`, but your hosting might use a different port.

3. **Verify credentials**: Double-check username, password, and database name in cPanel.

4. **Check user permissions**: Ensure the user has ALL PRIVILEGES on the database.

## Next Steps

After creating `.env.local`:
1. Upload all files to cPanel
2. Run the deployment script: `./cpanel-deploy.sh`
3. Or follow the full guide in `CPANEL_DEPLOYMENT.md`

