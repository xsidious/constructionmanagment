import { Role } from '@prisma/client';
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
    };
    companyId?: string;
    role?: Role;
    memberships: Array<{
      companyId: string;
      companyName: string;
      role: Role;
    }>;
  }

  interface User {
    id: string;
    email: string;
    name: string | null;
    memberships: Array<{
      companyId: string;
      companyName: string;
      role: Role;
    }>;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string | null;
    companyId?: string;
    role?: Role;
    memberships: Array<{
      companyId: string;
      companyName: string;
      role: Role;
    }>;
  }
}

