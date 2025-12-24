import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './prisma';
import { verifyPassword } from './auth-utils';
import { Role } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        // Get user's companies and roles
        const memberships = await prisma.companyMembership.findMany({
          where: { userId: user.id },
          include: { company: true },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          memberships: memberships.map((m) => ({
            companyId: m.companyId,
            companyName: m.company.name,
            role: m.role,
          })),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.memberships = (user as any).memberships || [];
      }

      // Handle company switching
      if (trigger === 'update' && session?.companyId) {
        const membership = (token.memberships as any[])?.find(
          (m: any) => m.companyId === session.companyId
        );
        if (membership) {
          token.companyId = session.companyId;
          token.role = membership.role;
        }
      } else if (!token.companyId && (token.memberships as any[])?.length > 0) {
        // Set default company if not set
        const firstMembership = (token.memberships as any[])[0];
        token.companyId = firstMembership.companyId;
        token.role = firstMembership.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
        };
        session.companyId = token.companyId as string | undefined;
        session.role = token.role as Role | undefined;
        session.memberships = (token.memberships as any[]) || [];
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});

