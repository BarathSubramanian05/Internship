import React, { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import styles from "./ClaimRequests.module.css";

const ClaimRequests = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
      const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
      if (!isLoggedIn) {
        window.location.replace("/admin-login"); 
      }
    }, []);

    const fetchRequests = async () => {
      try {
        const res = await axios.get("http://localhost:8080/request/"); 
        setRequests(res.data || []); 
      } catch (err) {
        console.error("Error fetching claim requests:", err);
        alert("Failed to load claim requests");
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchRequests();
  }, []);


  
  const handleApprove = async (req) => {
    try {
      console.log(req.employeeId);
      await axios.put('http://localhost:8080/request/toggle',null,{
        params:{
          employeeId:req.employeeId,
          date:req.date,
        }
      });
      
      await fetchRequests();
      console.log(req.date);
    }  catch (err) {
    if (err.response && err.response.status === 404) 
      {
        console.log(err.response.data);
         console.log("hekoo");
      const { employeeId, date } = err.response.data;
      try {
        await axios.post("http://localhost:8080/attendance/addDate", null, {
          params: { employeeId, date },
        });
        await fetchRequests();
      } catch (fallbackErr) {
        console.error("Error creating new request:", fallbackErr);
        alert("Failed to create request");
      }
    } else {
      console.error("Error approving request:", err);
      alert("Failed to approve request");
    }
    alert(`✅ Approved request for ID ${req.employeeId}`);
  }
};

 
  const handleReject = async (req) => {
    try {
      await axios.delete('http://localhost:8080/request/delete',{
        params:{
          employeeId:req.employeeId,
          date:req.date,
        }
      });
      alert(`❌ Rejected request for ID ${req.employeeId}`);
      
       await fetchRequests();
    } catch (err) {
      console.error("Error rejecting request:", err);
      alert("Failed to reject request");
    }
  };

  return (
    <div className={styles.requestsContainer}>
      <button
        className={styles.backBtn}
        onClick={() => navigate("/admin-login/card")}
      >
        <FaArrowLeft /> Back
      </button>

      <h2>Claim Requests</h2>

      {loading ? (
  <p>Loading requests...</p>
) : requests.length === 0 ? (
  <p className={styles.noRequests}>No pending requests </p>
) : (
  <table className={styles.requestsTable}>
    <thead>
      <tr>
        <th>ID</th>
        <th>Date</th>
        <th>Reason</th>
        <th style={{textAlign:"center"}}>Actions</th>
      </tr>
    </thead>
    <tbody>
      {requests.map((req) => (
        <tr key={req.id}>
          <td>{req.employeeId}</td>
          <td>{req.date}</td>
          <td>{req.reason}</td>
          <td className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.approve}`}
              onClick={() => handleApprove(req)}
            >
              <FaCheck />
            </button>
            <button
              className={`${styles.btn} ${styles.reject}`}
              onClick={() => handleReject(req)}
            >
              <FaTimes />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}

    </div>
  );
};

export default ClaimRequests;