/*import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { dummyData } from "../data";
import styles from "./Detail.module.css";

const calculateWorkHours = (timeIn, timeOut) => {
  if (timeIn === "-" || timeOut === "-") return "-";

  const [inHour, inMin] = timeIn.split(":").map(Number);
  const [outHour, outMin] = timeOut.split(":").map(Number);

  const inDate = new Date(0, 0, 0, inHour, inMin);
  const outDate = new Date(0, 0, 0, outHour, outMin);

  let diff = (outDate - inDate) / (1000 * 60 * 60);

  if (diff < 0) diff += 24;
  return diff.toFixed(2);
};

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Use passed employee or fallback to lookup by id
  const employee =
    location.state?.employee || dummyData.find((emp) => emp.id === parseInt(id));

  if (!employee) {
    return (
      <div className={styles.error}>
        <p>No employee data found. Please go back and try again.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Attendance records for this employee, last 10 days
  const attendanceRecords = dummyData
    .filter((item) => item.id === employee.id && item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  return (
    <div className={styles.detailContainer}>
      <div className={styles.leftPanel}>
        <h2>Employee Details</h2>
        <p><strong>ID:</strong> {employee.id}</p>
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Agency:</strong> {employee.agency || employee.role}</p>
        <p><strong>Position:</strong> {employee.position}</p>
      </div>

      <div className={styles.rightPanel}>
        <h3>Last 10 Days Attendance</h3>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Work Hours</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No attendance records found.
                </td>
              </tr>
            )}
            {attendanceRecords.map((record, idx) => (
              <tr
                key={idx}
                className={record.status === "Absent" ? styles.absentRow : ""}
              >
                <td>{record.date}</td>
                <td>{record.status}</td>
                <td>{record.timeIn}</td>
                <td>{record.timeOut}</td>
                <td>{calculateWorkHours(record.timeIn, record.timeOut)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Detail;
*/
// src/Component/UserBranch/Details.js
import React from "react";

const Details = () => {
  return (
    <div>
      <h1>Attendance Details</h1>
      <p>Here are the details of your attendance.</p>
      {/* Add more content for the details page */}
    </div>
  );
};

export default Details;
