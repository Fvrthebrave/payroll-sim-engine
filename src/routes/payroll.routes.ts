import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { PayrollController } from '../controllers/payroll.controller';

export const createPayrollRouter = (controller: PayrollController) => {
  const router = Router();

  router.post("/run", asyncHandler(controller.runPayroll));

  return router;
}