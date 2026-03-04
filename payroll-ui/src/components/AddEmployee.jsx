import { useState } from 'react';
import api from '../api';

function AddEmployee({ onEmployeeAdded }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("hourly");
  const [rate, setRate] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/employees', {
        name,
        employeeType: type,
        baseRateCents: Math.round(Number(rate) * 100)
      });

      onEmployeeAdded(res.data);

      setName("");
      setRate("");

    } catch(err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <div className="form-grid">
        <label className="field-group">
          <span>Name</span>
          <input
            className="input-field"
            placeholder="Employee name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>

        <label className="field-group">
          <span>Type</span>
          <select
            className="select-field"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="hourly">Hourly</option>
            <option value="salary">Salary</option>
          </select>
        </label>

        <label className="field-group">
          <span>Rate</span>
          <input
            className="input-field"
            placeholder="0.00"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            type="number"
            min="0"
            step="0.01"
            required
          />
        </label>
      </div>

      <button type="submit" className="primary-btn form-submit-btn">Add Employee</button>
    </form>
  );
}

export default AddEmployee;
