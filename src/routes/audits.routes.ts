import express from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuditController } from '../controllers/audits.controller.js';

export const createAuditRouter = (controller: AuditController) => {
  const router = express.Router();

  router.get("/logs", controller.getAuditLogs);

  return router;
}