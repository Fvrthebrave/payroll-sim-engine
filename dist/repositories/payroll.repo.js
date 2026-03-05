"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollRepo = void 0;
const redis_1 = require("../db/redis");
class PayrollRepo {
    // Grab correct run by idempotency key, optionally locking the row (so two requests don't both decide to run)
    async getRunByIdempotencyKey(client, idempotencyKey, options) {
        const lock = options?.forUpdate ? 'FOR UPDATE' : '';
        const res = await client.query(`SELECT * FROM payroll_runs
         WHERE idempotency_key = $1
         ${lock}
         `, [idempotencyKey]);
        await new Promise(r => setTimeout(r, 100));
        return res.rows[0] ?? null;
    }
    // Create run in 'processing' state
    async createRun(client, params) {
        const res = await client.query(`
        INSERT INTO payroll_runs (period_start, period_end, idempotency_key, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT
        DO NOTHING
        RETURNING *
        `, [params.periodStart,
            params.periodEnd,
            params.idempotencyKey,
            params.status]);
        const run = res.rows[0];
        const job = {
            runId: run.id,
            periodStart: run.period_start,
            periodEnd: run.period_end
        };
        await redis_1.redis.rpush("payroll_jobs", JSON.stringify(job));
        return run;
    }
    // Insert payroll entry for employee + run
    async insertEntry(client, params) {
        const res = await client.query(`
        INSERT INTO payroll_entries (payroll_run_id, employee_id, gross_cents, tax_cents, net_cents, details, deduction_cents)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `, [params.payrollRunId,
            params.employeeId,
            params.grossCents,
            params.taxCents,
            params.netCents,
            params.details,
            params.deductionCents]);
        return res.rows[0];
    }
    // Mark run completed
    async markCompleted(client, payrollRunId) {
        const res = await client.query(`
        UPDATE payroll_runs
        SET status = 'completed',
            completed_at = NOW()
        WHERE id = $1
        RETURNING *
        `, [payrollRunId]);
        return res.rows[0] ?? null;
    }
}
exports.PayrollRepo = PayrollRepo;
//# sourceMappingURL=payroll.repo.js.map