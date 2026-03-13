import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

let tableEnsured = false;

/** Create the conversations table if it doesn't exist. */
export async function ensureTable() {
  if (tableEnsured) return;
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS conversations (
      id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ref        TEXT UNIQUE NOT NULL,
      messages   JSONB NOT NULL,
      extracted  JSONB,
      status     TEXT DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  tableEnsured = true;
}

/** Insert a conversation record. Returns the ref. */
export async function insertConversation(
  ref: string,
  messages: unknown[],
  extracted: Record<string, unknown>
) {
  const sql = getDb();
  await sql`
    INSERT INTO conversations (ref, messages, extracted)
    VALUES (${ref}, ${JSON.stringify(messages)}, ${JSON.stringify(extracted)})
  `;
  return ref;
}
