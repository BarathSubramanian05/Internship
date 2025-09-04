import React, { useState,useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import "./AddAgency.css";
import axios from "axios";

function AddAgency() {
  const [agencyName, setAgencyName] = useState("");
  const [agencyType, setAgencyType] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [status, setStatus] = useState(true);
  
  const navigate = useNavigate();
useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      window.location.replace("/admin-login"); // force login if session missing
    }
  }, []);
  // Handle agency form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare the request body according to the Java model
    const requestBody = {
      agencyName,
      agencyType,
      contactPersonName,
      phoneNumber: phoneNumber ? parseInt(phoneNumber) : null,
      email,
      address,
      pinCode: pinCode ? parseInt(pinCode) : 0,
      status
    };

    console.log("Sending data:", requestBody);

    try {
      const response = await axios.post(
        "http://localhost:8080/agency/addagency",
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      alert("Agency added successfully!");
      console.log("Server response:", response.data);
      navigate("/admin-login/card");
    } catch (err) {
      console.error("Error saving agency:", err);
      if (err.response && err.response.data) {
        console.error("Server error details:", err.response.data);
        alert(`Failed to save agency: ${JSON.stringify(err.response.data)}`);
      } else {
        alert("Failed to save agency. Please check the console for details.");
      }
    }
  };

  return (
    <div className="add-agency-container">
      <div className="card shadow p-4 agency-card">
        <h2 className="text-center mb-4">Add New Agency</h2>
        <form onSubmit={handleSubmit}>
          {/* Agency Details */}
          <h5 className="mb-3 section-title">Agency Details</h5>
          
          <div className="mb-3">
            <label className="form-label">Agency Name *</label>
            <input 
              type="text" 
              className="form-control" 
              value={agencyName} 
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Enter agency name" 
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Agency Type *</label>
            <select 
              className="form-control" 
              value={agencyType} 
              onChange={(e) => setAgencyType(e.target.value)}
              required
            >
              <option value="">Select Agency Type</option>
              <option value="Catering">Catering</option>
              <option value="Sanitary">Sanitary</option>
              <option value="Security">Security</option>
              <option value="Transportation">Transportation</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Person Name *</label>
            <input 
              type="text" 
              className="form-control" 
              value={contactPersonName} 
              onChange={(e) => setContactPersonName(e.target.value)}
              placeholder="Enter contact person name" 
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number *</label>
            <input 
              type="tel" 
              className="form-control" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter phone number" 
              required 
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              className="form-control" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address" 
              required 
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">Address</label>
            <textarea
              className="form-control" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter full address" 
              rows="3"
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label">PIN Code</label>
            <input 
              type="text" 
              className="form-control" 
              value={pinCode} 
              onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter PIN code" 
              maxLength="6"
            />
          </div>
          
          <div className="mb-4 form-check">
            <input 
              type="checkbox" 
              className="form-check-input" 
              checked={status} 
              onChange={(e) => setStatus(e.target.checked)}
              id="statusCheck"
            />
            <label className="form-check-label" htmlFor="statusCheck">
              Active Agency
            </label>
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