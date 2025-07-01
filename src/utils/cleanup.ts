import { db, organizationInvitations } from '../database';
import { eq, and, lt } from 'drizzle-orm';

/**
 * Clean up expired organization invitations
 * This should be run periodically (e.g., daily) to remove expired invitations
 */
export async function cleanupExpiredInvitations() {
  const now = new Date();

  try {
    // Find expired invitations before updating
    const expiredInvitations = await db
      .select({ id: organizationInvitations.id })
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.status, 'pending'),
          lt(organizationInvitations.expiresAt, now)
        )
      )
      .execute();

    // Update expired invitations
    if (expiredInvitations.length > 0) {
      await db
        .update(organizationInvitations)
        .set({ status: 'expired' })
        .where(
          and(
            eq(organizationInvitations.status, 'pending'),
            lt(organizationInvitations.expiresAt, now)
          )
        )
        .execute();
    }

    console.log(
      `[Cleanup] Marked ${expiredInvitations.length} invitations as expired`
    );

    // Optional: Delete very old expired invitations (e.g., older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find old invitations before deleting
    const oldInvitations = await db
      .select({ id: organizationInvitations.id })
      .from(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.status, 'expired'),
          lt(organizationInvitations.expiresAt, thirtyDaysAgo)
        )
      )
      .execute();

    // Delete old invitations
    if (oldInvitations.length > 0) {
      await db
        .delete(organizationInvitations)
        .where(
          and(
            eq(organizationInvitations.status, 'expired'),
            lt(organizationInvitations.expiresAt, thirtyDaysAgo)
          )
        )
        .execute();
    }

    console.log(
      `[Cleanup] Deleted ${oldInvitations.length} old expired invitations`
    );

    return {
      expired: expiredInvitations.length,
      deleted: oldInvitations.length,
    };
  } catch (error) {
    console.error('[Cleanup] Error cleaning up invitations:', error);
    throw error;
  }
}

/**
 * Set up a periodic cleanup task
 * Call this when the server starts
 */
export function setupCleanupTasks() {
  // Run cleanup on startup
  cleanupExpiredInvitations().catch(console.error);

  // Run cleanup every 24 hours
  setInterval(
    () => {
      cleanupExpiredInvitations().catch(console.error);
    },
    24 * 60 * 60 * 1000
  ); // 24 hours in milliseconds

  console.log('[Cleanup] Scheduled periodic cleanup tasks');
}
