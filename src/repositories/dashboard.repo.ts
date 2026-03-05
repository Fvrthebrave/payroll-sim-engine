import { PoolClient } from 'pg';

export async function getDashboardSummary(client: PoolClient) {
  const res = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM employees) AS active_employees,

        (SELECT period_end
         FROM payroll_runs
         ORDER BY created_at DESC
         LIMIT 1) AS next_payroll_date,

        (SELECT COALESCE(SUM(gross_cents), 0)
         FROM payroll_entries) AS projected_gross_pay
    `);

    return res.rows[0];
}