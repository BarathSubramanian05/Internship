import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./UserDashboard.module.css";
import { EmployeeContext } from "../../Context/EmployeeContext";
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

/* ---------- Main Component ---------- */
const UserDashboard = () => {
  const navigate = useNavigate();
  const { employee } = useContext(EmployeeContext);

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
// Step 3: Process groupedByDate into final attendanceArray
const attendanceArray = Object.values(groupedByDate).map((dayObj) => {
  const sortedSessions = dayObj.sessions.sort(
    (a, b) => new Date(a.inTime) - new Date(b.inTime)
  );
  const firstInTime = sortedSessions[0]?.inTime || null;
  const lastOutTime = sortedSessions[sortedSessions.length - 1]?.outTime || null;

  // ✅ Calculate popup-style total
  const popupTotalHours = calculateWorkHours(sortedSessions);

  const sessionStatus = getSessionStatus(popupTotalHours, firstInTime);

  return {
    date: dayObj.date,
    inTime: firstInTime,
    outTime: lastOutTime,
    workHours: popupTotalHours,   // <-- same as popup
    status: popupTotalHours > 0 ? "Present" : "Absent",
    fn: sessionStatus.fn,
    an: sessionStatus.an,
    sessions: sortedSessions,
  };
});


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
        Object.keys(rawMap).forEach(dateStr => {
          const d = parseDateSafe(dateStr);
          if (d) allDates.push(d);
        });

        // Get earliest
        const earliestDate = allDates.length > 0 
          ? new Date(Math.min(...allDates.map(d => d.getTime())))
          : new Date();

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
        console.error("Error fetching attendance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [employee, navigate]);

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


// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import styles from "./UserDashboard.module.css";
// import { EmployeeContext } from "../../Context/EmployeeContext";
// import { FaUserCircle } from "react-icons/fa";

// /* ---------- Helper Functions ---------- */
// const calculateWorkHours = (inTime, outTime) => {
//   if (!inTime || !outTime) return 0;
//   try {
//     const inDate = new Date(inTime);
//     const outDate = new Date(outTime);
//     let diff = (outDate - inDate) / (1000 * 60 * 60);
//     if (diff < 0) diff += 24;
//     return parseFloat(diff.toFixed(2));
//   } catch {
//     return 0;
//   }
// };

// const getSessionStatus = (workHours, inTime) => {
//   if (!inTime || workHours === 0) return { fn: "Absent", an: "Absent" };
//   if (workHours < 1) return { fn: "Absent", an: "Absent" };
//   const inDate = new Date(inTime);
//   const checkinMinutes = inDate.getHours() * 60 + inDate.getMinutes();
//   if (workHours >= 5) return { fn: "Present", an: "Present" };
//   if (checkinMinutes < 13 * 60) return { fn: "Present", an: "Absent" };
//   return { fn: "Absent", an: "Present" };
// };

// const formatTime = (dateTime) => {
//   if (!dateTime) return "--";
//   const d = new Date(dateTime);
//   return isNaN(d.getTime())
//     ? "--"
//     : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
// };

// const safeDate = (dateStr) => {
//   if (!dateStr) return null;
//   const d = new Date(dateStr);
//   return isNaN(d.getTime()) ? null : d;
// };

// /* ---------- Main Component ---------- */
// const UserDashboard = () => {
//   const navigate = useNavigate();
//   const { employee } = useContext(EmployeeContext);

//   const [attendance, setAttendance] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const recordsPerPage = 10;

//   /* ---------- Fetch Attendance ---------- */
//   useEffect(() => {
//     if (!employee) {
//       navigate("/user-login");
//       return;
//     }

//     axios
//       .get(`http://localhost:8080/attendance/${employee.employeeId}`)
//       .then((res) => {
//         const todayISO = new Date().toISOString().slice(0, 10);

//         // Map API data
//         const mapped = res.data.attendance.map((rec) => {
//           const workHours = calculateWorkHours(rec.inTime, rec.outTime);
//           const sessionStatus = getSessionStatus(workHours, rec.inTime);
//           const overallStatus =
//             sessionStatus.fn === "Absent" && sessionStatus.an === "Absent"
//               ? "Absent"
//               : "Present";

//           const normalizedDate = rec.date
//             ? rec.date
//             : rec.inTime
//             ? new Date(rec.inTime).toISOString().slice(0, 10)
//             : null;

//           return {
//             date: normalizedDate,
//             inTime: rec.inTime,
//             outTime: rec.outTime,
//             workHours,
//             status: overallStatus,
//             fn: sessionStatus.fn,
//             an: sessionStatus.an,
//           };
//         });

//         // Sort by date ascending to find earliest
//         const sortedAsc = mapped
//           .filter((r) => r.date)
//           .sort((a, b) => new Date(a.date) - new Date(b.date));

//         // Earliest attendance date (ignore anything before 1970)
//         const earliestDate = sortedAsc.length
//           ? new Date(Math.max(new Date(sortedAsc[0].date), new Date("1970-01-01")))
//           : new Date();

//         const today = new Date();

//         // Generate all dates between earliest and today
//         const allDates = [];
//         for (let d = new Date(earliestDate); d <= today; d.setDate(d.getDate() + 1)) {
//           allDates.push(new Date(d));
//         }

//         // Fill missing records as Absent
//         const complete = allDates.map((d) => {
//           const iso = d.toISOString().slice(0, 10);
//           const found = mapped.find((rec) => rec.date === iso);
//           if (found) return found;
//           return {
//             date: iso,
//             inTime: null,
//             outTime: null,
//             workHours: 0,
//             status: "Absent",
//             fn: "Absent",
//             an: "Absent",
//           };
//         });

//         // Sort descending for latest first
//         setAttendance(complete.sort((a, b) => new Date(b.date) - new Date(a.date)));
//       })
//       .catch((err) => console.error(err))
//       .finally(() => setLoading(false));
//   }, [employee, navigate]);

//   /* ---------- Reset Page on Filter Change ---------- */
//   useEffect(() => setCurrentPage(1), [selectedDate, selectedMonth, selectedYear]);

//   /* ---------- Filtering ---------- */
//   let filteredRecords = attendance;

//   if (selectedDate)
//     filteredRecords = filteredRecords.filter(
//       (r) => safeDate(r.date)?.toISOString().slice(0, 10) === selectedDate
//     );
//   if (selectedMonth)
//     filteredRecords = filteredRecords.filter(
//       (r) => safeDate(r.date)?.getMonth() + 1 === parseInt(selectedMonth, 10)
//     );
//   if (selectedYear)
//     filteredRecords = filteredRecords.filter(
//       (r) => safeDate(r.date)?.getFullYear() === parseInt(selectedYear, 10)
//     );

//   const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
//   const currentRecords = filteredRecords.slice(
//     (currentPage - 1) * recordsPerPage,
//     currentPage * recordsPerPage
//   );

//   const handleClearFilters = () => {
//     setSelectedDate("");
//     setSelectedMonth("");
//     setSelectedYear("");
//     setCurrentPage(1);
//   };

//   /* ---------- UI ---------- */
//   if (!employee) return <p className={styles.error}>No employee found. Please log in again.</p>;
//   if (loading) return <p>Loading attendance...</p>;

//   return (
//     <div className={styles.mainContainer}>
//       {/* LEFT SIDE - EMPLOYEE INFO */}
//       <div className={styles.userCard}>
//         {employee.profileImageId ? (
//           <img
//             src={`http://localhost:8080/image/${employee.profileImageId}`}
//             alt="Profile"
//             className={styles.userIcon}
//           />
//         ) : (
//           <FaUserCircle className={styles.userIcon} />
//         )}
//         <h2>{employee.name}</h2>
//         <div className={styles.detailsContainer}>
//           <div className={styles.detailRow}><strong>Phone:</strong> <span>+91 {employee.phoneNumber}</span></div>
//           <div className={styles.detailRow}><strong>Employee ID:</strong> <span>{employee.employeeId}</span></div>
//           <div className={styles.detailRow}><strong>Agency ID:</strong> <span>{employee.agencyId}</span></div>
//           <div className={styles.detailRow}><strong>Role:</strong> <span>{employee.role}</span></div>
//           <div className={styles.detailRow}><strong>Salary:</strong> <span>Rs.{employee.salary}</span></div>
//           <div className={styles.detailRow}><strong>Start Time:</strong> <span>{employee.startTime}</span></div>
//           <div className={styles.detailRow}><strong>End Time:</strong> <span>{employee.endTime}</span></div>
//         </div>
//       </div>

//       {/* RIGHT SIDE - ATTENDANCE */}
//       <div className={styles.attendanceSection}>
//         <div className={styles.headerRow}>
//           <h2>Attendance Records</h2>
//           <div className={styles.filterBox}>
//             <label>Date:</label>
//             <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
//             <label>Month:</label>
//             <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
//               <option value="">All</option>
//               {Array.from({ length: 12 }, (_, i) => (
//                 <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("default", { month: "long" })}</option>
//               ))}
//             </select>
//             <label>Year:</label>
//             <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
//               <option value="">All</option>
//               {Array.from(new Set(attendance.map(r => safeDate(r.date)?.getFullYear()).filter(Boolean)))
//                 .sort((a, b) => b - a)
//                 .map((yr) => (<option key={yr} value={yr}>{yr}</option>))}
//             </select>
//             <button onClick={handleClearFilters}>Clear</button>
//           </div>
//         </div>

//         <table className={styles.attendanceTable}>
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Time In</th>
//               <th>Time Out</th>
//               <th>Work Hours</th>
//               <th>FN</th>
//               <th>AN</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentRecords.map((rec, idx) => (
//               <tr key={idx}>
//                 <td>{rec.date || "--"}</td>
//                 <td style={{
//                   color: rec.status === "Present" ? "green" : rec.status === "Absent" ? "red" : rec.status === "Holiday" ? "orange" : "inherit",
//                   fontWeight: "bold"
//                 }}>{rec.status}</td>
//                 <td>{formatTime(rec.inTime)}</td>
//                 <td>{formatTime(rec.outTime)}</td>
//                 <td>{rec.workHours}</td>
//                 <td>{rec.fn}</td>
//                 <td>{rec.an}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {totalPages > 1 && (
//           <div className={styles.pagination}>
//             <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
//             <span style={{marginTop:"4px"}}>Page {currentPage} of {totalPages}</span>
//             <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserDashboard;
