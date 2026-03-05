import { PoolClient } from 'pg';
export declare class PayrollRepo {
    getRunByIdempotencyKey(client: PoolClient, idempotencyKey: string, options?: {
        forUpdate: boolean;
    }): Promise<any>;
    createRun(client: PoolClient, params: {
        periodStart: string;
        periodEnd: string;
        idempotencyKey: string;
        status: 'queued' | 'completed' | 'failed';
    }): Promise<any>;
    insertEntry(client: PoolClient, params: {
        payrollRunId: number;
        employeeId: number;
        grossCents: number;
        taxCents: number;
        deductionCents: number;
        netCents: number;
        details: any;
    }): Promise<any>;
    markCompleted(client: PoolClient, payrollRunId: number): Promise<any>;
}
//# sourceMappingURL=payroll.repo.d.ts.map