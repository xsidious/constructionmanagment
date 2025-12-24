# Redirect URL Fixes 🔧

## Problem
The application was redirecting to `localhost:3000` instead of using the actual website URL, especially when logging out.

## ✅ Fixes Applied

### 1. Logout Redirect
- **File:** `components/layout/header.tsx`
- **Change:** Updated `signOut()` to redirect to `/` (landing page) instead of `/login`
- **Before:** `signOut()`
- **After:** `signOut({ callbackUrl: '/', redirect: true })`

### 2. Auth Configuration
- **File:** `lib/auth.ts`
- **Change:** Updated default signOut page to redirect to `/` instead of `/login`
- **Before:** `signOut: '/login'`
- **After:** `signOut: '/'`

### 3. Socket Server URL
- **File:** `lib/socket-server.ts`
- **Change:** Updated to use environment variables with fallback
- **Before:** `origin: process.env.NEXTAUTH_URL || 'http://localhost:3000'`
- **After:** `origin: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '*'`

### 4. Socket Client URL
- **File:** `lib/socket-client.ts`
- **Change:** Updated to use window.location.origin when available
- **Before:** `process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'`
- **After:** Uses `window.location.origin` in browser, falls back to env vars

### 5. URL Helper Utilities
- **File:** `lib/url-helpers.ts` (NEW)
- **Purpose:** Centralized URL handling for both server and client
- **Functions:**
  - `getBaseUrl()` - Gets the base URL from environment or window.location
  - `getAbsoluteUrl(path)` - Creates absolute URLs from relative paths

## 🎯 How It Works Now

### Logout Flow
1. User clicks "Sign out"
2. `signOut()` is called with `callbackUrl: '/'`
3. User is redirected to landing page (`/`)
4. No hardcoded localhost URLs

### URL Resolution Priority
1. **Client-side:** Uses `window.location.origin` (current domain)
2. **Server-side:** Uses `NEXTAUTH_URL` environment variable
3. **Fallback:** Uses `NEXT_PUBLIC_APP_URL` if available
4. **Development:** Falls back to `http://localhost:3000` only in dev mode

## 🔧 Environment Variables

For production, make sure to set:

```env
# Required for production
NEXTAUTH_URL=https://your-app.vercel.app

# Optional but recommended
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SOCKET_URL=https://your-app.vercel.app
```

## ✅ Testing

To verify the fixes:

1. **Logout Test:**
   - Login to the application
   - Click "Sign out"
   - Should redirect to landing page (`/`)
   - Should NOT redirect to `localhost:3000`

2. **Socket Connection:**
   - Socket should connect using current domain
   - No hardcoded localhost URLs

3. **All Redirects:**
   - All redirects should use relative paths or current domain
   - No hardcoded localhost URLs in production

## 📝 Notes

- All redirects now use relative paths (`/`, `/login`, `/dashboard`) which automatically use the current domain
- Environment variables are used for server-side URL resolution
- Client-side code uses `window.location.origin` for dynamic URL resolution
- The application will work correctly on any domain (localhost, Vercel, custom domain)

---

**Status:** ✅ Fixed
**Last Updated:** December 2024

