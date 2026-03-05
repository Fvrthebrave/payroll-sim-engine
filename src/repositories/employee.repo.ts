import { PoolClient } from 'pg';

type PayInputRow = {
  id: string;
  employee_id: string;
  period_start: Date;
  period_end: Date;
  regular_hours: number;
  overtime_hours: number;
  bonus_cents: number;
  deductions_cents: number;
  created_at: Date;
};

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
      ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)
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

      return {
        payInput: res.rows[0],
        inserted: res.rowCount === 1
      }
    }

    // Get pay inputs for employees for a given period
    async getPayInputsForPeriod(
      client: PoolClient,
      params: {
        employeeIds: string[];
        periodStart: string;
        periodEnd: string
      }
    ): Promise<Record<string, PayInputRow>> {
      if(params.employeeIds.length === 0) {
        return {};
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

      const inputs: Record<string, PayInputRow> = {};

      for (const row of res.rows) {
        inputs[row.employee_id] = {
          ...row,
          regular_hours: Number(row.regular_hours),
          overtime_hours: Number(row.overtime_hours)
        };
      }

      return inputs;
    }
}