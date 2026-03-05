"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditRepo = void 0;
class AuditRepo {
    async insert(client, params) {
        const res = await client.query(`
      INSERT INTO audit_logs (entity_type, entity_id, action, metadata)
      VALUES ($1, $2, $3, $4)
      `, [params.entity_type,
            params.entity_id,
            params.action,
            params.metadata ?? {}]);
        return res.rows[0];
    }
    async getAuditData(client) {
        const res = await client.query(`
        SELECT id, entity_type, action, metadata, created_at
        FROM audit_logs
        ORDER BY created_at
      `);
        return res.rows;
    }
}
exports.AuditRepo = AuditRepo;
//# sourceMappingURL=audits.repo.js.map