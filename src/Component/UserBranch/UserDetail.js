
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { EmployeeContext } from "../../Context/EmployeeContext";
import styles from "./UserDetail.module.css";


const calculateWorkHours = (inTime, outTime) => {
  if (!inTime || !outTime) return 0;
  try {
    const inDate = new Date(inTime);
    const outDate = new Date(outTime);
    let diff = (outDate - inDate) / (1000 * 60 * 60);
    if (diff < 0) diff += 24;
    return parseFloat(diff.toFixed(2));
  } catch {
    return 0;
  }
};


const getSessionStatus = (workHours, inTime) => {
  if (!inTime || workHours === 0) {
    return { fn: "Absent", an: "Absent" };
  }
  if (workHours < 1) {
    return { fn: "Absent", an: "Absent" };
  }
  const inDate = new Date(inTime);
  const checkinMinutes = inDate.getHours() * 60 + inDate.getMinutes();

  if (workHours >= 5) return { fn: "Present", an: "Present" };
  if (checkinMinutes < 13 * 60) return { fn: "Present", an: "Absent" };
  return { fn: "Absent", an: "Present" };
};


const formatTime = (dateTime) => {
  if (!dateTime) return "-";
  const d = new Date(dateTime);
  return isNaN(d.getTime())
    ? "-"
    : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const safeDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

const UserDetail = () => {
  const { employee } = useContext(EmployeeContext);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

useEffect(() => {
  if (employee?.employeeId) {
    axios
      .get(`http://localhost:8080/attendance/${employee.employeeId}`)
      .then((res) => {
        const todayISO = new Date().toISOString().slice(0, 10);

        
        const mapped = res.data.attendance.map((rec) => {
          let normalizedDate = null;
          if (rec.date) {
            normalizedDate = rec.date;
          } else if (rec.inTime) {
            const d = new Date(rec.inTime);
            normalizedDate = `${d.getFullYear()}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          }

          const workHours = calculateWorkHours(rec.inTime, rec.outTime);

          let sessionStatus = { fn: "--", an: "--" };
          let overallStatus = "--";

          if (!rec.inTime && !rec.outTime && rec.date) {
  sessionStatus = { fn: "Present", an: "Present" };
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
            workHours,
            status: overallStatus,
            ...sessionStatus,
          };
        });

        
        const sorted = [...mapped].sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(b.date) - new Date(a.date);
        });

        if (sorted.length === 0) {
          setAttendance([]);
          return;
        }

        const firstDate = new Date(sorted[0].date);
        const today = new Date();

       
        const allDates = [];
        for (let d = new Date(firstDate); d <= today; d.setDate(d.getDate() + 1)) {
          allDates.push(new Date(d));
        }

      
        const complete = allDates.map((d) => {
          const iso = d.toISOString().slice(0, 10);
          const found = mapped.find((rec) => rec.date === iso);
          if (found) return found;

          return {
            date: iso,
            inTime: null,
            outTime: null,
            workHours: 0,
            status: "Absent",
            fn: "Absent",
            an: "Absent",
          };
        });

        setAttendance(complete);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }
}, [employee]);



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
    const d = safeDate(r.date);
    if (d) yearsSet.add(d.getFullYear());
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

  if (!employee)
    return (
      <p className={styles.error}>No employee found. Please log in again.</p>
    );
  if (loading) return <p>Loading attendance...</p>;

  return (
    <div className={styles.detailContainer}>
      {/* Left Panel: Employee Info */}
      <div className={styles.leftPanel}>
        <h2>Employee Info</h2>
        <p><strong>ID:</strong> {employee.employeeId}</p>
        <p><strong>Name:</strong> {employee.name}</p>
        <p><strong>Agency ID:</strong> {employee.agencyId}</p>
        <p><strong>Position:</strong> {employee.role}</p>
      </div>

      {/* Right Panel: Attendance */}
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
          <p>No attendance records found.</p>
        ) : currentRecords.length === 0 ? (
          <p>No records found.</p>
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
                  <tr
                    key={idx}
                    className={rec.status === "Absent" ? styles.absentRow : ""}
                  >
                    <td>{rec.date || "--"}</td>
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
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
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
  );
};

export default UserDetail;
