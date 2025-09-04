import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Handle missing or invalid DATABASE_URL gracefully
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.includes("your_neon_database_connection_string_here")) {
  console.warn("DATABASE_URL not properly configured. Using fallback configuration.");
  // Create a mock pool that won't actually connect
  export const pool = null;
  export const db = null;
} else {
  export const pool = new Pool({ connectionString: databaseUrl });
  export const db = drizzle({ client: pool, schema });
}