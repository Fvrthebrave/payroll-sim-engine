import { useEffect, useState } from "react";
import api from "../api";

function LedgerBalances() {
  const [balances, setBalances] = useState([]);
  const resolveCategory = (account = "") => {
    if (account.includes("expense")) return "expense";
    if (account.includes("liability") || account.includes("payable")) return "liability";
    return "asset";
  };

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/ledger/balances");
      setBalances(Array.isArray(res.data) ? res.data : []);
    };

    load();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Accounting</p>
        <h2>Ledger Balances</h2>
        <p className="subtle">Current account balances across payroll ledger entries.</p>
      </header>

      <div className="card ledger-table-card">
        <div className="list-row pay-inputs-table-header">
          <h3>Account Balances</h3>
          <span className="pill">{balances.length} accounts</span>
        </div>

        <div className="table-wrap">
          <table className="pay-inputs-table ledger-table ledger-balances-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances.length === 0 ? (
                <tr>
                  <td colSpan={2} className="ledger-empty">No balances available.</td>
                </tr>
              ) : (
                balances.map((row) => (
                  <tr key={row.account}>
                    <td>
                      <span className={`type-chip type-chip--${resolveCategory(row.account)}`}>
                        {row.label ?? row.account}
                      </span>
                    </td>
                    <td>${(Number(row.balance || 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default LedgerBalances;
