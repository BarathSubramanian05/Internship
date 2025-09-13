import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AttendancePage.module.css";
import { EmployeeContext } from "../../Context/EmployeeContext";

const AttendancePage = () => {
  const navigate = useNavigate();
  const { employee } = useContext(EmployeeContext);

  const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const [sessions, setSessions] = useState([]);
  const [buttonLabel, setButtonLabel] = useState("Checkin");

  useEffect(() => {
    if (employee) {
      fetchAttendance();
    }
  }, [employee]);

  // Fetch attendance from backend
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/attendance/${employee.employeeId}`);
      const data = res.data;

      const todaySessions = data.attendanceMap?.[todayKey] || [];
      setSessions(todaySessions);

      if (todaySessions.length > 0) {
        const lastSession = todaySessions[todaySessions.length - 1];
        if (lastSession && !lastSession.outTime) {
          setButtonLabel("Checkout");
        } else {
          setButtonLabel("Checkin");
        }
      } else {
        setButtonLabel("Checkin");
      }
    } catch (err) {
      console.error("Error fetching attendance", err);
    }
  };

  const formatTime = (date) => (date ? new Date(date).toLocaleString() : "-");

  const calculateWorkingHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "-";
    const checkin = new Date(inTime);
    const checkout = new Date(outTime);
    let diffMs = checkout - checkin;
    if (diffMs <= 0) return "-";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateTotalHoursForToday = () => {
    let totalMs = 0;
    sessions.forEach((s) => {
      if (s.inTime && s.outTime) {
        totalMs += new Date(s.outTime) - new Date(s.inTime);
      }
    });
    if (totalMs <= 0) return "-";
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleCheckin = () => {
    if (!employee) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      try {
        const validateRes = await axios.post("http://localhost:8080/gps/test", {
          latitude,
          longitude,
        });

        if (validateRes.data === "Success") {
          const currentTime = new Date();
          const localISOTime = new Date(
            currentTime.getTime() - currentTime.getTimezoneOffset() * 60000
          )
            .toISOString()
            .split(".")[0];

          await axios.post("http://localhost:8080/attendance/addintime", null, {
            params: {
              employeeId: employee.employeeId,
              agencyId: employee.agencyId,
              inTime: localISOTime,
            },
          });

          alert("Check-in successful! Refreshing...");
          fetchAttendance();
        } else {
          alert("You are outside the allowed perimeter. Cannot check-in.");
        }
      } catch (error) {
        console.error("Check-in error", error);
      }
    });
  };

  const handleCheckout = async () => {
    if (!employee) return;
    const confirmCheckout = window.confirm("Are you sure you want to checkout?");
    if (!confirmCheckout) return;

    const currentTime = new Date();
    const localISOTime = new Date(
      currentTime.getTime() - currentTime.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split(".")[0];

    try {
      await axios.post("http://localhost:8080/attendance/addouttime", null, {
        params: {
          employeeId: employee.employeeId,
          outTime: localISOTime,
        },
      });

      alert("Checkout successful! Refreshing...");
      fetchAttendance();
    } catch (error) {
      console.error("Checkout error", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Employee Attendance</h2>

      {/* Main summary */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>Employee ID</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Check-in Time</th>
              <th className={styles.th}>Checkout Time</th>
              <th className={styles.th}>Total Hours</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {employee && (
              <tr className={styles.trHover}>
                <td className={styles.td}>{employee.employeeId}</td>
                <td className={styles.td}>{employee.name}</td>
                <td className={styles.td}>
                  {sessions.length > 0
                    ? formatTime(sessions[sessions.length - 1].inTime)
                    : "-"}
                </td>
                <td className={styles.td}>
                  {sessions.length > 0
                    ? formatTime(sessions[sessions.length - 1].outTime)
                    : "-"}
                </td>
                <td className={styles.td}>
                  {sessions.length > 0 ? calculateTotalHoursForToday() : "-"}
                </td>
                <td className={styles.td}>
                  {buttonLabel === "Checkin" ? (
                    <button className={styles.btnPrimary} onClick={handleCheckin}>
                      Checkin
                    </button>
                  ) : (
                    <button className={styles.btnPrimary} onClick={handleCheckout}>
                      Checkout
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sessions history */}
      <h3 className={styles.subHeading} style={{marginTop:"25px",marginBottom:"10px"}}>Today’s Sessions</h3>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>Session</th>
              <th className={styles.th}>Check-in</th>
              <th className={styles.th}>Checkout</th>
              <th className={styles.th}>Worked Hours</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? (
              sessions.map((s, idx) => (
                <tr key={idx} className={styles.trHover}>
                  <td className={styles.td}>{idx + 1}</td>
                  <td className={styles.td}>{formatTime(s.inTime)}</td>
                  <td className={styles.td}>{formatTime(s.outTime)}</td>
                  <td className={styles.td}>
                    {calculateWorkingHours(s.inTime, s.outTime)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className={styles.td}>
                  No sessions recorded today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;

// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import styles from "./AttendancePage.module.css";
// import { EmployeeContext } from "../../Context/EmployeeContext";

// const AttendancePage = () => {
//   const navigate = useNavigate();
//   const { employee } = useContext(EmployeeContext);

//   const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
//   const [sessions, setSessions] = useState([]); // multiple sessions for today
//   const [buttonLabel, setButtonLabel] = useState("Checkin");

//   useEffect(() => {
//     if (employee) {
//       fetchAttendance();
//     }
//   }, [employee]);

//   // Fetch attendance from backend
//   const fetchAttendance = async () => {
//     try {
//       const res = await axios.get(`http://localhost:8080/${employee.employeeId}`);
//       const data = res.data;

//       const todaySessions = data.attendanceMap?.[todayKey] || [];
//       setSessions(todaySessions);

//       // Decide button state
//       if (todaySessions.length > 0) {
//         const lastSession = todaySessions[todaySessions.length - 1];
//         if (lastSession && !lastSession.outTime) {
//           setButtonLabel("Checkout");
//         } else {
//           setButtonLabel("Checkin");
//         }
//       } else {
//         setButtonLabel("Checkin");
//       }
//     } catch (err) {
//       console.error("Error fetching attendance", err);
//     }
//   };

//   const formatTime = (date) => (date ? new Date(date).toLocaleString() : "-");

//   const calculateWorkingHours = (inTime, outTime) => {
//     if (!inTime || !outTime) return "-";
//     const checkin = new Date(inTime);
//     const checkout = new Date(outTime);
//     let diffMs = checkout - checkin;
//     if (diffMs <= 0) return "-";
//     const hours = Math.floor(diffMs / (1000 * 60 * 60));
//     const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
//     return `${hours}h ${minutes}m`;
//   };

//   const handleCheckin = () => {
//   if (!employee) return;

//   navigator.geolocation.getCurrentPosition(async (pos) => {
//     const latitude = pos.coords.latitude;
//     const longitude = pos.coords.longitude;

//     try {
//       const validateRes = await axios.post("http://localhost:8080/gps/test", {
//         latitude,
//         longitude,
//       });

//       if (validateRes.data === "Success") {
//         const currentTime = new Date();
//         const localISOTime = new Date(
//           currentTime.getTime() - currentTime.getTimezoneOffset() * 60000
//         )
//           .toISOString()
//           .split(".")[0];

//         await axios.post("http://localhost:8080/attendance/addintime", null, {
//           params: {
//             employeeId: employee.employeeId,
//             agencyId: employee.agencyId,
//             inTime: localISOTime,
//           },
//         });

//         // ✅ Update sessions state immediately
//         setSessions((prev) => [
//           ...prev,
//           { date: todayKey, inTime: localISOTime, outTime: null },
//         ]);
//         setButtonLabel("Checkout");

//         alert("Check-in successful!");
//       } else {
//         alert("You are outside the allowed perimeter. Cannot check-in.");
//       }
//     } catch (error) {
//       console.error("Check-in error", error);
//     }
//   });
// };


//  const handleCheckout = async () => {
//   if (!employee) return;
//   const confirmCheckout = window.confirm("Are you sure you want to checkout?");
//   if (!confirmCheckout) return;

//   const currentTime = new Date();
//   const localISOTime = new Date(
//     currentTime.getTime() - currentTime.getTimezoneOffset() * 60000
//   )
//     .toISOString()
//     .split(".")[0];

//   try {
//     await axios.post("http://localhost:8080/attendance/addouttime", null, {
//       params: {
//         employeeId: employee.employeeId,
//         outTime: localISOTime,
//       },
//     });

//     // ✅ Update last session with outTime
//     setSessions((prev) => {
//       const updated = [...prev];
//       if (updated.length > 0) {
//         updated[updated.length - 1].outTime = localISOTime;
//       }
//       return updated;
//     });
//     setButtonLabel("Checkin");

//     alert("Checkout successful!");
//   } catch (error) {
//     console.error("Checkout error", error);
//   }
// };


//   return (
//     <div className={styles.container}>
//       <h2 className={styles.heading}>Employee Attendance</h2>

//       {/* Main summary table */}
//       <div className={styles.tableResponsive}>
//         <table className={styles.table}>
//           <thead>
//             <tr className={styles.theadRow}>
//               <th className={styles.th}>Employee ID</th>
//               <th className={styles.th}>Name</th>
//               <th className={styles.th}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {employee && (
//               <tr className={styles.trHover}>
//                 <td className={styles.td}>{employee.employeeId}</td>
//                 <td className={styles.td}>{employee.name}</td>
//                 <td className={styles.td}>
//                   {buttonLabel === "Checkin" ? (
//                     <button
//                       className={styles.btnPrimary}
//                       onClick={handleCheckin}
//                     >
//                       Checkin
//                     </button>
//                   ) : (
//                     <button
//                       className={styles.btnPrimary}
//                       onClick={handleCheckout}
//                     >
//                       Checkout
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Sessions history */}
//       <h3 className={styles.subHeading}>Today’s Sessions</h3>
//       <div className={styles.tableResponsive}>
//         <table className={styles.table}>
//           <thead>
//             <tr className={styles.theadRow}>
//               <th className={styles.th}>Session</th>
//               <th className={styles.th}>Check-in Time</th>
//               <th className={styles.th}>Checkout Time</th>
//               <th className={styles.th}>Total Hours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {sessions.length > 0 ? (
//               sessions.map((s, idx) => (
//                 <tr key={idx} className={styles.trHover}>
//                   <td className={styles.td}>{idx + 1}</td>
//                   <td className={styles.td}>{formatTime(s.inTime)}</td>
//                   <td className={styles.td}>{formatTime(s.outTime)}</td>
//                   <td className={styles.td}>
//                     {calculateWorkingHours(s.inTime, s.outTime)}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4" className={styles.td}>
//                   No sessions recorded today
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default AttendancePage;