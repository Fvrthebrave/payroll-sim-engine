"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const employee_repo_1 = require("./repositories/employee.repo");
const payroll_repo_1 = require("./repositories/payroll.repo");
const audits_repo_1 = require("./repositories/audits.repo");
const payroll_service_1 = require("./services/payroll/payroll.service");
const tax_service_1 = require("./services/tax/tax.service");
const employees_controller_1 = require("./controllers/employees.controller");
const payroll_controller_1 = require("./controllers/payroll.controller");
const payInputs_controller_1 = require("./controllers/payInputs.controller");
const employees_routes_1 = require("./routes/employees.routes");
const payInputs_routes_1 = require("./routes/payInputs.routes");
const payroll_routes_1 = require("./routes/payroll.routes");
const audits_routes_1 = require("./routes/audits.routes");
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const audits_controller_1 = require("./controllers/audits.controller");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL
});
const employeeRepo = new employee_repo_1.EmployeeRepo();
const payrollRepo = new payroll_repo_1.PayrollRepo();
const auditRepo = new audits_repo_1.AuditRepo();
const taxService = new tax_service_1.TaxService();
const payrollService = new payroll_service_1.PayrollService(pool, payrollRepo, employeeRepo, auditRepo, taxService);
const employeesController = new employees_controller_1.EmployeesController(pool, employeeRepo);
const payInputsController = new payInputs_controller_1.PayInputsController(pool, employeeRepo);
const payrollController = new payroll_controller_1.PayrollController(payrollService);
const auditController = new audits_controller_1.AuditController(pool, auditRepo);
app.use("/employees", (0, employees_routes_1.createEmployeesRouter)(employeesController));
app.use("/pay-inputs", (0, payInputs_routes_1.createPayInputsRouter)(payInputsController));
app.use("/payroll", (0, payroll_routes_1.createPayrollRouter)(payrollController));
app.use("/audit", (0, audits_routes_1.createAuditRouter)(auditController));
app.use("/dashboard", dashboard_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map