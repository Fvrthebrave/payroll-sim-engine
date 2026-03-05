import { PoolClient } from 'pg';
import { redis } from '../db/redis';

export class PayrollRepo {

  // Grab correct run by idempotency key, optionally locking the row (so two requests don't both decide to run)
  async getRunByIdempotencyKey(
    client: PoolClient, 
    idempotencyKey: string, 
    options?: { forUpdate: boolean }
  ) {
      const lock = options?.forUpdate ? 'FOR UPDATE' : '';

      const res = await client.query(
        `SELECT * FROM payroll_runs
         WHERE idempotency_key = $1
         ${lock}
         `,
         [idempotencyKey]
      )

      await new Promise(r => setTimeout(r, 100))
      return res.rows[0] ?? null;
    }

    // Create run in 'processing' state
    async createRun(
      client: PoolClient,
      params: {
        periodStart: string;
        periodEnd: string;
        idempotencyKey: string;
        status: 'queued' | 'processing' | 'completed' | 'failed';
      }
    ) {
      const res = await client.query(`
        INSERT INTO payroll_runs (period_start, period_end, idempotency_key, status, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT
        DO NOTHING
        RETURNING *
        `, 
        [params.periodStart, 
         params.periodEnd, 
         params.idempotencyKey, 
         params.status]
      );

      const run = res.rows[0];

      const job = {
        runId: run.id,
        periodStart: run.period_start,
        periodEnd: run.period_end
      }

      await redis.rpush("payroll_jobs", JSON.stringify(job));
      console.log("Job pushed to Redis:", job);
      
      return run;
    }

    // Insert payroll entry for employee + run
    async insertEntry(
      client: PoolClient,
      params: {
      payrollRunId: number,
      employeeId: number,
      grossCents: number,
      taxCents: number,
      deductionCents: number,
      netCents: number,
      details: any
      }
    ) {
      const res = await client.query(`
        INSERT INTO payroll_entries (payroll_run_id, employee_id, gross_cents, tax_cents, net_cents, details, deduction_cents)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [params.payrollRunId, 
         params.employeeId, 
         params.grossCents, 
         params.taxCents, 
         params.netCents, 
         params.details,
         params.deductionCents]
      );

      return res.rows[0];
    }
    
    // Mark run completed
    async markCompleted(client: PoolClient, payrollRunId: number) {
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