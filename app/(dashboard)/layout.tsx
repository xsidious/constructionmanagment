import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Redirect clients to client portal if they try to access regular dashboard
  if (session?.role === 'Client') {
    // Allow access to client routes
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">{children}</main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">{children}</main>
      </div>
    </div>
  );
}

