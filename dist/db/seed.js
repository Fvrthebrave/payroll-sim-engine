"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pool_1 = require("./pool");
async function seed() {
    const client = await pool_1.pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(`
      INSERT INTO employees (name, employee_type, base_rate_cents)
      VALUES
      ('Alice Johnson', 'hourly', 2500),
      ('Mark Davis', 'hourly', 2200),
      ('Sarah Kim', 'salary', 8500000)
    `);
        await client.query(`
      INSERT INTO pay_inputs
      (employee_id, period_start, period_end, regular_hours, overtime_hours)
      SELECT id, '2026-03-01', '2026-03-15', 80, 5
      FROM employees
      WHERE employee_type = 'hourly'
    `);
        await client.query("COMMIT");
    }
    catch (err) {
        await client.query("ROLLBACK");
    }
    finally {
        client.release();
        process.exit();
    }
}
seed();
//# sourceMappingURL=seed.js.map