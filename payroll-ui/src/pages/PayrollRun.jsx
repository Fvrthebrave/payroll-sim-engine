import { useState } from 'react';
import api from '../api';

function PayrollRun() {
  const [results, setResults] = useState([]);
  const [responseData, setResponseData] = useState(null);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [failed, setFailed] = useState(false);

  const formatLabel = (value) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const formatPrimitive = (value, key = "") => {
    if (typeof value === "number" && key.endsWith("_cents")) {
      return `$${(value / 100).toFixed(2)}`;
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return String(value);
  };

  const renderObject = (obj) => {
    const entries = Object.entries(obj || {});
    if (entries.length === 0) {
      return <p className="subtle">No details returned.</p>;
    }

    return (
      <dl className="response-kv-grid">
        {entries.map(([key, value]) => {
          if (Array.isArray(value) || (value && typeof value === "object")) {
            return null;
          }

          return (
            <div className="response-kv-item" key={key}>
              <dt>{formatLabel(key)}</dt>
              <dd>{formatPrimitive(value, key)}</dd>
            </div>
          );
        })}
      </dl>
    );
  };

  const renderArrayTable = (title, items) => {
    if (!Array.isArray(items) || items.length === 0 || typeof items[0] !== "object" || items[0] === null) {
      return null;
    }

    const columns = Object.keys(items[0]);

    return (
      <div className="response-table-section" key={title}>
        <h4>{formatLabel(title)}</h4>
        <div className="table-wrap">
          <table className="pay-inputs-table response-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{formatLabel(column)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={`${title}-${idx}`}>
                  {columns.map((column) => (
                    <td key={`${title}-${idx}-${column}`}>{formatPrimitive(item[column], column)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const runPayroll = async () => {
    setCompleted(false);
    setFailed(false);
    setRunning(true);

    try {
      const res = await api.post("/payroll/run", {
        periodStart: "2026-03-01",
        periodEnd: "2026-03-15",
        idempotencyKey: crypto.randomUUID()
      });

      await new Promise(resolve => setTimeout(resolve, 5000));
      setResponseData(res.data);
      setResults(Array.isArray(res.data) ? res.data : (res.data?.results || []));
      setCompleted(true);
      setTimeout(() => {
        setCompleted(false);
      }, 2000);
    } catch(err) {
      console.error(err);
      setFailed(true);
      setTimeout(() => {
        setFailed(false);
      }, 1200);
    } finally {
      setRunning(false);
    }
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
          className={`primary-btn payroll-run-btn${completed ? " is-completed" : ""}${failed ? " is-failed" : ""}`}
          onClick={runPayroll}
          disabled={running || completed || failed}  
        >
          {running
            ? "Running..."
            : completed
              ? "Completed"
              : failed
                ? "Failed"
                : "Run Payroll Batch"}
        </button>

        {responseData && (
          <div className="card payroll-response-card">
            <div className="list-row payroll-response-header">
              <h3>Response Data</h3>
              <span className="pill">Formatted</span>
            </div>
            {renderObject(responseData)}
            {Object.entries(responseData)
              .filter(([, value]) => Array.isArray(value))
              .map(([key, value]) => renderArrayTable(key, value))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PayrollRun;
