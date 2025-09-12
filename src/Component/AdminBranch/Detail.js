import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Detail.module.css";

/* ---------- Fixed Helper Functions ---------- */
const parseDateSafe = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

// ---------- NEW HELPER ----------
const getWorkHoursFromMap = (date, attendanceMap) => {
  const sessions = attendanceMap[date] || [];
  return calculateWorkHours(sessions);
};


const calculateSessionMinutes = (inTime, outTime) => {
  const start = parseDateSafe(inTime);
  const end = parseDateSafe(outTime);
  
  if (!start || !end) return 0;
  
  // Handle cases where outTime might be before inTime (invalid data)
  if (end < start) {
    console.warn("Out time before in time:", inTime, outTime);
    return 0;
  }
  
  return (end - start) / (1000 * 60); // minutes
};

const calculateWorkHours = (sessions) => {
  if (!sessions || sessions.length === 0) return 0;
  
  let totalMinutes = 0;
  sessions.forEach(session => {
    if (session.inTime && session.outTime) {
      totalMinutes += calculateSessionMinutes(session.inTime, session.outTime);
    }
  });
  
  const hours = totalMinutes / 60;
  return parseFloat(hours.toFixed(2));
};

const getSessionStatus = (workHours, inTime) => {
  if (!inTime || workHours === 0) return { fn: "Absent", an: "Absent" };
  if (workHours < 1) return { fn: "Absent", an: "Absent" };
  
  const inDate = parseDateSafe(inTime);
  if (!inDate) return { fn: "Absent", an: "Absent" };
  
  const checkinMinutes = inDate.getHours() * 60 + inDate.getMinutes();
  
  if (workHours >= 5) return { fn: "Present", an: "Present" };
  if (checkinMinutes < 13 * 60) return { fn: "Present", an: "Absent" };
  return { fn: "Absent", an: "Present" };
};

