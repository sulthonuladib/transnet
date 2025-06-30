import {
  sqliteTable,
  text,
  integer,
  real,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

// Organizations table
export const organizations = sqliteTable('organizations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // for URL identification
  description: text('description'),
  ownerId: text('owner_id').notNull(), // will reference users.id after users table is created
  isPersonal: integer('is_personal', { mode: 'boolean' }).default(false), // personal org for individual users
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

// Users table (no required organization)
export const users = sqliteTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatar: text('avatar'), // profile picture URL
  currentOrganizationId: text('current_organization_id'), // currently selected organization
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

// Organization memberships (many-to-many relationship)
export const organizationMemberships = sqliteTable('organization_memberships', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'), // owner, admin, member, viewer
  status: text('status').notNull().default('active'), // active, suspended, pending
  joinedAt: integer('joined_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

// Organization invitations
export const organizationInvitations = sqliteTable('organization_invitations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  invitedBy: text('invited_by')
    .notNull()
    .references(() => users.id),
  email: text('email').notNull(),
  role: text('role').notNull().default('member'),
  token: text('token').notNull().unique(), // invitation token
  status: text('status').notNull().default('pending'), // pending, accepted, expired, cancelled
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  acceptedAt: integer('accepted_at', { mode: 'timestamp' }),
  acceptedBy: text('accepted_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

// Exchange configurations (organization-scoped)
export const exchangeConfigs = sqliteTable('exchange_configs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  exchangeName: text('exchange_name').notNull(),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  passphrase: text('passphrase'), // for some exchanges like OKX
  testnet: integer('testnet', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isValid: integer('is_valid', { mode: 'boolean' }).default(false),
  lastValidationAt: integer('last_validation_at', { mode: 'timestamp' }),
  validationError: text('validation_error'),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  updatedBy: text('updated_by').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

// Saved wallets (organization-scoped)
export const savedWallets = sqliteTable('saved_wallets', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  label: text('label').notNull(),
  address: text('address').notNull(),
  coin: text('coin').notNull(),
  network: text('network').notNull(),
  exchange: text('exchange').notNull(),
  description: text('description'), // optional description for the wallet
  isShared: integer('is_shared', { mode: 'boolean' }).default(true), // shared across organization
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

// Withdraw history with user attribution
export const withdrawHistory = sqliteTable('withdraw_history', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  initiatedBy: text('initiated_by')
    .notNull()
    .references(() => users.id),
  exchangeName: text('exchange_name').notNull(),
  coin: text('coin').notNull(),
  network: text('network').notNull(),
  amount: real('amount').notNull(),
  address: text('address').notNull(),
  tag: text('tag'), // memo/tag for some networks
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  txId: text('tx_id'), // transaction ID from exchange
  fee: real('fee'),
  exchangeOrderId: text('exchange_order_id'),
  error: text('error'), // error message if failed
  source: text('source').notNull().default('app'), // 'app' for this app, 'external' for detected externally
  notes: text('notes'), // admin notes or additional info
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

// Activity log for audit trail
export const activityLog = sqliteTable('activity_log', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  organizationId: text('organization_id')
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(), // 'login', 'withdrawal', 'config_change', etc.
  entity: text('entity'), // 'exchange', 'wallet', 'user', etc.
  entityId: text('entity_id'), // ID of the affected entity
  details: text('details'), // JSON string with additional details
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
    () => new Date()
  ),
});

// Export types for TypeScript
export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type OrganizationMembership =
  typeof organizationMemberships.$inferSelect;
export type NewOrganizationMembership =
  typeof organizationMemberships.$inferInsert;
export type OrganizationInvitation =
  typeof organizationInvitations.$inferSelect;
export type NewOrganizationInvitation =
  typeof organizationInvitations.$inferInsert;
export type ExchangeConfig = typeof exchangeConfigs.$inferSelect;
export type NewExchangeConfig = typeof exchangeConfigs.$inferInsert;
export type SavedWallet = typeof savedWallets.$inferSelect;
export type NewSavedWallet = typeof savedWallets.$inferInsert;
export type WithdrawHistory = typeof withdrawHistory.$inferSelect;
export type NewWithdrawHistory = typeof withdrawHistory.$inferInsert;
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;
