'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function CompanySwitcher() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const currentCompany = session?.memberships?.find(
    (m: any) => m.companyId === session.companyId
  );

  const handleSwitchCompany = async (companyId: string) => {
    await updateSession({ companyId });
    router.refresh();
  };

  if (!session?.memberships || session.memberships.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Building2 className="h-4 w-4" />
          <span>{currentCompany?.companyName || 'Select Company'}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {session.memberships.map((membership: any) => (
          <DropdownMenuItem
            key={membership.companyId}
            onClick={() => handleSwitchCompany(membership.companyId)}
            className={membership.companyId === session.companyId ? 'bg-accent' : ''}
          >
            {membership.companyName}
            <span className="ml-2 text-xs text-muted-foreground">
              ({membership.role})
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

