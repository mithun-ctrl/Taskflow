import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(schema);
  } finally {
    client.release();
  }
  process.exit(0);
}
migrate().catch((err) => {
  process.exit(1);
});
