import { pool } from "../db/pool";
import { getDashboardSummary } from "../repositories/dashboard.repo";
import { Request, Response } from 'express';

export async function getSummary(req: Request, res: Response) {
  const client = await pool.connect();

  try {
    const summary = await getDashboardSummary(client);

    res.json(summary);
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  } finally {
    client.release();
  }
}