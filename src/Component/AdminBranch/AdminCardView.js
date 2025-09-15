//   import React, { useEffect, useState } from "react";
//   import { useNavigate } from "react-router-dom";
//   import axios from "axios";
//   import styles from "./Dashboard.module.css";

//   const AdminCardView = () => {
//     const [agencies, setAgencies] = useState([]);
//     const [selectedType, setSelectedType] = useState("");
//     const [isDeleteMode, setIsDeleteMode] = useState(false);
//     const [agenciesToDelete, setAgenciesToDelete] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [totalEmployees, setTotalEmployees] = useState(0);
//     const [employeeCounts, setEmployeeCounts] = useState({});
//     const [todayAttendance, setTodayAttendance] = useState({});
//     const userRole = sessionStorage.getItem("userRole"); // "admin" or "superadmin"


//     const navigate = useNavigate();

//   useEffect(() => {
//   const fetchAgencies = async () => {
//     try {
//       // Fetch agencies
//       const res = await axios.get("http://localhost:8080/agency/");
//       setAgencies(res.data);

//       // Fetch total employees per agency
//       const requests = res.data.map((agency) =>
//         axios
//           .get(`http://localhost:8080/employee/countbyagencyid/${agency.agencyId}`)
//           .then((countRes) => ({
//             agencyId: agency.agencyId,
//             count: countRes.data,
//           }))
//           .catch((err) => {
//             console.error(`Error fetching count for agency ${agency.agencyId}`, err);
//             return { agencyId: agency.agencyId, count: 0 };
//           })
//       );

//       const results = await Promise.all(requests);
//       const counts = results.reduce((acc, curr) => {
//         acc[curr.agencyId] = curr.count;
//         return acc;
//       }, {});
//       setEmployeeCounts(counts);

//       // Fetch today's attendance for each agency
//       const attendanceRequests = res.data.map((agency) =>
//         axios
//           .get(`http://localhost:8080/attendance/getpresentemployeesbyagencyid/${agency.agencyId}`)
//           .then((r) => ({
//             agencyId: agency.agencyId,
//             present: r.data,
//             absent: (counts[agency.agencyId] ?? 0) - r.data,
//           }))
//           .catch((err) => {
//             console.error(`Error fetching attendance for agency ${agency.agencyId}`, err);
//             return { agencyId: agency.agencyId, present: 0, absent: 0 };
//           })
//       );

//       const attendanceResults = await Promise.all(attendanceRequests);
//       const attendanceData = attendanceResults.reduce((acc, curr) => {
//         acc[curr.agencyId] = { present: curr.present, absent: curr.absent };
//         return acc;
//       }, {});
//       setTodayAttendance(attendanceData);

//     } catch (err) {
//       console.error("Error fetching agencies or attendance:", err);
//       alert("Failed to load agencies or attendance");
//     } finally {
//       setLoading(false);
//     }
//   };

//   fetchAgencies();

//   // Fetch all employees (separate request)
//   const fetchEmployees = async () => {
//     try {
//       const res = await axios.get("http://localhost:8080/employee/getallemployee");
//       setTotalEmployees(res.data); // assuming response.data is an array
//     } catch (err) {
//       console.error("Error fetching employees:", err);
//       alert("Failed to load employees");
//     }
//   };
//   fetchEmployees();
// }, []);


//     // Handle logout
//     const handleLogout = () => {
//       sessionStorage.removeItem("adminLoggedIn"); 
//       window.location.replace("/admin-login");
//     }

//     // Calculate statistics
//     const allTypes = [
//   ...new Set(
//     agencies.flatMap((a) =>
//       a.agencyType ? a.agencyType.split(",").map((t) => t.trim()) : []
//     )
//   ),
// ];

//     // filteredAgencies already includes only active agencies and any type filters



//    // Calculate total present and absent across all agencies
// const todayStatus = Object.values(todayAttendance).reduce(
//   (acc, curr) => {
//     acc.present += curr.present;
//     acc.absent += curr.absent;
//     return acc;
//   },
//   { present: 0, absent: 0 }
// );


//     // Filter agencies by type
//   const filteredAgencies = agencies
//   .filter((agency) => agency.status === true) // ✅ Only show agencies with status true
//   .filter((agency) =>
//     selectedType
//       ? agency.agencyType?.split(",").map((t) => t.trim()).includes(selectedType)
//       : true
//   );



//     // Find agencies with absent employees
//   const alertAgencies = filteredAgencies.filter(
//   (agency) => (todayAttendance[agency.agencyId]?.absent ?? 0) > 0
// );

