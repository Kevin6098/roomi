// File: backend/scripts/migrate-exact-location.js
// Adds exact_location to items, rentals, sales. Run once.

const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'roomi_db';

async function main() {
  console.log('Adding exact_location columns...');
  let conn;
  try {
    conn = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
    });
    const migrationPath = path.join(__dirname, '..', 'schema-migration-exact-location.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    const statements = sql
      .split(';')
      .map((s) => s.replace(/--.*$/gm, '').trim())
      .filter((s) => s.length > 0);
    for (const st of statements) {
      try {
        await conn.execute(st);
        console.log('OK:', st.substring(0, 70));
      } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('Skip (column exists):', st.substring(0, 50));
        else throw e;
      }
    }
    console.log('Exact location migration done.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();
