/*import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddAgency.css";

function AddAgency() {
  const [employees, setEmployees] = useState([{ name: "", role: "", contact: "" }]);

  // Handle agency form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Agency details submitted!");
    // Your API call logic here
  };

  // Handle employee field change
  const handleEmployeeChange = (index, e) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index][e.target.name] = e.target.value;
    setEmployees(updatedEmployees);
  };

  // Add new employee row
  const addEmployee = () => {
    setEmployees([...employees, { name: "", role: "", contact: "" }]);
  };

  return (
    <div className="add-agency-container">
      <div className="card shadow p-4 agency-card">
        <h2 className="text-center mb-4">Add New Agency</h2>
        <form onSubmit={handleSubmit}>
          {/* Agency Details }
          <h5 className="mb-3 section-title">Agency Details</h5>
          <div className="mb-3">
            <label className="form-label">Agency Name</label>
            <input type="text" className="form-control" placeholder="Enter agency name" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Agency Type</label>
            <input type="text" className="form-control" placeholder="e.g., Catering, Sanitary" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Number</label>
            <input type="tel" className="form-control" placeholder="Enter contact number" required />
          </div>

          <div className="mb-4">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email address" required />
          </div>

          {/* Employee Details }
          <h5 className="mb-3 section-title">Employee Details</h5>
          {employees.map((emp, index) => (
            <div key={index} className="employee-row">
              <input
                type="text"
                name="name"
                placeholder="Employee Name"
                value={emp.name}
                onChange={(e) => handleEmployeeChange(index, e)}
                className="form-control me-2"
                required
              />
              <input
                type="text"
                name="role"
                placeholder="Role"
                value={emp.role}
                onChange={(e) => handleEmployeeChange(index, e)}
                className="form-control me-2"
                required
              />
              <input
                type="tel"
                name="contact"
                placeholder="Contact"
                value={emp.contact}
                onChange={(e) => handleEmployeeChange(index, e)}
                className="form-control me-2"
                required
              />
            </div>
          ))}

          <button type="button" className="btn btn-outline-primary mt-3" onClick={addEmployee}>
            + Add Employee
          </button>

          {/* Submit }
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary px-4">
              Save Agency
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAgency;*/
import { useNavigate } from "react-router-dom"; // 
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddAgency.css";

function AddAgency() {

  // Handle agency form submission
  const navigate = useNavigate(); 
  const handleSubmit = (e) => {
    e.preventDefault();
    //console.log("Agency details submitted!");
    // Your API call logic here
    navigate("/admin-login/card");
  };

  return (
    <div className="add-agency-container">
      <div className="card shadow p-4 agency-card">
        <h2 className="text-center mb-4">Add New Agency</h2>
        <form onSubmit={handleSubmit}>
          {/* Agency Details */}
          <h5 className="mb-3 section-title">Agency Details</h5>

          <div className="mb-3">
            <label className="form-label">Agency Name</label>
            <input type="text" className="form-control" placeholder="Enter agency name" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Agency Type</label>
            <input type="text" className="form-control" placeholder="e.g., Catering, Sanitary" required />
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Number</label>
            <input type="tel" className="form-control" placeholder="Enter contact number" required />
          </div>

          <div className="mb-4">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter email address" required />
          </div>

          {/* Submit */}
          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary px-4">
              Save Agency
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddAgency;