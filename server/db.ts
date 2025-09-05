import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Handle missing or invalid DATABASE_URL gracefully
const databaseUrl = process.env.DATABASE_URL;

// Declare exports at top level
let pool: Pool | null = null;
let db: any = null;

if (!databaseUrl || databaseUrl.includes("your_neon_database_connection_string_here")) {
  console.warn("DATABASE_URL not properly configured. Creating in-memory fallback.");
  // Create a fallback in-memory database for development
  try {
    const { Database } = require('better-sqlite3');
    const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
    
    const sqlite = new Database(':memory:');
    db = drizzleSqlite(sqlite, { schema });
    
    // Create tables for in-memory database
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        teamId TEXT,
        mobileNumber TEXT,
        department TEXT,
        profilePhoto TEXT,
        startDate TEXT,
        endDate TEXT,
        progress INTEGER DEFAULT 0,
        isActive BOOLEAN DEFAULT true,
        attendanceCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        teamName TEXT NOT NULL,
        adminId TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'todo',
        dueDate TEXT,
        assignedBy TEXT NOT NULL,
        assignedTo TEXT,
        teamId TEXT NOT NULL,
        isTeamTask BOOLEAN DEFAULT false,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        link TEXT,
        fileUrl TEXT,
        description TEXT,
        uploadedBy TEXT NOT NULL,
        teamId TEXT NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS certificates (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        userId TEXT NOT NULL,
        issuedDate TEXT DEFAULT CURRENT_TIMESTAMP,
        certificateUrl TEXT,
        isGenerated BOOLEAN DEFAULT false,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
        userId TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        isRead BOOLEAN DEFAULT false,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("✓ In-memory SQLite database initialized");
  } catch (error) {
    console.error("Failed to create fallback database:", error);
    // Create a minimal mock database object
    db = {
      select: () => ({ from: () => ({ where: () => [] }) }),
      insert: () => ({ values: () => ({ returning: () => [] }) }),
      update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
      delete: () => ({ where: () => [] })
    };
  }
} else {
  pool = new Pool({ connectionString: databaseUrl });
  db = drizzle({ client: pool, schema });
}

export { pool, db };