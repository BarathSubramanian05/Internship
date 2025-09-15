import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./UserDashboard.module.css";
import { EmployeeContext} from "../../Context/EmployeeContext";
import { FaUserCircle } from "react-icons/fa";

/* ---------- Helper Functions ---------- */
const parseDateSafe = (dateString) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
};

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

const getSessionStatus = (sessions, startTime, endTime) => {
  if (!sessions || sessions.length === 0) {
    return { overall: "Absent", fn: "Absent", an: "Absent" };
  }

  // Calculate midpoint in minutes
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  const midMinutes = Math.floor((startMinutes + endMinutes) / 2);

  // Last checkout for overall status
  const lastOut = parseDateSafe(sessions[sessions.length - 1]?.outTime);
  if (!lastOut) return { overall: "Absent", fn: "Absent", an: "Absent" };

  const checkoutMinutes = lastOut.getHours() * 60 + lastOut.getMinutes();
  const overall = checkoutMinutes >= midMinutes ? "Present" : "Absent";

  // Calculate minutes worked in morning vs afternoon
  let morningMinutes = 0;
  let afternoonMinutes = 0;

  sessions.forEach(s => {
    const inDate = parseDateSafe(s.inTime);
    const outDate = parseDateSafe(s.outTime);
    if (!inDate || !outDate) return;

    const inMin = inDate.getHours() * 60 + inDate.getMinutes();
    const outMin = outDate.getHours() * 60 + outDate.getMinutes();

    // Morning overlap
    morningMinutes += Math.max(0, Math.min(outMin, midMinutes) - Math.max(inMin, startMinutes));
    // Afternoon overlap
    afternoonMinutes += Math.max(0, Math.min(outMin, endMinutes) - Math.max(inMin, midMinutes));
  });

  const fn = morningMinutes >= afternoonMinutes && morningMinutes > 0 ? "Present" : "Absent";
  const an = afternoonMinutes > morningMinutes && afternoonMinutes > 0 ? "Present" : "Absent";

  return { overall, fn, an };
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

/* ---------- Main Component ---------- */
const UserDashboard = () => {
  const navigate = useNavigate();
  const { employee,refreshAttendance } = useContext(EmployeeContext);

  const [attendance, setAttendance] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [showPopup, setShowPopup] = useState(false);
  const [popupDate, setPopupDate] = useState("");
  const [popupRecords, setPopupRecords] = useState([]);
  const [minDate, setMinDate] = useState("");

  /* ---------- Fetch Attendance ---------- */
  useEffect(() => {
    if (!employee) {
      navigate("/user-login");
      return;
    }

    const fetchAttendance = async () => {
    try {
      const attResp = await axios.get(
        `http://localhost:8080/attendance/${employee.employeeId}`
      );
      const rawMap = attResp.data.attendanceMap || {};

      // Step 1: convert map -> array but KEEP dates even if sessions have null inTime
      const groupedArray = Object.entries(rawMap).map(([date, sessions]) => {
        // normalize sessions array
        const sessionsArr = (sessions || []).map((s) => ({
          inTime: s.inTime ?? null,
          outTime: s.outTime ?? null,
        }));

        // Sort sessions: ones with real inTime first (chronological), then nulls
        const sortedAll = sessionsArr.slice().sort((a, b) => {
          if (a.inTime && b.inTime) return new Date(a.inTime) - new Date(b.inTime);
          if (a.inTime) return -1;
          if (b.inTime) return 1;
          return 0;
        });

        // Valid sessions (have inTime that parses)
        const validSessions = sortedAll.filter(s => s.inTime && parseDateSafe(s.inTime));

        // first/last based on valid sessions (if any)
        const firstInTime = validSessions[0]?.inTime ?? null;
        const lastOutTime = validSessions[validSessions.length - 1]?.outTime ?? null;

        // work hours from valid sessions (zero if none)
        const totalHours = calculateWorkHours(validSessions);

        // session status: compute if we have valid sessions, otherwise fallback
        const sessionStatus = validSessions.length > 0
          ? getSessionStatus(validSessions, employee.startTime, employee.endTime)
          : { fn: "Present", an: "Present" }; // <-- change to "Absent" here if you prefer

        // overall status: since date key exists in attendanceMap mark Present by default
        let overallStatus = "Present";

        // apply midpoint override only when we have a lastOutTime to evaluate
        if (lastOutTime && employee?.startTime && employee?.endTime) {
          const [sh, sm] = employee.startTime.split(":").map(Number);
          const [eh, em] = employee.endTime.split(":").map(Number);
          const startMinutes = sh * 60 + sm;
          const endMinutes = eh * 60 + em;
          const midMinutes = Math.floor((startMinutes + endMinutes) / 2);

          const outDate = new Date(lastOutTime);
          const checkoutMinutes = outDate.getHours() * 60 + outDate.getMinutes();

          overallStatus = checkoutMinutes < midMinutes ? "Absent" : "Present";
        }

        return {
          date,
          inTime: firstInTime,
          outTime: lastOutTime,
          workHours: totalHours,
          status: overallStatus,
          fn: sessionStatus.fn,
          an: sessionStatus.an,
          // include sortedAll so UI can show sessions even when timestamps are null
          sessions: sortedAll,
        };
      });

      // Step 2: earliest date from attendanceMap keys (keep dates even if sessions null)
      const allDates = Object.keys(rawMap)
        .map(d => parseDateSafe(d))
        .filter(Boolean);

      const earliestDate = allDates.length > 0
        ? new Date(Math.min(...allDates.map(d => d.getTime())))
        : new Date();

      setMinDate(earliestDate.toISOString().split("T")[0]);

      // Step 3: fill missing dates from earliest -> today using groupedArray (map-only)
      const todayObj = new Date();
      const completeAttendance = [];
      for (let d = new Date(earliestDate); d <= todayObj; d.setDate(d.getDate() + 1)) {
        const isoDate = d.toISOString().slice(0, 10);
        const existingRecord = groupedArray.find(a => a.date === isoDate);

        if (existingRecord) {
          completeAttendance.push(existingRecord);
        } else {
          completeAttendance.push({
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
      }

      // Step 4: sort descending & set state
      setAttendance(completeAttendance.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setAttendanceMap(rawMap);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

    fetchAttendance();
  }, [employee, navigate,refreshAttendance]);

  /* ---------- Reset page when filter changes ---------- */
  useEffect(() => setCurrentPage(1), [selectedDate, selectedMonth, selectedYear]);

  /* ---------- Filtering ---------- */
  const filteredRecords = attendance
    .filter(r => !selectedDate || r.date === selectedDate)
    .filter(r => {
      if (!selectedMonth) return true;
      const d = safeDate(r.date);
      return d ? d.getMonth() + 1 === parseInt(selectedMonth) : false;
    })
    .filter(r => {
      if (!selectedYear) return true;
      const d = safeDate(r.date);
      return d ? d.getFullYear() === parseInt(selectedYear) : false;
    });

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const currentRecords = filteredRecords.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  const handleClearFilters = () => {
    setSelectedDate("");
    setSelectedMonth("");
    setSelectedYear("");
    setCurrentPage(1);
  };

  const openPopup = (date) => {
    setPopupDate(date);
    // Get sessions from the attendanceMap for this date
    const sessions = attendanceMap[date] || [];
    setPopupRecords(sessions);
    setShowPopup(true);
  };

  /* ---------- UI ---------- */
  if (!employee) return <p className={styles.error}>No employee found. Please log in again.</p>;
  if (loading) return <p>Loading attendance...</p>;

  // Get unique years for filter dropdown
  const yearsSet = new Set();
  attendance.forEach((r) => {
    const d = safeDate(r.date);
    if (d) yearsSet.add(d.getFullYear());
  });
  const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

  return (
    <div className={styles.mainContainer}>
      {/* Employee Info */}
      <div className={styles.userCard}>
        {employee.profileImageId ? (
          <img src={`http://localhost:8080/image/${employee.profileImageId}`} alt="Profile" className={styles.userIcon} />
        ) : (
          <FaUserCircle className={styles.userIcon} />
        )}
        <h2>{employee.name}</h2>
        <div className={styles.detailsContainer}>
          <div className={styles.detailRow}><strong>Phone:</strong> +91 {employee.phoneNumber}</div>
          <div className={styles.detailRow}><strong>Employee ID:</strong> {employee.employeeId}</div>
          <div className={styles.detailRow}><strong>Agency ID:</strong> {employee.agencyId}</div>
          <div className={styles.detailRow}><strong>Role:</strong> {employee.role}</div>
          <div className={styles.detailRow}><strong>Salary:</strong> Rs.{employee.salary}</div>
          <div className={styles.detailRow}><strong>Start Time:</strong> {employee.startTime}</div>
          <div className={styles.detailRow}><strong>End Time:</strong> {employee.endTime}</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className={styles.attendanceSection}>
        <div className={styles.headerRow}>
          <h2>Attendance Records</h2>
          <div className={styles.filterBox}>
            <label>Date:</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={e => setSelectedDate(e.target.value)} 
              max={new Date().toISOString().split('T')[0]}
              min={minDate}
            />
            <label>Month:</label>
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              <option value="">All</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
              ))}
            </select>
            <label>Year:</label>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
              <option value="">All</option>
              {sortedYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
            <button onClick={handleClearFilters}>Clear</button>
          </div>
        </div>

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
                <td style={{ 
                  color: rec.status === "Present" ? "green" : "red", 
                  fontWeight: "bold" 
                }}>
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

        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
            <span style={{marginTop:"3px"}}>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContent}>
            <h3>Sessions for {popupDate}</h3>
            {popupRecords.length > 0 ? (
              <>
                <table className={styles.attendanceTable}>
                  <thead>
                    <tr><th>In Time</th><th>Out Time</th><th>Duration (hours)</th></tr>
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
                <div style={{marginTop: '10px', fontWeight: 'bold'}}>
                  Total Hours: {calculateWorkHours(popupRecords)}
                </div>
              </>
            ) : <p>No sessions recorded.</p>}
            <button onClick={() => setShowPopup(false)} style={{marginTop: '15px'}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;