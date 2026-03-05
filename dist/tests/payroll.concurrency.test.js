"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pg_1 = require("pg");
const payroll_service_1 = require("../services/payroll/payroll.service");
const payroll_repo_1 = require("../repositories/payroll.repo");
const employee_repo_1 = require("../repositories/employee.repo");
const audits_repo_1 = require("../repositories/audits.repo");
const tax_service_1 = require("../services/tax/tax.service");
console.log("DATABASE_URL in test:", process.env.DATABASE_URL);
describe("Payroll concurrency test", () => {
    let pool;
    let payrollService;
    beforeAll(async () => {
        pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
        });
        payrollService = new payroll_service_1.PayrollService(pool, new payroll_repo_1.PayrollRepo(), new employee_repo_1.EmployeeRepo(), new audits_repo_1.AuditRepo(), new tax_service_1.TaxService());
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
        `, [employeeId]);
        insertClient.release();
    });
    afterAll(async () => {
        await pool.end();
    });
    it("should safely handle 10 concurrent payroll runs attempts", async () => {
        const idempotencyKey = "stress-test-key";
        const attempts = Array.from({ length: 10 }).map(() => payrollService.runPayroll({
            periodStart: "2026-01-01",
            periodEnd: "2026-01-15",
            idempotencyKey
        }));
        const results = await Promise.all(attempts);
        // All run IDs should match
        const runIds = results.map(r => r.id);
        const uniqueRunIds = new Set(runIds);
        expect(uniqueRunIds.size).toBe(1);
        const client = await pool.connect();
        const runCount = await client.query(`
      SELECT COUNT(*) FROM payroll_runs WHERE idempotency_key = $1`, [idempotencyKey]);
        expect(Number(runCount.rows[0].count)).toBe(1);
        client.release();
    });
});
//# sourceMappingURL=payroll.concurrency.test.js.map