//     // Handle agency click (view or select for deletion)
//     const handleAgencyClick = (agencyId) => {
//       if (isDeleteMode) {
//         setAgenciesToDelete((prev) =>
//           prev.includes(agencyId) ? prev.filter((id) => id !== agencyId) : [...prev, agencyId]
//         );
//       } else {
//         navigate(`/admin-login/display/${agencyId}`);
//       }
//     };

//     // Toggle delete mode
//     const toggleDeleteMode = () => {
//       setIsDeleteMode(!isDeleteMode);
//       if (isDeleteMode) {
//         setAgenciesToDelete([]); // clear selection when exiting delete mode
//       }
//     };

//     // Delete selected agencies
//     const handleActualDeletion = async () => {
//   if (agenciesToDelete.length === 0) {
//     alert("Select agencies to delete");
//     return;
//   }

//   try {
//     await axios.delete("http://localhost:8080/agency/deleteagencies", {
//       data: agenciesToDelete,
//       headers: { "Content-Type": "application/json" },
//     });
//     alert("Agencies deleted successfully");

//     // Remove deleted agencies from state
//     const updatedAgencies = agencies.filter(
//       (agency) => !agenciesToDelete.includes(agency.agencyId)
//     );
//     setAgencies(updatedAgencies);

//     // Update total employees by subtracting employees from deleted agencies
//     let newTotalEmployees = totalEmployees;
//     const updatedTodayAttendance = { ...todayAttendance };

//     agenciesToDelete.forEach((agencyId) => {
//       const empCount = employeeCounts[agencyId] ?? 0;
//       newTotalEmployees -= empCount;

//       // Remove deleted agency from today's attendance
//       if (updatedTodayAttendance[agencyId]) {
//         delete updatedTodayAttendance[agencyId];
//       }
//     });

//     setTotalEmployees(newTotalEmployees);
//     setTodayAttendance(updatedTodayAttendance);

//     // Clear selections and exit delete mode
//     setAgenciesToDelete([]);
//     setIsDeleteMode(false);
//   } catch (err) {
//     console.error("Error deleting agencies:", err);
//     alert("Failed to delete agencies");
//   }
// };

// const totalAgencies = filteredAgencies.length;
//     // Navigate to claim requests
//     const handleRequestClick = () => {
//       navigate("/admin-login/card/claim-requests");
//     }

//     if (loading) return <div className={styles.loading}>Loading agencies...</div>;

//     return (
//       <div className={styles.dashboard}>
//         {/* Header with Buttons */}
//         <div className={styles.headerRow}>
//            <h2>
//       {sessionStorage.getItem("userRole") === "superadmin"
//         ? "Superadmin Dashboard"
//         : "Admin Dashboard"}
//     </h2>
//           <div className={styles.headerButtons}>
//   <button onClick={() => navigate("/admin-login/card/add-agency")}>Add Agency</button>

//   {/* Only show View Requests for admin */}
//   {userRole !== "superadmin" && (
//     <button onClick={handleRequestClick}>View Requests</button>
//   )}

//   <button onClick={toggleDeleteMode}>
//     {isDeleteMode ? "Cancel Delete" : "Delete Agency"}
//   </button>
//   <button className={styles.logoutBtn} onClick={handleLogout}>
//     Logout
//   </button>
// </div>

//         </div>

//         {/* Top Summary Cards */}
//         <div className={styles.topCards}>
//           <div className={styles.topCard}>
//             <span>Total Employees</span>
//             <strong>{totalEmployees}</strong>
//           </div>
//           <div className={styles.topCard}>
//             <span>Total Agencies</span>
//             <strong>{totalAgencies}</strong>
//           </div>
//           <div className={styles.topCard}>
//             <span>Present</span>
//             <strong>{todayStatus.present}</strong>
//           </div>
//           <div className={styles.topCard}>
//             <span>Absent</span>
//             <strong>{todayStatus.absent}</strong>
//           </div>
//         </div>

//         {/* Filter */}
//         <h3>Agencies</h3>
//         <div className={styles.filterSection}>
//           <label>Select Service Type:</label>
//           <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
//             <option value="">All</option>
//             {allTypes.map((type, idx) => (
//               <option key={idx} value={type}>
//                 {type.charAt(0).toUpperCase() + type.slice(1)}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Main Content */}
//         <div className={styles.bottomSection}>
//           {/* Left Column: Agencies */}
//           <div className={styles.leftColumn}>
//             {filteredAgencies.map((agency) => {
//               const employees = agency.employees || [];
//               const attendance = todayAttendance[agency.agencyId] || { present: 0, absent: 0 };

