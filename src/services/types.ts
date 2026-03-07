export interface Employee {
  id: string;
  employee_type: "salary" | "hourly";
  base_rate_cents: number;
}

export interface PayInput {
  regular_hours: number;
  overtime_hours: number;
  bonus_cents: number;
  deduction_cents: number;
}