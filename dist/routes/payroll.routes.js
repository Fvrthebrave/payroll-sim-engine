"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayrollRouter = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const createPayrollRouter = (controller) => {
    const router = (0, express_1.Router)();
    router.post("/run", (0, asyncHandler_1.asyncHandler)(controller.runPayroll));
    return router;
};
exports.createPayrollRouter = createPayrollRouter;
//# sourceMappingURL=payroll.routes.js.map