//               return (
//                 <div
//                   key={agency.agencyId}
//                   className={`${styles.agencyCard} ${
//                     isDeleteMode && agenciesToDelete.includes(agency.agencyId) ? styles.cardSelected : ""
//                   }`}
//                   onClick={() => handleAgencyClick(agency.agencyId)}
//                 >
//                   {isDeleteMode && (
//                     <input
//                       type="checkbox"
//                       className={styles.checkbox}
//                       checked={agenciesToDelete.includes(agency.agencyId)}
//                       onChange={() => handleAgencyClick(agency.agencyId)}
//                     />
//                   )}
//                   <strong>{agency.agencyName}</strong>
//                    <span>{agency.agencyId}</span>
//                   <span>Types: {agency.agencyType}</span>
//                   <small>Present: {attendance.present} | Absent: {attendance.absent}</small>
//                   <small>Employees: {employeeCounts[agency.agencyId] ?? 0}</small>
//                 </div>
//               );
//             })}

//             {isDeleteMode && (
//               <button
//                 className={styles.confirmDeleteButton}
//                 onClick={handleActualDeletion}
//                 disabled={agenciesToDelete.length === 0}
//               >
//                 Confirm Deletion ({agenciesToDelete.length})
//               </button>
//             )}
//           </div>

//           {/* Right Column: Alerts */}
//             <div className={styles.alertBox}>
//   <strong>Alerts</strong>
//   <ul>
//     {alertAgencies.length > 0 ? (
//       alertAgencies.map((agency) => (
//         <li key={agency.agencyId}>
//           {agency.agencyName} has {todayAttendance[agency.agencyId]?.absent ?? 0} absentees today
//         </li>
//       ))
//     ) : (
//       <li>No absentees today</li>
//     )}
//   </ul>
// </div>
//         </div>
//       </div>
//     );
//   };

//   export default AdminCardView;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Dashboard.module.css";

