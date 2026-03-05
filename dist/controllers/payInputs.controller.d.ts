import { Request, Response } from 'express';
import { Pool } from 'pg';
import { EmployeeRepo } from '../repositories/employee.repo';
export declare class PayInputsController {
    private pool;
    private employeeRepo;
    constructor(pool: Pool, employeeRepo: EmployeeRepo);
    upsertPayInput: (req: Request, res: Response) => Promise<void>;
    getPayInputsForPeriod: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=payInputs.controller.d.ts.map