import { Request, Response } from 'express';
import { Pool } from 'pg';
import { EmployeeRepo } from '../repositories/employee.repo';
export declare class EmployeesController {
    private pool;
    private employeeRepo;
    constructor(pool: Pool, employeeRepo: EmployeeRepo);
    createEmployee: (req: Request, res: Response) => Promise<void>;
    listEmployees: (_req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=employees.controller.d.ts.map