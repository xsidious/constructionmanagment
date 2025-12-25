'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Moon, Sun, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/providers/theme-provider';
import { CompanySwitcher } from './company-switcher';
import { Search } from '@/components/ui/search';
import { MobileSidebar } from './mobile-sidebar';
import { Logo } from '@/components/ui/logo';

export function Header() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <header className="flex flex-col bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <MobileSidebar />
          <div className="hidden md:block">
            <Logo size="sm" showText={true} />
          </div>
          {session?.companyId && <CompanySwitcher />}
          <div className="flex-1 max-w-md hidden sm:block">
            <Search />
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative hidden sm:flex"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative hidden sm:flex"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold shadow-sm">
                  {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="h-px bg-gray-200"></div>
    </header>
  );
}
