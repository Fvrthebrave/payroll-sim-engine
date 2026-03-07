import { PoolClient } from 'pg';

export const Accounts =  {
  PAYROLL_EXPENSE: "payroll_expense",
  TAX_LIABILITY: "tax_liability",
  CASH: "cash",
  DEDUCTIONS_PAYABLE: "deductions_payable"
};

export const AccountLabels: Record<string, string> = {
  payroll_expense: "Payroll Expense",
  tax_liability: "Tax Liability",
  cash: "Cash",
  deductions_payable: "Deductions Payable"
};

export class LedgerRepo {

  async insertEntry(client: PoolClient, entry: {
    payrollRunId: string,
    employeeId?: string,
    account: string,
    debitCents: number,
    creditCents: number,
    metaData?: any
  }) {

    await client.query(`
        INSERT INTO ledger_entries (
          payroll_run_id,
          employee_id,
          account,
          debit_cents,
          credit_cents,
          metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        entry.payrollRunId,
        entry.employeeId ?? null,
        entry.account,
        entry.debitCents,
        entry.creditCents,
        entry.metaData ?? {}
      ]);
  }

  async getBalances(client: PoolClient) {
    const result = await client.query(`
        SELECT 
          account,
          SUM(debit_cents - credit_cents) AS balance
          FROM ledger_entries
          GROUP BY account
          ORDER BY account
      `);

      return result.rows;
  }
}