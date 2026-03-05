import { useState, useEffect } from "react";
import api from "../api";

function Ledger() {
  const [ledger, setLedger] = useState([]);

  const formatDateTime = (isoValue) => {
    if (!isoValue) return "-";
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return isoValue;
    return date.toLocaleString();
  };

  useEffect(() => {
    const load = async () => {
      const res = await api.get("/audit/logs");
      
      console.log(res.data);
      setLedger(res.data);
    };

    load();
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">Accounting</p>
        <h2>Payroll Ledger</h2>
        <p className="subtle">Recent payroll-related entries prepared for reconciliation.</p>
      </header>

      <div className="card ledger-table-card">
        <div className="list-row pay-inputs-table-header">
          <h3>Audit Activity</h3>
          <span className="pill">{ledger.length} records</span>
        </div>

        <div className="table-wrap ledger-table-wrap">
          <table className="pay-inputs-table ledger-table">
            <colgroup>
              <col className="ledger-col-type" />
              <col className="ledger-col-action" />
              <col className="ledger-col-created" />
            </colgroup>
            <thead>
              <tr>
                <th>Type</th>
                <th>Action</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan={3} className="ledger-empty">No ledger events found.</td>
                </tr>
              ) : (
                ledger.map((item) => (
                  <tr key={item.id}>
                    <td>{item.entity_type}</td>
                    <td>{item.action}</td>
                    <td>{formatDateTime(item.created_at)}</td>
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

export default Ledger;
