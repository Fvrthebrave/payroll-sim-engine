import { Pool, PoolClient } from 'pg';
import { PayrollRepo } from "../../repositories/payroll.repo";
import { EmployeeRepo } from "../../repositories/employee.repo";
import { AuditRepo } from "../../repositories/audits.repo";
import { LedgerRepo } from "../../repositories/ledger.repo";
import { TaxService } from "../tax/tax.service";
import { redis } from "../../db/redis";


export class PayrollService {
  constructor(
    private pool: Pool,
    private payrollRepo: PayrollRepo,
    private employeeRepo: EmployeeRepo,
    private auditRepo: AuditRepo,
    private taxService: TaxService,
    private ledgerRepo: LedgerRepo
  ) {};

  async runPayroll(params: {
    periodStart: string;
    periodEnd: string;
    idempotencyKey: string;
  }) {
    const client = await this.pool.connect() as PoolClient;

    try {
      await client.query("BEGIN");

      // Create run (insert-first idempotency)
      let run = await this.payrollRepo.createRun(client, {
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        idempotencyKey: params.idempotencyKey,
        status: "queued",
      });

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

      await redis.lpush("payroll_jobs", JSON.stringify({ runId: run.id }))

      console.log("Queued payroll job:", run.id);

      await client.query("COMMIT");
      return  {
        id: run.id,
        status: "queued"
      }
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async processPayrollRun(client: PoolClient, runId: string) {
    const run = await this.payrollRepo.getRunById(client, runId);

    console.log(run);
    
    if(!run) {
      throw new Error("Payroll not found");
    }

    const employees = await this.employeeRepo.getAll(client);

    const inputsByEmp = await this.employeeRepo.getPayInputsForPeriod(client, {
      employeeIds: employees.map((e) => e.id),
      periodStart: run.period_start,
      periodEnd: run.period_end
    })

    for(const emp of employees) {

      const input = inputsByEmp[emp.id] ?? {
        regular_hours: 0,
        overtime_hours: 0,
        bonus_cents: 0,
        deductions_cents: 0
      };

      const grossCents = this.computeGrossCents(emp, input);
      const taxCents = this.taxService.computeTaxCents(grossCents);
      const deductionCents = input.deductions_cents;
      const netCents = grossCents - taxCents - deductionCents;

      await this.ledgerRepo.insertEntry(client,  {
        payrollRunId: run.id,
        employeeId: emp.id,
        account: "payroll_expense",
        debitCents: grossCents,
        creditCents: 0,
        metaData: { employee: emp.id }
      });

      await this.ledgerRepo.insertEntry(client, {
        payrollRunId: run.id,
        employeeId: emp.id,
        account: "tax_liability",
        debitCents: 0,
        creditCents: taxCents
      });

      await this.ledgerRepo.insertEntry(client, {
        payrollRunId: run.id,
        employeeId: emp.id,
        account: "cash",
        debitCents: 0,
        creditCents: netCents
      });

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
          bonusCents: Number(input.bonus_cents)
        }
      });

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