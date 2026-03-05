import { Request, Response } from 'express';
import { PayrollService } from '../services/payroll/payroll.service';

export class PayrollController {
  constructor(
    private payrollService: PayrollService
  ) {};

  // Run payroll for a given period
  runPayroll = async (req: Request, res: Response) => {
    const { periodStart, periodEnd, idempotencyKey } = req.body;

    if(!periodStart || !periodEnd || !idempotencyKey) {
      return res.status(400).json({ error: 'Missing required fields: periodStart, periodEnd, idempotencyKey' });
    }

    const result = await this.payrollService.runPayroll({
      periodStart,
      periodEnd,
      idempotencyKey
    })

    res.json({
      id: result.id,
      status: result.status
    });
  }
}