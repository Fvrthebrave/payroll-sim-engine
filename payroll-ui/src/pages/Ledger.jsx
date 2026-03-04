function Ledger() {
  const entries = [
    { id: 1, date: "2026-02-28", label: "Payroll clearing", amount: "-$82,150" },
    { id: 2, date: "2026-03-01", label: "Tax liability accrual", amount: "-$12,510" },
    { id: 3, date: "2026-03-02", label: "Benefit premium accrual", amount: "-$4,240" }
  ];

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Accounting</p>
        <h2>Payroll Ledger</h2>
        <p className="subtle">Recent payroll-related entries prepared for reconciliation.</p>
      </header>

      <div className="card">
        {entries.map((entry) => (
          <div className="list-row ledger-row" key={entry.id}>
            <div>
              <h3>{entry.label}</h3>
              <p className="subtle">{entry.date}</p>
            </div>
            <strong>{entry.amount}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Ledger;
