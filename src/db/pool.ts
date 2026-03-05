import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on("connect", () => {
  console.log('Connected to Postgres');
});

pool.on("error", err => {
  console.error("Unexpected Postgres error", err)
});