'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
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
  Clock,
  Wrench,
  DollarSign,
  UserCog,
  Calendar,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { hasPermission } from '@/lib/permissions';
import { Role } from '@prisma/client';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: null },
  { name: 'Calendar', href: '/calendar', icon: Calendar, permission: null },
  { name: 'Projects', href: '/projects', icon: FolderKanban, permission: null },
  { name: 'Customers', href: '/customers', icon: Users, permission: null },
  { name: 'Jobs', href: '/jobs', icon: Briefcase, permission: null },
  { name: 'Time Tracking', href: '/time-tracking', icon: Clock, permission: null },
  { name: 'Quotes', href: '/quotes', icon: FileText, permission: null },
  { name: 'Invoices', href: '/invoices', icon: Receipt, permission: null },
  { name: 'Materials', href: '/materials', icon: Package, permission: null },
  { name: 'Equipment', href: '/equipment', icon: Wrench, permission: null },
  { name: 'Expenses', href: '/expenses', icon: DollarSign, permission: null },
  { name: 'Subcontractors', href: '/subcontractors', icon: UserCog, permission: null },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart, permission: null },
  { name: 'Companies', href: '/companies', icon: Building2, permission: null },
  { name: 'Admin', href: '/admin', icon: Shield, permission: 'admin:access' as const },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Close sidebar when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true;
    if (!session?.role) return false;
    return hasPermission(session.role as Role, item.permission);
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 overflow-y-auto">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h1 className="text-xl font-bold text-white">Menu</h1>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {filteredNavigation.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const isAdmin = item.permission === 'admin:access';
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? isAdmin
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : isAdmin
                      ? 'text-gray-700 hover:bg-yellow-50'
                      : 'text-gray-700 hover:bg-blue-50'
                  )}
                >
                  <item.icon className={cn('h-5 w-5', isActive ? 'text-white' : isAdmin ? 'text-yellow-600' : 'text-gray-500')} />
                  {item.name}
                  {isAdmin && (
                    <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Admin</span>
                  )}
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
      </SheetContent>
    </Sheet>
  );
}

