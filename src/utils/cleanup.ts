import { db, organizationInvitations } from '../database';
import { eq, and, lt } from 'drizzle-orm';

/**
 * Clean up expired organization invitations
 * This should be run periodically (e.g., daily) to remove expired invitations
 */
export async function cleanupExpiredInvitations() {
  const now = new Date();
  
  try {
    // Update expired invitations
    const result = await db
      .update(organizationInvitations)
      .set({ status: 'expired' })
      .where(
        and(
          eq(organizationInvitations.status, 'pending'),
          lt(organizationInvitations.expiresAt, now)
        )
      );
    
    console.log(`[Cleanup] Marked ${result.changes || 0} invitations as expired`);
    
    // Optional: Delete very old expired invitations (e.g., older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deleteResult = await db
      .delete(organizationInvitations)
      .where(
        and(
          eq(organizationInvitations.status, 'expired'),
          lt(organizationInvitations.expiresAt, thirtyDaysAgo)
        )
      );
    
    console.log(`[Cleanup] Deleted ${deleteResult.changes || 0} old expired invitations`);
    
    return {
      expired: result.changes || 0,
      deleted: deleteResult.changes || 0,
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
  setInterval(() => {
    cleanupExpiredInvitations().catch(console.error);
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  
  console.log('[Cleanup] Scheduled periodic cleanup tasks');
}