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


 const today = new Date().toISOString().split("T")[0];

// Helper: Session status
const getSessionStatus = (workHours, inTime) => {
  if (!inTime || workHours === 0) {
    return { fn: "Absent", an: "Absent" };
  }

  const inDate = new Date(inTime);
  const inHour = inDate.getHours();
  const inMinute = inDate.getMinutes();

    if (workHours < 1) {
    return { fn: "Absent", an: "Absent" };
  }

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
/*
const formatDate = (dateTime) => {
  if (!dateTime) return "--";
  const date = new Date(dateTime);
  return isNaN(date.getTime()) ? "--" : date.toLocaleDateString();
};
*/

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minDate, setMinDate] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const recordsPerPage = 10;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      window.location.replace("/admin-login"); // force login if session missing
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empResp = await axios.get(`http://localhost:8080/employee/${id}`);
        setEmployee(empResp.data);

        const attResp = await axios.get(`http://localhost:8080/attendance/${id}`);
        if (attResp.data?.attendance && attResp.data.attendance.length > 0) {
          // 1. Map backend records
          const mapped = attResp.data.attendance.map((rec) => {
  const workHours = calculateWorkHours(rec.inTime, rec.outTime);

  let sessionStatus = { fn: "--", an: "--" };
  let overallStatus = "--";

  const normalizedDate = rec.date
    ? rec.date
    : rec.inTime
    ? new Date(rec.inTime).toISOString().slice(0, 10)
    : null;

  const todayISO = new Date().toISOString().slice(0, 10);

  if (!rec.inTime && !rec.outTime && rec.date) {
    sessionStatus = { fn: "--", an: "--" };
    overallStatus = "Present";
  }

  else if (rec.outTime || normalizedDate !== todayISO) {
   
    sessionStatus = getSessionStatus(workHours, rec.inTime);
    overallStatus =
      sessionStatus.fn === "Absent" && sessionStatus.an === "Absent"
        ? "Absent"
        : "Present";
  }

  return {
    date: normalizedDate,
    inTime: rec.inTime,
    outTime: rec.outTime,
    status: overallStatus,
    workHours,
    fn: sessionStatus.fn,
    an: sessionStatus.an,
  };
});


          
          const sorted = [...mapped].sort((a, b) => {
  if (!a.date) return 1; 
  if (!b.date) return -1;
  return new Date(a.date) - new Date(b.date);
});

          const firstDate = new Date(sorted[0].date);
          const isoFirstDate = firstDate.toISOString().split("T")[0];
setMinDate(isoFirstDate);
          const today = new Date();

          
          const allDates = [];
          for (let d = new Date(firstDate); d <= today; d.setDate(d.getDate() + 1)) {
            allDates.push(new Date(d));
          }

          // 4. Fill missing dates as Absent
          // 4. Fill missing dates as Absent
const complete = allDates.map((d) => {
  const iso = d.toISOString().slice(0, 10);
  const found = mapped.find((rec) => rec.date === iso);
  if (found) return found;
  return {
    date: iso,
    inTime: null,
    outTime: null,
    status: "Absent",
    workHours: 0,
    fn: "Absent",
    an: "Absent",
  };
});

// 🔥 Sort in descending order (latest first)
const completeDesc = complete.sort((a, b) => new Date(b.date) - new Date(a.date));

setAttendance(completeDesc);

        }
      } catch (err) {
        console.error(err);
        setError("No attendance Data found for this employee.");
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
      const d = safeDate(r.date);
      return d ? d.toISOString().slice(0, 10) === selectedDate : false;
    });
  }

  if (selectedMonth) {
    filteredRecords = filteredRecords.filter((r) => {
      const d = safeDate(r.date);
      return d ? d.getMonth() + 1 === parseInt(selectedMonth, 10) : false;
    });
  }

  if (selectedYear) {
    filteredRecords = filteredRecords.filter((r) => {
      const d = safeDate(r.date);
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
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
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
            <p><strong>Start Time:</strong> {employee.startTime || "N/A"}</p>
            <p><strong>End Time:</strong> {employee.endTime || "N/A"}</p>
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
                max={today}
                min={minDate}
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
    <tr key={idx}>
      <td>{rec.date ? rec.date : "--"}</td>
      <td
        style={{
          color:
            rec.status === "Present"
              ? "green"
              : rec.status === "Absent"
              ? "red"
              : rec.status === "Holiday"
              ? "orange"
              : "inherit",
          fontWeight: "bold",
        }}
      >
        {rec.status}
      </td>
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
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Prev
                  </button>

                  <span>
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </button>
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


