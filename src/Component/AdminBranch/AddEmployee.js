import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "./AddEmployee.css";

function AddEmployee() {
  const [employee, setEmployee] = useState({ name: "", role: "", contact: "", email: "", department: "" });
  const navigate = useNavigate();
  const handleChange = (e) => {
    setEmployee({ ...employee, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //console.log("Employee details:", employee);
    //alert("Employee details saved!");
    navigate("/admin-login/display/Employee");
  };

  return (
    <div className="add-employee-container">
      <div className="card shadow p-4 employee-card">
        <h2 className="text-center mb-4 text-primary">Add Employee</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Employee Name</label>
            <input type="text" className="form-control" name="name" value={employee.name} onChange={handleChange} placeholder="Enter employee name" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <input type="text" className="form-control" name="role" value={employee.role} onChange={handleChange} placeholder="Enter role" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Contact Number</label>
            <input type="tel" className="form-control" name="contact" value={employee.contact} onChange={handleChange} placeholder="Enter contact number" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={employee.email} onChange={handleChange} placeholder="Enter email address" required />
          </div>
          <div className="mb-4">
            <label className="form-label">Department</label>
            <input type="text" className="form-control" name="department" value={employee.department} onChange={handleChange} placeholder="Enter department" required />
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-primary px-4">Save Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;
