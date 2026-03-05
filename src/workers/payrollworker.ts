import { redis } from '../db/redis';
import { pool } from '../db/pool';

async function startWorker() {
  console.log('Payroll worker has started...');

  while(true) {
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
        `, [job.runId]);

        // TODO: run payroll calculation here
        await new Promise(resolve => setTimeout(resolve, 3000));

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

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}