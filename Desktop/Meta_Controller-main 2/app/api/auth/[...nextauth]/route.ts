import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { findUserByEmail, createUser, verifyPassword, incrementLoginAttempts, resetLoginAttempts, updateUser } from '@/lib/db-service';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),

    // Credentials Provider (for demo/testing without OAuth)
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          console.log('🔐 Login attempt for:', credentials.email);
          
          // First check employees collection
          const employee = await db.employees.getByEmail(credentials.email);
          console.log('👤 Employee found:', employee ? 'YES' : 'NO');
          
          if (employee) {
            console.log('📋 Employee status:', employee.status);
            console.log('🔑 Has passwordHash:', !!employee.passwordHash);
            console.log('🔒 Password hash (first 20 chars):', employee.passwordHash?.substring(0, 20));
          }
          
          if (employee && employee.passwordHash) {
            // Check if account is suspended
            if (employee.status === 'suspended') {
              console.log('❌ Account suspended');
              throw new Error('Account is suspended. Contact administrator.');
            }

            // Check if account is inactive
            if (employee.status === 'inactive') {
              console.log('❌ Account inactive');
              throw new Error('Account is inactive. Contact administrator.');
            }

            // Check if account is locked
            if (employee.lockedUntil && new Date() < new Date(employee.lockedUntil)) {
              console.log('🔒 Account locked until:', employee.lockedUntil);
              throw new Error('Account is temporarily locked. Try again later.');
            }

            console.log('🔐 Verifying password...');
            // Verify password
            const isValid = await bcrypt.compare(credentials.password, employee.passwordHash);
            console.log('✅ Password valid:', isValid);
            
            if (!isValid) {
              console.log('❌ Invalid password, incrementing attempts');
              // Increment login attempts
              const attempts = (employee.loginAttempts || 0) + 1;
              await db.employees.update(employee.id, { 
                loginAttempts: attempts,
                lockedUntil: attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null
              });
              return null;
            }

            console.log('✅ Login successful, updating employee record');
            // Reset login attempts and update last login on successful login
            await db.employees.update(employee.id, { 
              loginAttempts: 0,
              lockedUntil: null,
              lastLogin: new Date().toISOString()
            });

            console.log('✅ Returning employee user object');
            return {
              id: employee.id,
              email: employee.email,
              name: employee.name,
              image: undefined,
              role: employee.role,
              companyId: employee.companyId
            };
          }

          console.log('👥 Checking users collection...');
          // Fallback to users collection (existing OAuth users)
          const user = await findUserByEmail(credentials.email);
          
          if (!user) {
            console.log('❌ User not found in either collection');
            return null;
          }

          // Check if account is locked
          if (user.lockedUntil && new Date() < user.lockedUntil) {
            throw new Error('Account is temporarily locked. Try again later.');
          }

          // Verify password
          if (user.passwordHash) {
            const isValid = await verifyPassword(credentials.password, user.passwordHash);
            
            if (!isValid) {
              await incrementLoginAttempts(user._id!);
              return null;
            }

            // Reset login attempts on successful login
            await resetLoginAttempts(user._id!);

            return {
              id: user._id!.toString(),
              email: user.email,
              name: user.name,
              image: user.image,
              role: user.role,
              companyId: user.companyId
            };
          }

          return null;
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Auto-create user from OAuth if doesn't exist
      if (account?.provider === 'google' && user.email) {
        let dbUser = await findUserByEmail(user.email);
        
        // Helper to generate company ID
        const generateCompanyId = (email: string) => {
          const domain = email.split('@')[1];
          return domain === 'gmail.com' ? `company_${Math.random().toString(36).substr(2, 9)}` : domain.split('.')[0];
        };

        if (!dbUser) {
          // Determine role based on email
          let role: 'admin' | 'engineer' | 'operator' | 'viewer' = 'viewer';
          
          // Make specific email admin or first user admin
          if (user.email === 'kshaktisingh111@gmail.com') {
            role = 'admin';
          } else if (user.email.includes('admin')) {
            role = 'admin';
          } else if (user.email.includes('engineer')) {
            role = 'engineer';
          } else if (user.email.includes('operator')) {
            role = 'operator';
          } else {
            // Make first user admin
            const users = await findUserByEmail(''); // Get any user to check if DB is empty
            role = 'admin'; // Default to admin for early users
          }

          const companyId = generateCompanyId(user.email);

          await createUser({
            email: user.email,
            name: user.name || user.email,
            image: user.image || undefined,
            role,
            googleId: user.id,
            companyId: companyId
          });
        } else if (!dbUser.companyId) {
          // MIGRATION: Assign companyId to existing users who don't have one
          const companyId = generateCompanyId(user.email);
          console.log(`Migrating user ${user.email} to company ${companyId}`);
          await updateUser(dbUser._id!, { companyId });
        }
      }
      
      return true;
    },

    async jwt({ token, user, account }) {
      // Add user info to token on sign in
      if (user) {
        // Initialize with user data (from authorize)
        if ((user as any).companyId) {
          token.companyId = (user as any).companyId;
        }

        const dbUser = await findUserByEmail(user.email!);

        if (dbUser) {
          token.id = dbUser._id!.toString();
          token.role = dbUser.role;
          token.department = dbUser.department;
          token.companyId = dbUser.companyId;
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      // Add user info to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.department = token.department as string;
        (session.user as any).companyId = token.companyId as string;
      }
      
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to machines page after login
      if (url === baseUrl || url === `${baseUrl}/`) {
        return `${baseUrl}/machines`;
      }
      // Allow callback URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl;
    }
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET || 'metacontroller-secret-key-change-in-production',

  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
