import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./AddAgency.css";
import axios from "axios";

function AddAgency() {
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [customType, setCustomType] = useState("");

  // form state
  const [agencyName, setAgencyName] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  const agencyOptions = [
    "Catering",
    "Sanitary",
    "Transport",
    "Security",
    "Maintenance",
    "Custom",
  ];

  // force login check
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      window.location.replace("/admin-login");
    }
  }, []);

  // toggle selection
  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }

    if (type !== "Custom" && selectedTypes.includes("Custom")) {
      setCustomType("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalTypes = selectedTypes.includes("Custom")
      ? [...selectedTypes.filter((t) => t !== "Custom"), customType]
      : selectedTypes;

    const requestBody = {
      agencyName,
      agencyType: finalTypes.join(", "),
      contactPersonName,
      phoneNumber: phoneNumber ? parseInt(phoneNumber) : null,
      email,
      status: true,
    };

    console.log("Submitting agency:", requestBody);

    try {
      await axios.post("http://localhost:8080/agency/addagency", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      alert("Agency added successfully!");
      navigate("/admin-login/card");
    } catch (err) {
      console.error("Error saving agency:", err);
      alert("Failed to save agency. Check console for details.");
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
            <label className="form-label">Agency Name</label>
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
  <label className="form-label">Agency Type</label>
  <div className="custom-dropdown">
    {/* Header */}
    <div
      className="dropdown-header"
      onClick={() => setShowDropdown(!showDropdown)}
    >
      {selectedTypes.length > 0
        ? selectedTypes
            .map((t) => (t === "Custom" ? customType || "Custom" : t))
            .join(", ")
        : "Select agency type(s)"}
      <span className="arrow">{showDropdown ? "▲" : "▼"}</span>
    </div>

    {/* Dropdown List */}
{showDropdown && (
  <div className="dropdown-list">
    {agencyOptions.map((type, idx) => (
      <label
        key={idx}
        className="dropdown-item d-flex align-items-center gap-2"
        style={{ cursor: "pointer" }}
      >
        <input
          type="checkbox"
          className="form-check-input"
          style={{ margin: 0 }}
          checked={selectedTypes.includes(type)}
          onChange={() => {
            handleTypeToggle(type);
            if (type === "Custom") {
              setShowDropdown(false); // 🔥 auto-close if Custom selected
            }
          }}
        />
        <span>{type}</span>
      </label>
    ))}

    {/* Done button */}
    {!selectedTypes.includes("Custom") && (
      <div className="dropdown-actions">
        <button
          type="button"
          className="btn btn-sm btn-success mt-2 w-100"
          onClick={() => setShowDropdown(false)}
        >
          Done
        </button>
      </div>
    )}
  </div>
)}
  </div>
</div>

{/* Custom input if Custom selected */}
{selectedTypes.includes("Custom") && (
  <div className="mb-3">
    <label className="form-label">Custom Agency Type</label>
    <input
      type="text"
      className="form-control"
      value={customType}
      onChange={(e) => setCustomType(e.target.value)}
      placeholder="Enter custom agency type"
      required
    />
  </div>
)}


          <div className="mb-3">
            <label className="form-label">Contact Person Name</label>
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
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter phone number"
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
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
