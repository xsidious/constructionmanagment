'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  FileText, 
  Receipt, 
  Clock, 
  FolderKanban,
  Users,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickActions = [
  { 
    icon: Plus, 
    label: 'New Project', 
    href: '/projects/new',
    color: 'text-blue-600 bg-blue-50'
  },
  { 
    icon: FileText, 
    label: 'Create Quote', 
    href: '/quotes/new',
    color: 'text-purple-600 bg-purple-50'
  },
  { 
    icon: Receipt, 
    label: 'New Invoice', 
    href: '/invoices/new',
    color: 'text-green-600 bg-green-50'
  },
  { 
    icon: Clock, 
    label: 'Log Time', 
    href: '/time-tracking/new',
    color: 'text-orange-600 bg-orange-50'
  },
  { 
    icon: Users, 
    label: 'Add Customer', 
    href: '/customers/new',
    color: 'text-pink-600 bg-pink-50'
  },
  { 
    icon: Package, 
    label: 'Add Material', 
    href: '/materials/new',
    color: 'text-indigo-600 bg-indigo-50'
  },
];

export function QuickActions() {
  return (
    <Card className="border-2 border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-20 flex-col gap-2 border-2 hover:border-primary/50 bg-white"
                >
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

