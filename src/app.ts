import express from 'express';
import { Pool } from 'pg';  

import { EmployeeRepo } from './repositories/employee.repo';
import { PayrollRepo } from './repositories/payroll.repo';
import { AuditRepo } from './repositories/audits.repo';
import { LedgerRepo } from './repositories/ledger.repo';

import { PayrollService } from './services/payroll/payroll.service';
import { TaxService } from "./services/tax/tax.service";
import { LedgerService } from './services/ledger/ledger.service';

import { EmployeesController } from './controllers/employees.controller';
import { PayrollController } from './controllers/payroll.controller';
import { PayInputsController } from './controllers/payInputs.controller';
import { LedgerController } from './controllers/ledger.controller';

import { createEmployeesRouter } from './routes/employees.routes';
import { createPayInputsRouter} from './routes/payInputs.routes';
import { createPayrollRouter } from './routes/payroll.routes';
import { createAuditRouter } from './routes/audits.routes';
import { createLedgerRouter } from './routes/ledger.routes';
import dashboardRouter  from './routes/dashboard.routes';
import cors from 'cors';
import dotenv from 'dotenv';
import { AuditController } from './controllers/audits.controller';

dotenv.config();

const app = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://payroll-sim-engine.vercel.app"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

const employeeRepo = new EmployeeRepo();
const payrollRepo = new PayrollRepo();
const auditRepo = new AuditRepo();
const ledgerRepo = new LedgerRepo();

const taxService = new TaxService();
const ledgerService = new LedgerService(pool, ledgerRepo);
const payrollService = new PayrollService(pool, payrollRepo, employeeRepo, auditRepo, taxService, ledgerRepo);

const employeesController = new EmployeesController(pool, employeeRepo);
const payInputsController = new PayInputsController(pool, employeeRepo);
const payrollController = new PayrollController(payrollService);
const auditController = new AuditController(pool, auditRepo);
const ledgerController = new LedgerController(ledgerService);

app.use("/employees", createEmployeesRouter(employeesController));
app.use("/pay-inputs", createPayInputsRouter(payInputsController));
app.use("/payroll", createPayrollRouter(payrollController));
app.use("/audit", createAuditRouter(auditController));
app.use("/ledger", createLedgerRouter(ledgerController));
app.use("/dashboard", dashboardRouter);

export default app;
