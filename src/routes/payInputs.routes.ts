import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { PayInputsController } from "../controllers/payInputs.controller";

export const createPayInputsRouter = (controller: PayInputsController) => {
  const router = Router();

  // Upsert pay inputs for an employee
  router.put("/:employeeId", asyncHandler(controller.upsertPayInput));
  // Get pay inputs for a period
  router.get("/", asyncHandler(controller.getPayInputsForPeriod));

  return router;
};