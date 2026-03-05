import { Pool } from 'pg';
import { PayrollRepo } from "../../repositories/payroll.repo";
import { EmployeeRepo } from "../../repositories/employee.repo";
import { AuditRepo } from "../../repositories/audits.repo";
import { TaxService } from "../tax/tax.service";
export declare class PayrollService {
    private pool;
    private payrollRepo;
    private employeeRepo;
    private auditRepo;
    private taxService;
    constructor(pool: Pool, payrollRepo: PayrollRepo, employeeRepo: EmployeeRepo, auditRepo: AuditRepo, taxService: TaxService);
    runPayroll(params: {
        periodStart: string;
        periodEnd: string;
        idempotencyKey: string;
    }): Promise<any>;
    private computeGrossCents;
}
//# sourceMappingURL=payroll.service.d.ts.map