import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { LedgerController } from '../controllers/ledger.controller';

export const createLedgerRouter = (controller: LedgerController) => {
  const router = Router();

  router.get('/balances', asyncHandler(controller.getBalances));

  return router;
}