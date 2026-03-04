function Dashboard() {
  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Overview</p>
        <h2>Payroll Dashboard</h2>
        <p className="subtle">Track payroll health, costs, and upcoming processing tasks.</p>
      </header>

      <div className="stats-grid">
        <article className="stat-card">
          <p>Active Employees</p>
          <h3>42</h3>
          <span>+3 from last month</span>
        </article>
        <article className="stat-card">
          <p>Next Payroll Date</p>
          <h3>Mar 15</h3>
          <span>11 days remaining</span>
        </article>
        <article className="stat-card">
          <p>Projected Gross Pay</p>
          <h3>$96,420</h3>
          <span>Current cycle estimate</span>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;
