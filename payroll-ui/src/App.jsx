import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import PayrollRun from "./pages/PayrollRun";
import AuditLog from "./pages/AuditLog";
import PayInputs from "./pages/PayInputs";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <aside className="sidebar">
          <p className="brand-kicker">Finance Operations</p>
          <h1 className="brand-title">Payroll OS</h1>
          <nav className="nav-links" aria-label="Primary">
            <Link to="/">Dashboard</Link>
            <Link to="/employees">Employees</Link>
            <Link to="/payroll">Run Payroll</Link>
            <Link to="/audit-log">Audit Log</Link>
            <Link to="/pay-inputs">Pay Inputs</Link>
          </nav>
          <p className="sidebar-note">Connected to Payroll API</p>
        </aside>

        <main className="page-frame">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/payroll" element={<PayrollRun />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/pay-inputs" element={<PayInputs />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
