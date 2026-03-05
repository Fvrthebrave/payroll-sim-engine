import { PoolClient } from 'pg';
type PayInputRow = {
    id: string;
    employee_id: string;
    period_start: Date;
    period_end: Date;
    regular_hours: number;
    overtime_hours: number;
    bonus_cents: number;
    deductions_cents: number;
    created_at: Date;
};
export declare class EmployeeRepo {
    getAll(client: PoolClient): Promise<any[]>;
    createEmployee(client: PoolClient, params: {
        name: string;
        employeeType: "hourly" | "salary";
        baseRateCents: number;
    }): Promise<any>;
    upsertPayInput(client: PoolClient, params: {
        employeeId: string;
        periodStart: string;
        periodEnd: string;
        regularHours: number;
        overtimeHours: number;
        bonusCents: number;
        deductionsCents: number;
    }): Promise<{
        payInput: any;
        inserted: boolean;
    }>;
    getPayInputsForPeriod(client: PoolClient, params: {
        employeeIds: string[];
        periodStart: string;
        periodEnd: string;
    }): Promise<Record<string, PayInputRow>>;
}
export {};
//# sourceMappingURL=employee.repo.d.ts.map