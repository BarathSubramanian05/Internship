// src/Component/UserBranch/Details.js
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { EmployeeContext } from "../../Context/EmployeeContext";
import styles from "./UserDetail.module.css"; // make sure to import your CSS

const UserDetail = () => {
  const { employee } = useContext(EmployeeContext);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // axios.post("http://localhost:8080/attendance/addintime",null, {
  //          params:{ employeeId: employee.employeeId,
  //           inTime: currentTime}
  //         });
  console.log(employee);
  console.log(attendance);
  useEffect(() => {
    if (employee?.employeeId) {
      axios.get(`http://localhost:8080/attendance/${employee.employeeId}`)
        .then((res) => {
          const records = res.data.attendance.map((day) => ({
            inTime: day.inTime,
            outTime: day.outTime,
            status: day.inTime ? (day.outTime ? "Present" : "Checked In") : "Absent",
          }));
          setAttendance(records);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [employee]);

  const calculateHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "-";
    const start = new Date(inTime);
    const end = new Date(outTime);
    let diffMs = end - start;
    if (diffMs < 0) return "-";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!employee) return <p className={styles.error}>No employee found. Please log in again.</p>;
  if (loading) return <p>Loading attendance...</p>;

  return (
    <div className={styles.detailContainer}>
      {/* Left panel: Employee Info */}
      <div className={styles.leftPanel}>
        <h2>Employee Info</h2>
        <p><strong>ID:</strong> {employee.employeeId}</p>
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Agency ID:</strong> {employee.agencyId}</p>
        <p><strong>Position:</strong> {employee.role}</p>
      </div>

      {/* Right panel: Attendance Table */}
      <div className={styles.rightPanel}>
        <h3>Attendance Records</h3>
        {attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table className={styles.attendanceTable}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Status</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Working Hours</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((day, index) => (
                <tr
                  key={index}
                  className={day.status === "Absent" ? styles.absentRow : ""}
                >
                  <td>{index + 1}</td>
                  <td>{day.status}</td>
                  <td>{day.inTime ? new Date(day.inTime).toLocaleTimeString() : "-"}</td>
                  <td>{day.outTime ? new Date(day.outTime).toLocaleTimeString() : "-"}</td>
                  <td>{calculateHours(day.inTime, day.outTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
