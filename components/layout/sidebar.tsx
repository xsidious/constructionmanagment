'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  Users,
  FolderKanban,
  FileText,
  Receipt,
  Briefcase,
  Package,
  ShoppingCart,
  MessageSquare,
  Clock,
  Wrench,
  DollarSign,
  UserCog,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Time Tracking', href: '/time-tracking', icon: Clock },
  { name: 'Quotes', href: '/quotes', icon: FileText },
  { name: 'Invoices', href: '/invoices', icon: Receipt },
  { name: 'Materials', href: '/materials', icon: Package },
  { name: 'Equipment', href: '/equipment', icon: Wrench },
  { name: 'Expenses', href: '/expenses', icon: DollarSign },
  { name: 'Subcontractors', href: '/subcontractors', icon: UserCog },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
  { name: 'Companies', href: '/companies', icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white/80 backdrop-blur-lg shadow-lg">
      <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <h1 className="text-xl font-bold text-white">Construction Manager</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover-lift',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/30'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-500')} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      {session?.user && (
        <div className="border-t p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold shadow-md">
              {session.user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{session.user.name}</p>
              <p className="text-xs text-gray-600 truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

