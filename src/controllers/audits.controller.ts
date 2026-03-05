import { Pool } from 'pg';
import { AuditRepo } from '../repositories/audits.repo';
import { Request, Response } from 'express';

export class AuditController {
  constructor(
    private pool: Pool,
    private auditRepo: AuditRepo
  ) {};

  getAuditLogs = async (_req: Request, res: Response) => {
  const client = await this.pool.connect();

  try {
    const logs = await this.auditRepo.getAuditData(client);

    res.json(logs);
  } catch(err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch audit logs" })
  } finally {
    client.release();
  }
}
}
