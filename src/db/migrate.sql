CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  employee_type TEXT NOT NULL CHECK (employee_type IN ('hourly', 'salary')),
  base_rate_cents INTEGER NOT NULL CHECK (base_rate_cents >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pay inputs per employee per period
CREATE TABLE IF NOT EXISTS pay_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  regular_hours NUMERIC(7,2) NOT NULL CHECK (regular_hours >= 0),
  overtime_hours NUMERIC(7,2) NOT NULL CHECK (overtime_hours >= 0),

  bonus_cents INTEGER NOT NULL DEFAULT 0,
  deductions_cents INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(employee_id, period_start, period_end)
);

-- Payroll run
CREATE TABLE IF NOT EXISTS payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  status TEXT NOT NULL CHECK (
    status IN ('pending','processing','completed','failed')
  ),

  idempotency_key UUID NOT NULL UNIQUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Results per employee
CREATE TABLE IF NOT EXISTS payroll_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),

  gross_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL,
  deduction_cents INTEGER NOT NULL DEFAULT 0,
  net_cents INTEGER NOT NULL,

  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(payroll_run_id, employee_id)
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ledger entries
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),

  entry_type TEXT NOT NULL CHECK (
    entry_type IN ('gross_pay','tax','deduction','net_pay')
  ),

  amount_cents INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_pay_inputs_employee
ON pay_inputs(employee_id);

CREATE INDEX idx_payroll_entries_run
ON payroll_entries(payroll_run_id);

CREATE INDEX idx_payroll_runs_idempotency
ON payroll_runs(idempotency_key);