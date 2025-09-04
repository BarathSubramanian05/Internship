import React, { useState } from "react";
import styles from "./ClaimRequest.module.css";
import { useContext } from "react";
import { EmployeeContext } from "../../Context/EmployeeContext";
import axios
 from "axios";

const ClaimRequest = () => {
  const { employee } = useContext(EmployeeContext);
  //console.log(employee);
  const [userId, setUserId] = useState(employee.employeeId);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !date  || !description) {
      setError("Please fill in all fields.");
      setMessage(""); 
      return;
    }
    setError("");
    
    const requestData = {
      employeeId: userId, // must match your Java model field
      date: date, // should be in yyyy-MM-dd format (input type=date already gives this)
      reason:description // default value since form does not have this field
    };

    try {
      const response = await axios.post("http://localhost:8080/request/addrequest", requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Response:", response.data);
      setMessage("Your claim request has been sent to the admin.");
    } catch (err) {
      console.error("Error submitting request:", err);
      setError("Failed to send claim request. Try again.");
    }


    // Set the success message
    setMessage("Your claim request has been sent to the admin.");

    // Hide the message after 5 seconds (5000 milliseconds)
    setTimeout(() => {
      setMessage("");
    }, 5000);

    // Reset form fields after submission
    setUserId("");
    setDate("");
    setDescription("");
  };

  return (
    <div className={styles.claimContainer}>
      <div className={styles.claimBox}>
        <h2>Claim Attendance</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="userId">User ID</label>
          <input
            type="text"
            id="userId"
            placeholder="Enter your User ID"
            value={userId}
            readOnly
            required
          />

          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            required
          />

          <label htmlFor="description">Reason for Request</label>
          <textarea
            id="description"
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>

          <button type="submit" className={styles.submitButton}>
            Submit Request
          </button>
        </form>
        {message && <div className={styles.message}>{message}</div>}
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
};

export default ClaimRequest;