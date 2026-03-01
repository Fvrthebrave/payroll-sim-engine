import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler'; 
import { PayInputsController } from '../controllers/payInputs.controller';

export const createPayInputsRouter = (controller: PayInputsController) => {
  const router = Router();

  router.put("/", asyncHandler(controller.upsertPayInput));

  return router;
};