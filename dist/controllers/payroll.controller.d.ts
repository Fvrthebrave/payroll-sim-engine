import { Request, Response } from 'express';
import { PayrollService } from '../services/payroll/payroll.service';
export declare class PayrollController {
    private payrollService;
    constructor(payrollService: PayrollService);
    runPayroll: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=payroll.controller.d.ts.map