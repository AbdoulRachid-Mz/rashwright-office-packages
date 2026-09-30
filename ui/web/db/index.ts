// @/db/index.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

function getCleanDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!dbUrl) {
    console.warn("⚠️ DATABASE_URL ou POSTGRES_URL non définie.");
    return "postgresql://localhost:5432/immo360";
  }

  // Nettoyage sécurisé du paramètre channel_binding qui n'est pas supporté par le driver HTTP Neon
  const cleanedUrl = dbUrl
    .replace(/([?&])channel_binding=[^&]*&?/g, "$1")
    .replace(/[?&]$/, "");

  return cleanedUrl;
}

const connectionString = getCleanDatabaseUrl();

export const sql = neon(connectionString);
export const db = drizzle({ client: sql });
