import {
  db,
  users,
  organizations,
  organizationMemberships,
  type NewUser,
  type NewOrganization,
  type NewOrganizationMembership,
} from '../database';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Simple password hashing (in production, use bcrypt or similar)
export function hashPassword(password: string): string {
  // This is a simple hash for demo purposes
  // In production, use bcrypt, argon2, or similar
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(password + 'salt')
    .digest('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Organization management
export async function createOrganization(
  name: string,
  slug: string,
  ownerId: string,
  description?: string
) {
  // Check if slug already exists
  const existingOrg = await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .get();

  if (existingOrg) {
    throw new Error('Organization slug already exists');
  }

  const newOrganization: NewOrganization = {
    name,
    slug,
    ownerId,
    description,
  };

  const result = await db
    .insert(organizations)
    .values(newOrganization)
    .returning();
  return result[0];
}

export async function getOrganizationBySlug(slug: string) {
  return await db
    .select()
    .from(organizations)
    .where(eq(organizations.slug, slug))
    .get();
}

// User registration with optional organization support
export async function registerUser(
  username: string,
  email: string,
  password: string,
  organizationSlug?: string,
  firstName?: string,
  lastName?: string
) {
  // Check if username already exists globally
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .get();

  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Check if email already exists globally
  const existingEmail = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existingEmail) {
    throw new Error('Email already exists');
  }

  let organization = null;
  if (organizationSlug) {
    organization = await getOrganizationBySlug(organizationSlug);
    if (!organization) {
      throw new Error('Organization not found');
    }
  }

  // Create new user
  const newUser: NewUser = {
    username,
    email,
    passwordHash: hashPassword(password),
    firstName,
    lastName,
    currentOrganizationId: organization?.id || null,
  };

  const result = await db.insert(users).values(newUser).returning();
  const user = result[0];

  if (!user) {
    throw new Error('Failed to create user');
  }

  // If organization is provided, create membership
  if (organization && user) {
    const membership: NewOrganizationMembership = {
      userId: user.id,
      organizationId: organization.id,
      role: 'member',
      status: 'active',
    };

    await db.insert(organizationMemberships).values(membership);
  }

  return user;
}

// User login with optional organization support
export async function authenticateUser(
  username: string,
  password: string,
  organizationSlug?: string
) {
  // Find user by username
  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.username, username), eq(users.isActive, true)))
    .get();

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid credentials');
  }

  // If organization is specified, verify user has access to it
  if (organizationSlug) {
    const organization = await getOrganizationBySlug(organizationSlug);
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Check if user is a member of this organization
    const membership = await db
      .select()
      .from(organizationMemberships)
      .where(
        and(
          eq(organizationMemberships.userId, user.id),
          eq(organizationMemberships.organizationId, organization.id),
          eq(organizationMemberships.status, 'active')
        )
      )
      .get();

    if (!membership) {
      throw new Error('User is not a member of this organization');
    }

    // Update user's current organization
    await db
      .update(users)
      .set({
        currentOrganizationId: organization.id,
        lastLoginAt: new Date(),
      })
      .where(eq(users.id, user.id));
  } else {
    // Update last login without changing organization
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));
  }

  return user;
}

// Helper to get user with current organization details
export async function getUserWithOrganization(userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId)).get();

  if (!user) {
    return null;
  }

  // If user has a current organization, get it
  let organization = null;
  if (user.currentOrganizationId) {
    organization = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, user.currentOrganizationId))
      .get();
  }

  return {
    user,
    organization,
  };
}

// Helper to get all organizations a user belongs to
export async function getUserOrganizations(userId: string) {
  const memberships = await db
    .select({
      membership: organizationMemberships,
      organization: organizations,
    })
    .from(organizationMemberships)
    .innerJoin(
      organizations,
      eq(organizationMemberships.organizationId, organizations.id)
    )
    .where(
      and(
        eq(organizationMemberships.userId, userId),
        eq(organizationMemberships.status, 'active')
      )
    );

  return memberships;
}

// Helper to switch user's current organization
export async function switchUserOrganization(
  userId: string,
  organizationId: string
) {
  // Verify user is a member of the organization
  const membership = await db
    .select()
    .from(organizationMemberships)
    .where(
      and(
        eq(organizationMemberships.userId, userId),
        eq(organizationMemberships.organizationId, organizationId),
        eq(organizationMemberships.status, 'active')
      )
    )
    .get();

  if (!membership) {
    throw new Error('User is not a member of this organization');
  }

  // Update user's current organization
  await db
    .update(users)
    .set({ currentOrganizationId: organizationId })
    .where(eq(users.id, userId));

  return true;
}
