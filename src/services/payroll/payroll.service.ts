import { Pool } from 'pg';
import { PayrollRepo } from "../../repositories/payroll.repo";
import { EmployeeRepo } from "../../repositories/employee.repo";
import { AuditRepo } from "../../repositories/audits.repo";
import { TaxService } from "../tax/tax.service";

export class PayrollService {
  constructor(
    private pool: Pool,
    private payrollRepo: PayrollRepo,
    private employeeRepo: EmployeeRepo,
    private auditRepo: AuditRepo,
    private taxService: TaxService
  ) {};

  async runPayroll(params: {
    periodStart: string;
    periodEnd: string;
    idempotencyKey: string;
  }) {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // 1) Create run (insert-first idempotency)
      let run = await this.payrollRepo.createRun(client, {
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        idempotencyKey: params.idempotencyKey,
        status: "processing",
      });

      // 2) If conflict, wait until the winning tx commits and row is visible
      if (!run) {
        for (let i = 0; i < 10; i++) {
          run = await this.payrollRepo.getRunByIdempotencyKey(
            client,
            params.idempotencyKey
          );

          if (run) break;
          await new Promise(r => setTimeout(r, 50))
        }

        if (!run) {
          throw new Error("Idempotency conflict: run not visible after retries");
        }

        await client.query("COMMIT");
        return run;
      }

      // 3) Fetch employees + pay inputs
      const employees = await this.employeeRepo.getAll(client);
      const inputsByEmp = await this.employeeRepo.getPayInputsForPeriod(client, {
        employeeIds: employees.map((e) => e.id),
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
      });

      // 4) Insert entries for all employees
      for (const emp of employees) {
        const input =
          inputsByEmp[emp.id] ?? {
            regular_hours: 0,
            overtime_hours: 0,
            bonus_cents: 0,
            deductions_cents: 0,
          };

        
        const grossCents = this.computeGrossCents(emp, input);
        const taxCents = this.taxService.computeTaxCents(grossCents);
        const deductionCents = input.deductions_cents;
        const netCents = grossCents - taxCents - deductionCents;

        await this.payrollRepo.insertEntry(client, {
          payrollRunId: run.id,
          employeeId: emp.id,
          grossCents,
          taxCents,
          deductionCents,
          netCents,
          details: {
            employeeType: emp.employee_type,
            baseRateCents: emp.base_rate_cents,
            regularHours: Number(input.regular_hours),
            overtimeHours: Number(input.overtime_hours),
            bonusCents: Number(input.bonus_cents),
          },
        });
      }

      // 5) Mark completed once
      const completed = await this.payrollRepo.markCompleted(client, run.id);

      await this.auditRepo.insert(client, {
        entity_type: "payroll_run",
        entity_id: run.id,
        action: "completed",
        metadata: { periodStart: params.periodStart, periodEnd: params.periodEnd },
      });

      await client.query("COMMIT");
      return completed;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  private computeGrossCents(emp: any, input: any): number {
    if(emp.employee_type === 'salary') {
      return emp.base_rate_cents + input.bonus_cents;
    }

    //hourly
    const reg = Math.round(Number(input.regular_hours) * emp.base_rate_cents);
    const otRate = Math.round(emp.base_rate_cents * 1.5);
    const ot = Math.round(Number(input.overtime_hours) * otRate);
    return reg + ot + input.bonus_cents;
  }
}