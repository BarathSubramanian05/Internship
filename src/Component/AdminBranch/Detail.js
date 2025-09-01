import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Detail.module.css";

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No employee ID provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch employee details first
        console.log("Fetching employee details for ID:", id);
        const employeeResponse = await axios.get(
          `http://localhost:8080/employee/${id}`
        );
        console.log("Employee response:", employeeResponse.data);
        setEmployee(employeeResponse.data);

        // Then fetch attendance data
        try {
          console.log("Fetching attendance data for ID:", id);
          const attendanceResponse = await axios.get(
            `http://localhost:8080/attendance/${id}`
          );
          console.log("Attendance response:", attendanceResponse.data);
          
          if (attendanceResponse.data && attendanceResponse.data.attendance) {
            setAttendance(attendanceResponse.data);
          } else {
            console.log("No attendance data found");
          }
        } catch (attendanceError) {
          console.warn("No attendance data found:", attendanceError);
          // Continue without attendance data
        }
      } catch (err) {
        console.error("Error fetching employee data:", err);
        if (err.response) {
          console.error("Error response:", err.response.data);
          console.error("Error status:", err.response.status);
          setError(`Error: ${err.response.status} - ${err.response.data}`);
        } else {
          setError("Failed to fetch employee data. Please check if the backend is running.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const calculateWorkHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "-";

    try {
      const inDate = new Date(inTime);
      const outDate = new Date(outTime);
      
      const diffMs = outDate - inDate;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      return diffHours.toFixed(2);
    } catch (error) {
      console.error("Error calculating work hours:", error);
      return "-";
    }
  };

  const formatDate = (dateTime) => {
    if (!dateTime) return "-";
    
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const formatTime = (dateTime) => {
    if (!dateTime) return "-";
    
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error("Error formatting time:", error);
      return "-";
    }
  };

  const getStatus = (inTime, outTime) => {
    if (!inTime) return "Absent";
    if (!outTime) return "Present (No out-time)";
    return "Present";
  };

  if (loading) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.loading}>Loading employee data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.error}>
          <h3>Error Loading Employee Data</h3>
          <p>{error}</p>
          <div className={styles.troubleshooting}>
            <p>Please check:</p>
            <ul>
              <li>Is the backend server running on port 8080?</li>
              <li>Does the endpoint /employee/{id} exist?</li>
              <li>Check browser console for more details</li>
            </ul>
          </div>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className={styles.detailContainer}>
        <div className={styles.error}>
          <p>Employee not found</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  // Get attendance records, sorted by date (newest first)
  const attendanceRecords = attendance?.attendance
    ?.map((day, index) => ({
      date: day.inTime || new Date().toISOString(),
      inTime: day.inTime,
      outTime: day.outTime,
      status: getStatus(day.inTime, day.outTime),
      workHours: calculateWorkHours(day.inTime, day.outTime)
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10) || [];

  return (
    <div className={styles.detailContainer}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Employee Details</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <h3>Employee Information</h3>
          <div className={styles.employeeInfo}>
            <p><strong>ID:</strong> {employee.employeeId || employee.id || "N/A"}</p>
            <p><strong>Name:</strong> {employee.name || "N/A"}</p>
            <p><strong>Gender:</strong> {employee.gender === 'M' ? 'Male' : employee.gender === 'F' ? 'Female' : employee.gender || "N/A"}</p>
            <p><strong>Phone:</strong> {employee.phoneNumber || "N/A"}</p>
            <p><strong>Address:</strong> {employee.address || "N/A"}</p>
            <p><strong>Role:</strong> {employee.role || "N/A"}</p>
            <p><strong>Salary:</strong> {employee.salary ? `$${employee.salary.toFixed(2)}` : "N/A"}</p>
            <p><strong>Agency ID:</strong> {employee.agencyId || "N/A"}</p>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <h3>Attendance Records</h3>
          {attendanceRecords.length === 0 ? (
            <p className={styles.noRecords}>No attendance records found.</p>
          ) : (
            <>
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
                  {attendanceRecords.map((record, index) => (
                    <tr
                      key={index}
                      className={record.status === "Absent" ? styles.absentRow : ""}
                    >
                      <td>{formatDate(record.inTime || record.date)}</td>
                      <td>{record.status}</td>
                      <td>{formatTime(record.inTime)}</td>
                      <td>{formatTime(record.outTime)}</td>
                      <td>{record.workHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={styles.recordCount}>
                Showing {attendanceRecords.length} most recent records
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;