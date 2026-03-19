import dotenv from "dotenv";
dotenv.config();
import { Pool } from 'pg'
import { PayrollService } from '../services/payroll/payroll.service'; 
import { PayrollRepo } from '../repositories/payroll.repo';
import { EmployeeRepo } from '../repositories/employee.repo';
import { AuditRepo } from '../repositories/audits.repo';
import { TaxService } from '../services/tax/tax.service';
import { LedgerRepo } from "../repositories/ledger.repo";
import { redis } from "../db/redis";

describe("Payroll concurrency test", () => {
  let pool: Pool;
  let payrollService: PayrollService;

  beforeAll(async () => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    payrollService = new PayrollService(
      pool,
      new PayrollRepo(),
      new EmployeeRepo(),
      new AuditRepo(),
      new TaxService(),
      new LedgerRepo()
    );

    const client = await pool.connect();
    await client.query("BEGIN");

    //Clean database
    await client.query("TRUNCATE TABLE payroll_entries CASCADE");
    await client.query("TRUNCATE TABLE payroll_runs CASCADE");
    await client.query("TRUNCATE TABLE pay_inputs CASCADE");
    await client.query("TRUNCATE TABLE employees CASCADE");

    await client.query("COMMIT");
    client.release();

    // Insert test employees
    const insertClient = await pool.connect();

    const empRes = await insertClient.query(`
      INSERT INTO employees (name, employee_type, base_rate_cents)
      VALUES ('Test User', 'hourly', 2000)
      RETURNING id`);

      const employeeId = empRes.rows[0].id;

      await insertClient.query(`
        INSERT INTO pay_inputs (
          employee_id,
          period_start,
          period_end,
          regular_hours,
          overtime_hours,
          bonus_cents,
          deductions_cents
        ) VALUES ($1, '2026-01-01', '2026-01-15', 40, 5, 0, 0)
        `, [employeeId]
      );

      insertClient.release();
  });

  afterAll(async () => {
    await redis.quit();
    await pool.end()
  });

  it("should safely handle 10 concurrent payroll runs attempts", async () => {
    const idempotencyKey = "stress-test-key";

    const attempts = Array.from({ length: 10 }).map(() => 
      payrollService.runPayroll({
        periodStart: "2026-01-01",
        periodEnd: "2026-01-15",
        idempotencyKey
      })
    );

    const results = await Promise.allSettled(attempts);
    
    const summary = results.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("Concurrency result:", summary);


    // All run IDs should match
    const successfulRuns = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value); 
    const runIds = successfulRuns.map(r => r.id);
    const uniqueRunIds = new Set(runIds);

    expect(uniqueRunIds.size).toBe(1);

    const client = await pool.connect();

    const runCount = await client.query(`
      SELECT COUNT(*) FROM payroll_runs WHERE idempotency_key = $1`,
      [idempotencyKey]
    );

    expect(Number(runCount.rows[0].count)).toBe(1);

    client.release();
  });
})
