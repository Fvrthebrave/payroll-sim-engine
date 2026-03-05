import { useState, useEffect } from 'react';
import api from '../api';

function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/dashboard/summary");
      setSummary(res.data);
    }

    load();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Overview</p>
        <h2>Payroll Dashboard</h2>
        <p className="subtle">Track payroll health, costs, and upcoming processing tasks.</p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <h3>Active Employees</h3>
          <p>{summary?.active_employees ?? "-"}</p>
        </article>
        <article className="stat-card">
          <h3>Next Payroll Date</h3>
          <p>{summary?.next_payroll_date ?? "-"}</p>
        </article>
        <article className="stat-card">
          <h3>Proj Gross Pay</h3>
          <p>
            ${summary
              ? (summary.projected_gross_pay / 100).toLocaleString()
              : "-"}
          </p>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
