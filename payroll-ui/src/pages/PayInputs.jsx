import { useState, useEffect } from 'react';
import api from '../api';

function PayInputs() {
  const [employees, setEmployees] = useState([]);
  const [payInputs, setPayInputs] = useState({});
  const [periodStart, setPeriodStart] = useState("2026-03-01");
  const [periodEnd, setPeriodEnd] = useState("2026-03-15");

  const [form, setForm] = useState({
    employeeId: "",
    regularHours: 0,
    overtimeHours: 0,
    bonus: 0,
    deductions: 0
  });

  const loadPayInputs = async () => {
    const res = await api.get(`/pay-inputs?periodStart=${periodStart}&periodEnd=${periodEnd}`);

    setPayInputs(res.data.payInputs || {});
  };

  useEffect(() => {

    const load = async () => {
      const empRes = await api.get("/employees");
      setEmployees(empRes.data);

      const inputsRes = await api.get(`/pay-inputs?periodStart=${periodStart}&periodEnd=${periodEnd}`);
      setPayInputs(inputsRes.data.payInputs || {});
    };

    load();

  }, [periodStart, periodEnd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!form.employeeId) {
      alert('Select an employee');
      return;
    }

    try {
      await api.put(`/pay-inputs/${form.employeeId}`, {
        periodStart,
        periodEnd,
        regularHours: Number(form.regularHours),
        overtimeHours: Number(form.overtimeHours),
        bonusCents: Number(form.bonus) * 100,
        deductionsCents: Number(form.deductions) * 100
      });

      await loadPayInputs();
      alert("Pay inputs saved");

      setForm({
        employeeId: "",
        regularHours: 0,
        overtimeHours: 0,
        bonus: 0,
        deductions: 0
      });
    } catch(err) {
      console.error(err);
      alert("Failed to save pay inputs");
    }
  };

  return (
    <section className="page">
      
      <header className="page-header">
        <p className="eyebrow">Payroll</p>
        <h2>Enter Pay Inputs</h2>
        <p className="subtle">
          Record hours, bonuses, and deductions for the pay period.
        </p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="pay-period-row">
            <label className="field-group">
              <span>Payroll Start</span>
              <input
                className="input-field"
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </label>
            <label className="field-group">
              <span>Payroll End</span>
              <input
                className="input-field"
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </label>
          </div>

          <div className="form-grid pay-inputs-grid">
            <label className="field-group">
              <span>Employee</span>
              <select
                className="select-field"
                value={form.employeeId}
                onChange={(e) =>
                  setForm({ ...form, employeeId: e.target.value })
                }
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>Regular Hours</span>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.regularHours}
                onChange={(e) =>
                  setForm({ ...form, regularHours: e.target.value })
                }
                required
              />
            </label>

            <label className="field-group">
              <span>Overtime Hours</span>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.overtimeHours}
                onChange={(e) =>
                  setForm({ ...form, overtimeHours: e.target.value })
                }
                required
              />
            </label>

            <label className="field-group">
              <span>Bonus ($)</span>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.bonus}
                onChange={(e) =>
                  setForm({ ...form, bonus: e.target.value })
                }
              />
            </label>

            <label className="field-group">
              <span>Deductions ($)</span>
              <input
                className="input-field"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.deductions}
                onChange={(e) =>
                  setForm({ ...form, deductions: e.target.value })
                }
              />
            </label>
          </div>

          <button className="primary-btn form-submit-btn" type="submit">
            Save Pay Inputs
          </button>
        </form>

        <div className="card pay-inputs-table-card">
            <div className="list-row pay-inputs-table-header">
              <h3>Current Pay Inputs</h3>
              <span className="pill">{employees.length} employees</span>
            </div>

            <div className="table-wrap">
              <table className="pay-inputs-table">
                <colgroup>
                  <col className="pay-col-employee" />
                  <col className="pay-col-metric" />
                  <col className="pay-col-metric" />
                  <col className="pay-col-metric" />
                  <col className="pay-col-metric" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th className="numeric-col">Regular</th>
                    <th className="numeric-col">Overtime</th>
                    <th className="numeric-col">Bonus</th>
                    <th className="numeric-col">Deductions</th>
                  </tr>
                </thead>
                <tbody>

                  {employees.map(emp => {
                    const input = payInputs[emp.id] || {};

                    return (
                      <tr key={emp.id}>
                        <td>{emp.name}</td>
                        <td className="numeric-col">{input.regular_hours || 0}</td>
                        <td className="numeric-col">{input.overtime_hours || 0}</td>
                        <td className="numeric-col">${((input.bonus_cents || 0) / 100).toFixed(2)}</td>
                        <td className="numeric-col">${((input.deductions_cents || 0) / 100).toFixed(2)}</td>
                      </tr>
                    );

                  })}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </section>
  )
}

export default PayInputs;
