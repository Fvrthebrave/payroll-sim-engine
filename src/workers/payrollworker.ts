import { redis } from '../db/redis';
import { pool } from '../db/pool';
import { PayrollService } from '../services/payroll/payroll.service'
import { PayrollRepo } from  '../repositories/payroll.repo';
import { EmployeeRepo } from '../repositories/employee.repo';
import { AuditRepo } from '../repositories/audits.repo';
import { TaxService } from '../services/tax/tax.service';

const payrollRepo = new PayrollRepo();
const employeeRepo = new EmployeeRepo();
const auditRepo = new AuditRepo();
const taxService = new TaxService();

const payrollService = new PayrollService(
  pool,
  payrollRepo,
  employeeRepo,
  auditRepo,
  taxService
);

async function startWorker() {
  console.log('Payroll worker has started...');

  while(true) {
    console.log("Worker waiting for jobs...");
    const result = await redis.brpop("payroll_jobs", 0);
    const job = JSON.parse(result![1]);

    const client = await pool.connect();

    try {
      console.log('Processing payroll run:', job.runId);

      await client.query("BEGIN");

      await client.query(`
          UPDATE payroll_runs
          SET status = 'processing',
              started_at = NOW()
          WHERE id = $1
          AND status = 'queued'
        `, [job.runId]);

        await payrollService.processPayrollRun(client, job.runId);

        await client.query(`
            UPDATE payroll_runs
            SET status = 'completed',
                completed_at = NOW()
            WHERE id = $1
            AND status = 'processing'
          `, [job.runId]);

        await client.query("COMMIT");

        console.log('Payroll run completed:', job.runId);
    } catch (err) {
      await client.query("ROLLBACK");

      await client.query(`
          UPDATE payroll_runs
          SET status = 'failed'
          WHERE id = $1
        `, [job.runId]);

      console.error('Worker failed:', err, job.runId);
    } finally {
      client.release();
    }
  }
}

startWorker();