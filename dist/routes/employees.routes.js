"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEmployeesRouter = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const createEmployeesRouter = (controller) => {
    const router = (0, express_1.Router)();
    router.post("/", (0, asyncHandler_1.asyncHandler)(controller.createEmployee));
    router.get("/", (0, asyncHandler_1.asyncHandler)(controller.listEmployees));
    return router;
};
exports.createEmployeesRouter = createEmployeesRouter;
//# sourceMappingURL=employees.routes.js.map