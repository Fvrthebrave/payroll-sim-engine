import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { EmployeesController } from '../controllers/employees.controller';

export const createEmployeesRouter = (controller: EmployeesController) => {
  const router = Router();

  router.post("/", asyncHandler(controller.createEmployee));
  router.get("/", asyncHandler(controller.listEmployees));

  return router;
}