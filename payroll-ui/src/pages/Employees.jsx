import { useState, useEffect } from 'react';
import api from '../api';
import AddEmployee from '../components/AddEmployee';

function Employees() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.get("/employees")
      .then(res => {
        console.log(res.data);
        setEmployees(res.data)
      })
      .catch(err => {
        console.error(err);
      });
  }, []);

  const handleEmployeeAdded = (newEmployee) => {
    setEmployees([...employees, newEmployee]);
  }

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">People</p>
        <h2>Employees</h2>

        <p className="subtle">Directory synced from the Payroll API.</p>
      </header>

      <div className="card">
        <div className="list-row">
          <h3>Team Members</h3>
          <span className="pill">{employees.length} total</span>
        </div>

        <div className="table-wrap">
          <AddEmployee onEmployeeAdded={handleEmployeeAdded} />
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Employment Type</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td>
                    <span className="type-chip">{emp.employee_type}</span>
                  </td>
                  <td>
                    <span>${(emp.base_rate_cents / 100).toFixed(2)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Employees;