const formatTime = (dateTime) => {
  if (!dateTime) return "--";
  const d = parseDateSafe(dateTime);
  return !d ? "--" : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const safeDate = (dateStr) => {
  if (!dateStr) return null;
  const d = parseDateSafe(dateStr);
  return !d ? null : d;
};

const today = new Date().toISOString().split("T")[0];

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minDate, setMinDate] = useState("");

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupDate, setPopupDate] = useState("");
  const [popupRecords, setPopupRecords] = useState([]);

  const recordsPerPage = 10;

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      window.location.replace("/admin-login");
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedMonth, selectedYear]);

  // Fetch employee data first
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const empResp = await axios.get(`http://localhost:8080/employee/${id}`);
        setEmployee(empResp.data);
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Employee not found");
        setLoading(false);
      }
    };
    
    fetchEmployee();
  }, [id]);

  // Fetch attendance data after employee is loaded
  useEffect(() => {
  if (!employee) return;

  const fetchAttendance = async () => {
    try {
      const attResp = await axios.get(`http://localhost:8080/attendance/${employee.employeeId}`);
      const rawMap = attResp.data.attendanceMap || {};
      const rawArray = attResp.data.attendance || [];
      const groupedByDate = {};

      // Step 1: Process attendanceMap
      Object.entries(rawMap).forEach(([date, sessions]) => {
        const validSessions = sessions.filter(s => s.inTime && parseDateSafe(s.inTime));
        if (validSessions.length > 0) {
          groupedByDate[date] = { date, sessions: validSessions };
        }
      });

      // Step 2: Process rawArray and always add sessions
      rawArray.forEach((rec) => {
        if (!rec.inTime) return;
        let date = rec.date || (parseDateSafe(rec.inTime)?.toISOString().slice(0, 10));
        if (!date) return;

        if (!groupedByDate[date]) groupedByDate[date] = { date, sessions: [] };

        groupedByDate[date].sessions.push({
          inTime: rec.inTime,
          outTime: rec.outTime || null
        });
      });

      // Step 3: Process groupedByDate into final attendanceArray
const attendanceArray = Object.values(groupedByDate).map((dayObj) => {
  const sortedSessions = dayObj.sessions.sort(
    (a, b) => new Date(a.inTime) - new Date(b.inTime)
  );

  const firstInTime = sortedSessions[0]?.inTime || null;
  const lastOutTime = sortedSessions[sortedSessions.length - 1]?.outTime || null;

  const totalHours = calculateWorkHours(sortedSessions); // <-- sum of all sessions

  const sessionStatus = getSessionStatus(totalHours, firstInTime);

  return {
    date: dayObj.date,
    inTime: firstInTime,
    outTime: lastOutTime,
    workHours: totalHours,   // <-- use this in table
    status: totalHours > 0 ? "Present" : "Absent",
    fn: sessionStatus.fn,
    an: sessionStatus.an,
    sessions: sortedSessions, // store sessions for popup
  };
});




      // Step 4: Determine earliest date
      // Step 4: Determine earliest date
let allDates = [];

// Add all valid 'date' fields
rawArray.forEach(rec => {
  if (rec.date) {
    const d = parseDateSafe(rec.date);
    if (d) allDates.push(d);
  } else if (rec.inTime) { // fallback to inTime
    const d = parseDateSafe(rec.inTime);
    if (d) allDates.push(d);
  }
});

// Also include attendanceMap dates just in case
Object.keys(attendanceMap).forEach(dateStr => {
  const d = parseDateSafe(dateStr);
  if (d) allDates.push(d);
});

// Get earliest
const earliestDate = allDates.length > 0 
  ? new Date(Math.min(...allDates.map(d => d.getTime())))
  : new Date();

console.log("Earliest date found:", earliestDate.toISOString().split("T")[0]);
setMinDate(earliestDate.toISOString().split("T")[0]);



      // Step 5: Fill missing dates until today
      const todayObj = new Date();
      const completeAttendance = [];
      for (let d = new Date(earliestDate); d <= todayObj; d.setDate(d.getDate() + 1)) {
        const isoDate = d.toISOString().slice(0, 10);
        const existingRecord = attendanceArray.find(a => a.date === isoDate);
        if (existingRecord) completeAttendance.push(existingRecord);
        else completeAttendance.push({
          date: isoDate,
          inTime: null,
          outTime: null,
          workHours: 0,
          status: "Absent",
          fn: "Absent",
          an: "Absent",
          sessions: []
        });
      }

      // Sort descending
      setAttendance(completeAttendance.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setAttendanceMap(rawMap);
    } catch (err) {
      console.error(err);
      setError("No attendance data found for this employee.");
    } finally {
      setLoading(false);
    }
  };

  fetchAttendance();
}, [employee, id]);


  const openPopup = (date) => {
    setPopupDate(date);
    // Get sessions from the attendanceMap for this date
    const sessions = attendanceMap[date] || [];
    setPopupRecords(sessions);
    setShowPopup(true);
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
    const d = safeDate(r.date);
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
                      <td>
                        <button
                          onClick={() => openPopup(rec.date)}
                          style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
                        >
                          {rec.date || "--"}
                        </button>
                      </td>
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
                      <td>{getWorkHoursFromMap(rec.date, attendanceMap).toFixed(2)}</td>
                      <td>{rec.fn}</td>
                      <td>{rec.an}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* FIXED: Show pagination controls when there are multiple pages */}
              {filteredRecords.length > recordsPerPage && (
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

      {/* POPUP MODAL */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h3>Sessions for {popupDate}</h3>
            {popupRecords.length > 0 ? (
              <table className={styles.attendanceTable}>
                <thead>
                  <tr>
                    <th>In Time</th>
                    <th>Out Time</th>
                    <th>Duration (hours)</th>
                  </tr>
                </thead>
                <tbody>
                  {popupRecords.map((rec, idx) => {
                    const duration = calculateSessionMinutes(rec.inTime, rec.outTime) / 60;
                    return (
                      <tr key={idx}>
                        <td>{formatTime(rec.inTime)}</td>
                        <td>{formatTime(rec.outTime)}</td>
                        <td>{duration.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p>No sessions recorded.</p>
            )}
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;