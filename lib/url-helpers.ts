/**
 * Get the base URL for the application
 * Works in both server and client environments
 */
export function getBaseUrl(): string {
  // Client-side: use window.location
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // Server-side: use environment variable or default
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Fallback for development
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  // Production fallback (should never reach here if env vars are set)
  return 'https://your-app.vercel.app';
}

/**
 * Create an absolute URL from a relative path
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getBaseUrl();
  // Remove trailing slash from baseUrl and leading slash from path, then combine
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

