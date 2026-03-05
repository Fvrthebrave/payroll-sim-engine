"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayInputsRouter = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const createPayInputsRouter = (controller) => {
    const router = (0, express_1.Router)();
    // Upsert pay inputs for an employee
    router.put("/:employeeId", (0, asyncHandler_1.asyncHandler)(controller.upsertPayInput));
    // Get pay inputs for a period
    router.get("/", (0, asyncHandler_1.asyncHandler)(controller.getPayInputsForPeriod));
    return router;
};
exports.createPayInputsRouter = createPayInputsRouter;
//# sourceMappingURL=payInputs.routes.js.map