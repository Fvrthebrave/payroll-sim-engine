import { Request, Response } from 'express';
import { Pool } from 'pg';
import { EmployeeRepo } from '../repositories/employee.repo';

export class PayInputsController {
  constructor(
    private pool: Pool,
    private employeeRepo: EmployeeRepo
  ) {}

  // Handler for upserting pay input for an employee
  upsertPayInput = async (req: Request, res: Response) => {
    const { employeeId } = req.params;
    const {
      periodStart,
      periodEnd,
      regularHours,
      overtimeHours,
      bonusCents,
      deductionsCents,
    } = req.body;
  
    const client = await this.pool.connect();

    try {
      const result = await this.employeeRepo.upsertPayInput(client, {
        employeeId: String(employeeId),
        periodStart,
        periodEnd,
        regularHours,
        overtimeHours,
        bonusCents,
        deductionsCents
      });

      await client.query('COMMIT');
      res.status(200).json(result);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error processing pay input:', err);
      res.status(500).json({ error: 'Failed to process pay input' });
    } finally {
      client.release();
    }
  }
}
