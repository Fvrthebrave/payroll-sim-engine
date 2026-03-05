"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
class AuditController {
    constructor(pool, auditRepo) {
        this.pool = pool;
        this.auditRepo = auditRepo;
        this.getAuditLogs = async (_req, res) => {
            const client = await this.pool.connect();
            try {
                const logs = await this.auditRepo.getAuditData(client);
                res.json(logs);
            }
            catch (err) {
                console.log(err);
                res.status(500).json({ error: "Failed to fetch audit logs" });
            }
            finally {
                client.release();
            }
        };
    }
    ;
}
exports.AuditController = AuditController;
//# sourceMappingURL=audits.controller.js.map