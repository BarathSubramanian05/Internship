import React, { useState } from "react";
import { FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa"; // ✅ Added Back icon
import { useNavigate } from "react-router-dom"; // ✅ For navigation
import styles from "./ClaimRequests.module.css";

const ClaimRequests = () => {
  const navigate = useNavigate(); // ✅ Hook for navigation

  const [requests, setRequests] = useState([
    {
      id: 1,
      name: "John Doe",
      empId: "EMP101",
      date: "2025-08-29",
      agency: "Catering Agency",
      reason: "Medical emergency leave"
    },
    {
      id: 2,
      name: "Jane Smith",
      empId: "EMP102",
      date: "2025-08-28",
      agency: "Sanitary Agency",
      reason: "Family function"
    },
  ]);

  const handleApprove = (id) => {
    alert(`✅ Approved request for ID ${id}`);
    setRequests(requests.filter((req) => req.id !== id));
  };

  const handleReject = (id) => {
    alert(`❌ Rejected request for ID ${id}`);
    setRequests(requests.filter((req) => req.id !== id));
  };

  return (
    <div className={styles.requestsContainer}>
      
      <button className={styles.backBtn} onClick={() => navigate("/admin-login/card")}>
        <FaArrowLeft /> Back
      </button>

      <h2>Claim Requests</h2>
      {requests.length === 0 ? (
        <p className={styles.noRequests}>No pending requests 🎉</p>
      ) : (
        requests.map((req) => (
          <div key={req.id} className={styles.requestCard}>
            <div>
              <h3>{req.name}</h3>
              <p><strong>ID:</strong> {req.empId}</p>
              <p><strong>Agency:</strong> {req.agency}</p>
              <p><strong>Date:</strong> {req.date}</p>
              <p><strong>Reason:</strong> {req.reason}</p>
            </div>
            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.approve}`}
                onClick={() => handleApprove(req.id)}
              >
                <FaCheck />
              </button>
              <button
                className={`${styles.btn} ${styles.reject}`}
                onClick={() => handleReject(req.id)}
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
export default ClaimRequests;