const AdminCardView = () => {
  const [agencies, setAgencies] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [agenciesToDelete, setAgenciesToDelete] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [employeeCounts, setEmployeeCounts] = useState({});
  const [todayAttendance, setTodayAttendance] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false); // ✅ sidebar state
  const userRole = sessionStorage.getItem("userRole"); // "admin" or "superadmin"

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/agency/");
        setAgencies(res.data);

        // Employee counts
        const requests = res.data.map((agency) =>
          axios
            .get(
              `http://localhost:8080/employee/countbyagencyid/${agency.agencyId}`
            )
            .then((countRes) => ({
              agencyId: agency.agencyId,
              count: countRes.data,
            }))
            .catch(() => ({ agencyId: agency.agencyId, count: 0 }))
        );
        const results = await Promise.all(requests);
        const counts = results.reduce((acc, curr) => {
          acc[curr.agencyId] = curr.count;
          return acc;
        }, {});
        setEmployeeCounts(counts);

        // Attendance
        const attendanceRequests = res.data.map((agency) =>
          axios
            .get(
              `http://localhost:8080/attendance/getpresentemployeesbyagencyid/${agency.agencyId}`
            )
            .then((r) => ({
              agencyId: agency.agencyId,
              present: r.data,
              absent: (counts[agency.agencyId] ?? 0) - r.data,
            }))
            .catch(() => ({ agencyId: agency.agencyId, present: 0, absent: 0 }))
        );
        const attendanceResults = await Promise.all(attendanceRequests);
        const attendanceData = attendanceResults.reduce((acc, curr) => {
          acc[curr.agencyId] = { present: curr.present, absent: curr.absent };
          return acc;
        }, {});
        setTodayAttendance(attendanceData);
      } catch (err) {
        console.error("Error fetching agencies:", err);
        alert("Failed to load agencies or attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();

    const fetchEmployees = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/employee/getallemployee"
        );
        setTotalEmployees(res.data);
      } catch {
        alert("Failed to load employees");
      }
    };
    fetchEmployees();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("adminLoggedIn");
    window.location.replace("/admin-login");
  };

  const allTypes = [
    ...new Set(
      agencies.flatMap((a) =>
        a.agencyType ? a.agencyType.split(",").map((t) => t.trim()) : []
      )
    ),
  ];

  const todayStatus = Object.values(todayAttendance).reduce(
    (acc, curr) => {
      acc.present += curr.present;
      acc.absent += curr.absent;
      return acc;
    },
    { present: 0, absent: 0 }
  );

  const filteredAgencies = agencies
    .filter((agency) => agency.status === true)
    .filter((agency) =>
      selectedType
        ? agency.agencyType?.split(",").map((t) => t.trim()).includes(selectedType)
        : true
    );

  const alertAgencies = filteredAgencies.filter(
    (agency) => (todayAttendance[agency.agencyId]?.absent ?? 0) > 0
  );

  

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    if (isDeleteMode) setAgenciesToDelete([]);
  };

  const handleActualDeletion = async () => {
    if (agenciesToDelete.length === 0) {
      alert("Select agencies to delete");
      return;
    }

    try {
      await axios.delete("http://localhost:8080/agency/deleteagencies", {
        data: agenciesToDelete,
        headers: { "Content-Type": "application/json" },
      });
      alert("Agencies deleted successfully");

      const updatedAgencies = agencies.filter(
        (agency) => !agenciesToDelete.includes(agency.agencyId)
      );
      setAgencies(updatedAgencies);

      let newTotalEmployees = totalEmployees;
      const updatedTodayAttendance = { ...todayAttendance };

      agenciesToDelete.forEach((agencyId) => {
        const empCount = employeeCounts[agencyId] ?? 0;
        newTotalEmployees -= empCount;
        delete updatedTodayAttendance[agencyId];
      });

      setTotalEmployees(newTotalEmployees);
      setTodayAttendance(updatedTodayAttendance);

      setAgenciesToDelete([]);
      setIsDeleteMode(false);
    } catch {
      alert("Failed to delete agencies");
    }
  };

  const handleRequestClick = () => {
    navigate("/admin-login/card/claim-requests");
  };

  if (loading) return <div className={styles.loading}>Loading agencies...</div>;

  const totalAgencies = filteredAgencies.length;

  return (
    <div className={styles.dashboard}>
      {/* Header with menu button */}
      <div className={styles.headerRow}>
        <button
          className={styles.menuBtn}
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        <h2>
          {userRole === "superadmin"
            ? "Superadmin Dashboard"
            : "Admin Dashboard"}
        </h2>
      </div>

      {/* Sidebar */}
      <div
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ""}`}
      >
        <button
          className={styles.closeBtn}
          onClick={() => setSidebarOpen(false)}
        >
          ✕
        </button>
        <button onClick={() => navigate("/admin-login/agencylist")}>
          View Agencies
        </button>
        {userRole !== "superadmin" && (
          <button onClick={handleRequestClick}>View Requests</button>
        )}
        <button className={`${styles.logoutBtn}`} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Summary cards */}
      <div className={styles.topCards}>
        <div className={styles.topCard}>
          <span>Total Employees</span>
          <strong>{totalEmployees}</strong>
        </div>
        <div className={styles.topCard}>
          <span>Total Agencies</span>
          <strong>{totalAgencies}</strong>
        </div>
        <div className={styles.topCard}>
          <span>Present</span>
          <strong>{todayStatus.present}</strong>
        </div>
        <div className={styles.topCard}>
          <span>Absent</span>
          <strong>{todayStatus.absent}</strong>
        </div>
      </div>

      {/* Filter */}
      <h3>Agencies</h3>
      <div className={styles.filterSection}>
        <label>Select Service Type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All</option>
          {allTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Main */}
      <div className={styles.bottomSection}>
        {/* Agencies */}
        <div className={styles.leftColumn}>
          {filteredAgencies.map((agency) => {
            const attendance = todayAttendance[agency.agencyId] || {
              present: 0,
              absent: 0,
            };
            return (
              <div
                key={agency.agencyId}
                className={`${styles.agencyCard} ${
                  isDeleteMode &&
                  agenciesToDelete.includes(agency.agencyId)
                    ? styles.cardSelected
                    : ""
                }`}
              >
                {isDeleteMode && (
                  <input
                    type="checkbox"
                    checked={agenciesToDelete.includes(agency.agencyId)}
                  />
                )}
                <strong>{agency.agencyName}</strong>
                <span>{agency.agencyId}</span>
                <span>Types: {agency.agencyType}</span>
                <small>
                  Present: {attendance.present} | Absent: {attendance.absent}
                </small>
                <small>
                  Employees: {employeeCounts[agency.agencyId] ?? 0}
                </small>
              </div>
            );
          })}
          {isDeleteMode && (
            <button
              className={styles.confirmDeleteButton}
              onClick={handleActualDeletion}
              disabled={agenciesToDelete.length === 0}
            >
              Confirm Deletion ({agenciesToDelete.length})
            </button>
          )}
        </div>

        {/* Alerts */}
        <div className={styles.alertBox}>
          <strong>Alerts</strong>
          <ul>
            {alertAgencies.length > 0 ? (
              alertAgencies.map((agency) => (
                <li key={agency.agencyId}>
                  {agency.agencyName} has{" "}
                  {todayAttendance[agency.agencyId]?.absent ?? 0} absentees today
                </li>
              ))
            ) : (
              <li>No absentees today</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminCardView;
