import { Pool } from 'pg';
import { AuditRepo } from '../repositories/audits.repo';
import { Request, Response } from 'express';
export declare class AuditController {
    private pool;
    private auditRepo;
    constructor(pool: Pool, auditRepo: AuditRepo);
    getAuditLogs: (_req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=audits.controller.d.ts.map