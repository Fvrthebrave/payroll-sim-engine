import { PoolClient } from 'pg';

export class EmployeeRepo {
  // Get all employees, ordered by most recent
  async getAll(client: PoolClient) {
    const res = await client.query(`
      SELECT * 
      FROM employees
      ORDER BY created_at DESC`);
    return res.rows;
  }

  // Get pay inputs for employees for a given period
  async createEmployee(
    client: PoolClient,
    params: {
      name: string;
      employeeType: "hourly" | "salary";
      baseRateCents: number;
    }
  ) {
    const res = await client.query(`
      INSERT INTO employees (name, employee_type, base_rate_cents)
      VALUES ($1, $2, $3) 
      RETURNING *
      `, [params.name, params.employeeType, params.baseRateCents]
    )

    return res.rows[0];
  }

  // Get pay inputs for employees for a given period
  async upsertPayInput(
    client: PoolClient,
    params: {
      employeeId: string;
      periodStart: string,
      periodEnd: string;
      regularHours: number;
      overtimeHours: number;
      bonusCents: number;
      deductionsCents: number;
    }
  ) {

    // Upsert pay inputs for employee + period
    const res = await client.query(`
      INSERT INTO pay_inputs
      (
        employee_id,
        period_start,
        period_end,
        regular_hours,
        overtime_hours,
        bonus_cents,
        deductions_cents
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (employee_id, period_start, period_end)
       DO UPDATE
       SET regular_hours = EXCLUDED.regular_hours,
           overtime_hours = EXCLUDED.overtime_hours,
           bonus_cents = EXCLUDED.bonus_cents,
           deductions_cents = EXCLUDED.deductions_cents
        RETURNING *
        `, 
        [params.employeeId,
        params.periodStart,
        params.periodEnd,
        params.regularHours,
        params.overtimeHours,
        params.bonusCents,
        params.deductionsCents
       ]
      )

      return res.rows[0];
    }

    // Get pay inputs for employees for a given period
    async getPayInputsForPeriod(
      client: PoolClient,
      params: {
        employeeIds: string[];
        periodStart: string;
        periodEnd: string
      }
    ) {
      if(params.employeeIds.length === 0) {
        return new Map();
      }

      const res = await client.query(`
        SELECT *
        FROM pay_inputs
        WHERE employee_id = ANY($1)
            AND period_start = $2
            AND period_end = $3
        `, 
        [params.employeeIds, params.periodStart, params.periodEnd]
      )

      const map = new Map();
      for(const row of res.rows) {
        map.set(row.employee_id, row);
      }

      return map;
    }
}