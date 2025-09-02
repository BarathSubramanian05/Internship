import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Detail.module.css";

// Helper: Calculate work hours
// ... imports remain the same

// Helper: Calculate work hours
const calculateWorkHours = (inTime, outTime) => {
  if (!inTime || !outTime || inTime === "--" || outTime === "--") return 0;
  try {
    const inDate = new Date(inTime);
    const outDate = new Date(outTime);
    let diff = (outDate - inDate) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    return parseFloat(diff.toFixed(2));
  } catch (err) {
    return 0;
  }
};

// Helper: Session status
const getSessionStatus = (workHours, inTime) => {
  if (!inTime || workHours === 0) {
    return { fn: "Absent", an: "Absent" };
  }

  const inDate = new Date(inTime);
  const inHour = inDate.getHours();
  const inMinute = inDate.getMinutes();

  // If total work hours >= 5 → both sessions present
  if (workHours >= 5) {
    return { fn: "Present", an: "Present" };
  }

  // Work hours < 5 → choose session based on check-in time
  const checkinMinutes = inHour * 60 + inMinute;

  if (checkinMinutes < 13 * 60) {
    // Before 1:00 PM
    return { fn: "Present", an: "Absent" };
  } else {
    return { fn: "Absent", an: "Present" };
  }
};


// Formatters
const formatTime = (dateTime) => {
  if (!dateTime || dateTime === "--") return "--";
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return "--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateTime) => {
  if (!dateTime) return "--";
  const date = new Date(dateTime);
  return isNaN(date.getTime()) ? "--" : date.toLocaleDateString();
};

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empResp = await axios.get(`http://localhost:8080/employee/${id}`);
        setEmployee(empResp.data);

        const attResp = await axios.get(`http://localhost:8080/attendance/${id}`);
        if (attResp.data?.attendance) {
          const mapped = attResp.data.attendance.map((rec) => {
            const status = rec.inTime ? "Present" : "Absent";
            const workHours = calculateWorkHours(rec.inTime, rec.outTime);
            const sessionStatus = getSessionStatus(workHours, rec.inTime);
return {
  ...rec,
  status: rec.inTime ? "Present" : "Absent",
  workHours,
  ...sessionStatus,
};

          });
          setAttendance(mapped);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch employee or attendance data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const safeDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  let filteredRecords = attendance;

  if (selectedDate) {
    filteredRecords = filteredRecords.filter((r) => {
      const d = safeDate(r.inTime);
      return d ? d.toISOString().slice(0, 10) === selectedDate : false;
    });
  }

  if (selectedMonth) {
    filteredRecords = filteredRecords.filter((r) => {
      const d = safeDate(r.inTime);
      return d ? d.getMonth() + 1 === parseInt(selectedMonth, 10) : false;
    });
  }

  if (selectedYear) {
    filteredRecords = filteredRecords.filter((r) => {
      const d = safeDate(r.inTime);
      return d ? d.getFullYear() === parseInt(selectedYear, 10) : false;
    });
  }

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleClearFilters = () => {
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedYear("");
    setCurrentPage(1);
  };

  const yearsSet = new Set();
  attendance.forEach((r) => {
    const d = safeDate(r.inTime);
    if (d) yearsSet.add(d.getFullYear());
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!employee) return <div className={styles.error}>Employee not found</div>;

  return (
    <div className={styles.detailContainer}>
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <h3>Employee Info</h3>
          <div className={styles.employeeInfo}>
            <p><strong>Employee ID:</strong> {employee.employeeId}</p>
            <p><strong>Name:</strong> {employee.name}</p>
            <p><strong>Gender:</strong> {employee.gender}</p>
            <p><strong>Phone:</strong> {employee.phoneNumber || "N/A"}</p>
            <p><strong>Address:</strong> {employee.address || "N/A"}</p>
            <p><strong>Role:</strong> {employee.role}</p>
            <p><strong>Salary:</strong> ₹{employee.salary?.toLocaleString() || "N/A"}</p>
            <p><strong>Agency ID:</strong> {employee.agencyId || "N/A"}</p>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.headerRow}>
            <h3>Attendance Records</h3>
            <div className={styles.filterBox}>
              <label>Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <label>Month:</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">All</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
              <label>Year:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All</option>
                {sortedYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
              <button onClick={handleClearFilters}>Clear</button>
            </div>
          </div>

          {attendance.length === 0 ? (
            <p className={styles.noRecords}>No attendance data available.</p>
          ) : currentRecords.length === 0 ? (
            <p className={styles.noRecords}>No records found.</p>
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
                    <th>FN</th>
                    <th>AN</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((rec, idx) => (
                    <tr key={idx} className={rec.status === "Absent" ? styles.absentRow : ""}>
                      <td>{formatDate(rec.inTime)}</td>
                      <td>{rec.status}</td>
                      <td>{formatTime(rec.inTime)}</td>
                      <td>{formatTime(rec.outTime)}</td>
                      <td>{rec.workHours}</td>
                      <td>{rec.fn}</td>
                      <td>{rec.an}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {currentPage > 1 && (
                    <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? styles.activePage : ""}
                    >
                      {i + 1}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;


