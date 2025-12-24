// This route is handled by Socket.IO server
// The actual Socket.IO server is initialized in the Next.js server
export const dynamic = 'force-dynamic';

export async function GET() {
  return new Response('Socket.IO endpoint', { status: 200 });
}

