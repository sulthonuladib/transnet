import { createMiddleware } from 'hono/factory';
// Simple JWT implementation for now
function sign(payload: any, secret: string): string {
  // This is a basic implementation - in production use proper JWT library
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  const signature = btoa(`${header}.${body}.${secret}`).slice(0, 10);
  return `${header}.${body}.${signature}`;
}

function verify(token: string, secret: string): any {
  // Basic verification - in production use proper JWT library
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');

  const payload = JSON.parse(atob(parts[1]!));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}
import { db, users, organizations, type User, type Organization } from '../database';
import { eq } from 'drizzle-orm';
import { getUserWithOrganization } from './utils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthContext {
  user: User;
  organization: Organization | null;
}

// JWT authentication middleware
export const authMiddleware = createMiddleware<{ Variables: AuthContext }>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '') ||
    await c.req.raw.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1];

  if (!token) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET);
    const userId = payload.sub as string;

    const userWithOrg = await getUserWithOrganization(userId);

    if (!userWithOrg || !userWithOrg.user.isActive) {
      return c.json({ error: 'User not found or inactive' }, 401);
    }

    c.set('user', userWithOrg.user);
    c.set('organization', userWithOrg.organization || null);
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Optional auth middleware (doesn't fail if no token)
export const optionalAuthMiddleware = createMiddleware<{ Variables: Partial<AuthContext> }>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '') ||
    await c.req.raw.headers.get('Cookie')?.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1];

  if (token) {
    try {
      const payload = await verify(token, JWT_SECRET);
      const userId = payload.sub as string;

      const userWithOrg = await getUserWithOrganization(userId);

      if (userWithOrg && userWithOrg.user.isActive) {
        c.set('user', userWithOrg.user);
        c.set('organization', userWithOrg.organization || null);
      }
    } catch {
      // Ignore invalid tokens in optional middleware
    }
  }

  await next();
});

// Generate JWT token
export function generateToken(userId: string): string {
  return sign({ sub: userId, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }, JWT_SECRET); // 7 days
}
