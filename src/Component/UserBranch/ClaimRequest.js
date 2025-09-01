import React, { useState } from "react";
import styles from "./ClaimRequest.module.css";

const ClaimRequest = () => {
  const [userId, setUserId] = useState("");
  const [date, setDate] = useState("");
  const [agencyId, setagencyId] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId || !date || !agencyId || !description) {
      setError("Please fill in all fields.");
      setMessage(""); // Clear any previous success message
      return;
    }
    setError("");

    const requestData = {
      userId,
      date,
      agencyId,
      description,
    };
    console.log("Claim Request Submitted:", requestData);

    // Set the success message
    setMessage("Your claim request has been sent to the admin.");

    // Hide the message after 5 seconds (5000 milliseconds)
    setTimeout(() => {
      setMessage("");
    }, 5000);

    // Reset form fields after submission
    setUserId("");
    setDate("");
    setagencyId("");
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
            onChange={(e) => setUserId(e.target.value)}
            required
          />

          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label htmlFor="agencyId">Agency Id</label>
          <input
            type="text"
            id="agencyId"
            placeholder="Enter your User ID"
            value={agencyId}
            onChange={(e) => setagencyId(e.target.value)}
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