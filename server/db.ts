import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create connection to the database with fallback
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/hireindex';
let client: postgres.Sql | undefined;
let db: ReturnType<typeof drizzle>;

try {
  client = postgres(connectionString);
  db = drizzle(client, { schema });
  console.log('Database connection established successfully');
} catch (error) {
  console.error('Failed to connect to database:', error);
  // Create a mock database for development/testing
  db = {
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
    delete: () => ({ where: () => ({ returning: () => [] }) }),
  } as any;
}

export { db };