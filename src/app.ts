import express from 'express';
import { Pool } from 'pg';  

import { EmployeeRepo } from './repositories/employee.repo';
import { PayrollRepo } from './repositories/payroll.repo';
import { AuditRepo } from './repositories/audit.repo';  

import { PayrollService } from './services/payroll/payroll.service';
import { TaxService } from "./services/tax/tax.service";

import { EmployeesController } from './controllers/employees.controller';
import { PayrollController } from './controllers/payroll.controller';
import { PayInputsController } from './controllers/payInputs.controller';

import { createEmployeesRouter } from './routes/employees.routes';
import { createPayInputsRouter} from './routes/payInputs.routes';
import { createPayrollRouter } from './routes/payroll.routes';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const employeeRepo = new EmployeeRepo();
const payrollRepo = new PayrollRepo();
const auditRepo = new AuditRepo();

const taxService = new TaxService();
const payrollService = new PayrollService(pool, payrollRepo, employeeRepo, auditRepo, taxService);

const employeesController = new EmployeesController(pool, employeeRepo);
const payInputsController = new PayInputsController(pool, employeeRepo);
const payrollController = new PayrollController(payrollService);

app.use("/employees", createEmployeesRouter(employeesController));
app.use("/pay-inputs", createPayInputsRouter(payInputsController));
app.use("/payroll", createPayrollRouter(payrollController));

export default app;
