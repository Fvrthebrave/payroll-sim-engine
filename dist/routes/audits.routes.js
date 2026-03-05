"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuditRouter = void 0;
const express_1 = __importDefault(require("express"));
const createAuditRouter = (controller) => {
    const router = express_1.default.Router();
    router.get("/logs", controller.getAuditLogs);
    return router;
};
exports.createAuditRouter = createAuditRouter;
//# sourceMappingURL=audits.routes.js.map