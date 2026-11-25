import fs from "node:fs";
import path from "node:path";
import { neon } from "@neondatabase/serverless";

/**
 * Where the store document lives.
 *
 * - With DATABASE_URL set (Vercel, via the Neon integration): one row in Postgres.
 * - Without it (a founder running the site on their own computer): .data/jb-store.json.
 *
 * Every save is conditional on the version that was read ("optimistic concurrency").
 * If two requests change the store at the same moment, the second save is refused
 * with StoreConflictError and the request is retried from a fresh read, so neither
 * change silently overwrites the other. This is what keeps stock, board slots and
 * order numbers correct when two people order at once (BR-09).
 */

export class StoreConflictError extends Error {
  constructor() {
    super("The store changed while this request was running.");
    this.name = "StoreConflictError";
  }
}

export interface StoredDoc {
  data: unknown;
  version: number;
}

export interface StoreBackend {
  readonly kind: "postgres" | "file";
  /** The stored document, or null when nothing has been saved yet. */
  load(): Promise<StoredDoc | null>;
  /** Insert the first document. Returns the stored doc (someone else's if they won the race). */
  create(data: unknown): Promise<StoredDoc>;
  /** Save if the stored version still equals `version`. Returns the new version, or null on conflict. */
  save(data: unknown, version: number): Promise<number | null>;
}

/** Runs one SQL statement with $1-style parameters and returns the rows. */
export type SqlRunner = (text: string, params?: unknown[]) => Promise<Array<Record<string, unknown>>>;

const TABLE = "jb_store";

const CREATE_TABLE = `CREATE TABLE IF NOT EXISTS ${TABLE} (
  id integer PRIMARY KEY,
  version integer NOT NULL,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
)`;

function parseData(raw: unknown): unknown {
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export function createPostgresBackend(run: SqlRunner): StoreBackend {
  let ready: Promise<unknown> | null = null;
  const ensureTable = () => (ready ??= run(CREATE_TABLE).catch((e) => ((ready = null), Promise.reject(e))));

  return {
    kind: "postgres",
    async load() {
      await ensureTable();
      const rows = await run(`SELECT data, version FROM ${TABLE} WHERE id = 1`);
      if (rows.length === 0) return null;
      return { data: parseData(rows[0].data), version: Number(rows[0].version) };
    },
    async create(data) {
      await ensureTable();
      await run(
        `INSERT INTO ${TABLE} (id, version, data) VALUES (1, 1, $1::jsonb) ON CONFLICT (id) DO NOTHING`,
        [JSON.stringify(data)]
      );
      const rows = await run(`SELECT data, version FROM ${TABLE} WHERE id = 1`);
      return { data: parseData(rows[0].data), version: Number(rows[0].version) };
    },
    async save(data, version) {
      await ensureTable();
      const rows = await run(
        `UPDATE ${TABLE} SET data = $1::jsonb, version = version + 1, updated_at = now()
         WHERE id = 1 AND version = $2 RETURNING version`,
        [JSON.stringify(data), version]
      );
      return rows.length === 1 ? Number(rows[0].version) : null;
    },
  };
}

/** Local file store for running the site on a computer without a database. */
export function createFileBackend(file = path.join(process.cwd(), ".data", "jb-store.json")): StoreBackend {
  let version = 1;
  return {
    kind: "file",
    async load() {
      try {
        if (!fs.existsSync(file)) return null;
        return { data: JSON.parse(fs.readFileSync(file, "utf8")), version };
      } catch {
        return null;
      }
    },
    async create(data) {
      await this.save(data, version);
      return { data, version };
    },
    async save(data) {
      try {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
      } catch {
        // A read-only filesystem (for example a deployment without a database) cannot persist.
      }
      version += 1;
      return version;
    },
  };
}

let backend: StoreBackend | null = null;

export function getBackend(): StoreBackend {
  if (backend) return backend;
  const url = process.env.DATABASE_URL;
  if (url) {
    const sql = neon(url);
    backend = createPostgresBackend(async (text, params = []) => {
      const rows = await sql.query(text, params);
      return rows as Array<Record<string, unknown>>;
    });
  } else {
    backend = createFileBackend();
  }
  return backend;
}

/** For tests: use a specific backend. */
export function setBackend(b: StoreBackend | null): void {
  backend = b;
}
