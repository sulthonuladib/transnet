import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';

// Initialize SQLite database using Bun's built-in SQLite
const sqlite = new Database('./database.db');

// Enable WAL mode for better performance
sqlite.exec('PRAGMA journal_mode = WAL;');

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Export database connection for direct SQL queries if needed
export { sqlite };

// Export all schema types and tables
export * from './schema';