import { useState } from 'react';
import api from '../api';

function PayrollRun() {
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);

  const runPayroll = async () => {
    setRunning(true);

    try {
      const res = await api.post("/payroll/run", {
        periodStart: "2026-03-01",
        periodEnd: "2026-03-15",
        idempotencyKey: crypto.randomUUID()
      });

      setResults(res.data);
    } catch(err) {
      console.error(err);
    }

    setRunning(false);
  };

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Process</p>
        <h2>Run Payroll</h2>
        <p className="subtle">Validate inputs and process the next payroll cycle with confidence.</p>
      </header>

      <div className="card">
        <div className="list-row">
          <div>
            <h3>Current Pay Cycle</h3>
            <p className="subtle">March 1 - March 15, 2026</p>
          </div>
          <span className="pill">Ready</span>
        </div>
        <div className="list-row">
          <div>
            <h3>Validation Checks</h3>
            <p className="subtle">Tax rules, benefit deductions, and overtime logic complete.</p>
          </div>
          <span className="pill">Passed</span>
        </div>
        {results.length > 0 && (
          <div className="card" style={{ marginTop: "20px" }}>
            <h3>Payroll Results</h3>

            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Gross Pay</th>
                </tr>
              </thead>

              <tbody>
                {results.map((r) => (
                  <tr key={r.employee_id}>
                    <td>{r.name}</td>
                    <td>${(r.gross_pay_cents / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button 
          type="button" 
          className="primary-btn"
          onClick={runPayroll}
          disabled={running}  
        >
          {running ? "Running..." : "Run Payroll Batch"}
        </button>
      </div>
    </section>
  );
}

export default PayrollRun;
