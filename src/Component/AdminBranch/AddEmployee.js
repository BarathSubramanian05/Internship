import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddEmployee.css";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AddEmployee() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const [employee, setEmployee] = useState({ 
    name: "", 
    gender: "", 
    phoneNumber: "", 
    address: "", 
    role: "", 
    salary: "", 
    agencyId: aid,
    startTime: "",
    endTime: ""
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      
      const employeeData = {
        ...employee,
        phoneNumber: employee.phoneNumber ? parseInt(employee.phoneNumber) : null,
        salary: employee.salary ? parseFloat(employee.salary) : 0,
      };
      
      console.log("Submitting employee data:", employeeData);
      

      const response = await axios.post(
        "http://localhost:8080/employee/addemployee", 
        employeeData
      );
      
      console.log("Employee saved successfully:", response.data);
      alert("Employee saved successfully!");
      navigate(`/admin-login/display/${aid}`);
      
      
      setEmployee({ 
        name: "", 
        gender: "", 
        phoneNumber: "", 
        address: "", 
        role: "", 
        salary: "", 
        agencyId: aid ,
        startTime: "",
        endTime: ""

      });
      
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Failed to save employee. Please check the console for details.");
    }
  };

  return (
    <div className="add-employee-container">
      <div className="card shadow p-4 employee-card">
        <h2 className="text-center mb-4">Add Employee</h2>
        <div className="alert alert-info mb-4">
          <strong>Agency ID:</strong> {aid}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Employee Name *</label>
            <input 
              type="text" 
              className="form-control" 
              name="name" 
              value={employee.name} 
              onChange={handleChange} 
              placeholder="Enter employee name" 
              required 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Gender *</label>
            <select 
              className="form-control" 
              name="gender" 
              value={employee.gender} 
              onChange={handleChange} 
              required
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Phone Number *</label>
            <input 
              type="tel" 
              className="form-control" 
              name="phoneNumber" 
              maxLength={10}
              value={employee.phoneNumber} 
              onChange={handleChange} 
              placeholder="Enter phone number" 
              required 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea 
              className="form-control" 
              name="address" 
              value={employee.address} 
              onChange={handleChange} 
              placeholder="Enter address" 
              rows="3"
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Role *</label>
            <input 
              type="text" 
              className="form-control" 
              name="role" 
              value={employee.role} 
              onChange={handleChange} 
              placeholder="Enter role" 
              required 
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label">Salary *</label>
            <input 
              type="number" 
              className="form-control" 
              name="salary" 
              value={employee.salary} 
              onChange={handleChange} 
              placeholder="Enter salary" 
              step="0.01"
              min="0"
              required 
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Start Time *</label>
            <input 
              type="time" 
              className="form-control" 
              name="startTime" 
              value={employee.startTime} 
              onChange={handleChange} 
              placeholder="Enter Time" 
              step="60"
              required 
            />
          </div>

          <div className="mb-4">
            <label className="form-label">End Time *</label>
            <input 
              type="time" 
              className="form-control" 
              name="endTime" 
              value={employee.endTime} 
              onChange={handleChange} 
              placeholder="Enter Time" 
              step="60"
              required 
            />
          </div>
          
          {/* Hidden field for agencyId */}
          <input 
            type="hidden" 
            name="agencyId" 
            value={employee.agencyId} 
          />
          
          <div className="text-center">
            <button type="submit" className="btn btn-primary px-4">Save Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddEmployee;