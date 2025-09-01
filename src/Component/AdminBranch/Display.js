import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Display.module.css";

const Display = () => {
  const { agencyId } = useParams(); 
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");

  console.log("Agency ID from URL:", agencyId);

  useEffect(() => {
    const fetchData = async () => {
      if (!agencyId || agencyId === "undefined") {
        console.error("Invalid agencyId:", agencyId);
        alert("Invalid agency ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // 1️⃣ Fetch agency details first
        const agencyResponse = await axios.get("http://localhost:8080/agency/");
        const agency = agencyResponse.data.find(a => a.agencyId === agencyId);
        if (agency) {
          setAgencyName(agency.agencyName);
        } else {
          console.error("Agency not found for ID:", agencyId);
        }

        // 2️⃣ Fetch employees for this agency
        const employeesResponse = await axios.get(
          `http://localhost:8080/employee/getemployeebyid/${agencyId}`
        );
        console.log("Employees response:", employeesResponse.data);
        setEmployees(employeesResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response) {
          console.error("Error response:", error.response.data);
          console.error("Error status:", error.response.status);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [agencyId]);

  // Delete employee
  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent row click
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await axios.delete(`http://localhost:8080/employee/deleteemployee/${id}`);
      setEmployees(prev => prev.filter(emp => emp.id !== id && emp.employeeId !== id));
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
      if (error.response) {
        console.error("Delete error response:", error.response.data);
        console.error("Delete error status:", error.response.status);
      }
    }
  };

  // Navigate to employee details
  const handleRowClick = (employee) => {
    navigate(`/admin-login/card/display/employee/${employee.id || employee.employeeId}`, {
      state: { employee },
    });
  };

  if (loading) {
    return (
      <div className={styles.displayContainer}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate("/admin-login/card")}>
            ← Back
          </button>
          <h2>Loading employees...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.displayContainer}>
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate("/admin-login/card")}>
          ← Back
        </button>
        <h2>Employees of {agencyName || "Agency"}</h2>
        <button
          className={styles.addEmployeeBtn}
          onClick={() => navigate(`/admin-login/card/add-employee/${agencyId}`)}
        >
          + Add Employee
        </button>
      </div>

      <table className={styles.employeeTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees && employees.length > 0 ? (
            employees.map(emp => (
              <tr
                key={emp.id || emp.employeeId}
                className={styles.clickableRow}
                onClick={() => handleRowClick(emp)}
              >
                <td>{emp.id || emp.employeeId}</td>
                <td>{emp.name || emp.employeeName}</td>
                <td>{emp.role || emp.position}</td>
                <td>{emp.contact || emp.phoneNumber}</td>
                <td
                  className={styles.deleteIcon}
                  onClick={(e) => handleDelete(emp.id || emp.employeeId, e)}
                >
                  🗑
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className={styles.noData}>
                No employees found for this agency.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Display;





// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import styles from "./Display.module.css";

// const Display = () => {
//   const { agencyId } = useParams(); 
//   const navigate = useNavigate();
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [agencyName, setAgencyName] = useState("");

//   // Debug: Check the agencyId parameter
//   console.log("Agency ID from URL:", agencyId);

//   // Fetch employees by agency ID
//   useEffect(() => {
//     const fetchData = async () => {
//       // Check if agencyId is valid
//       if (!agencyId || agencyId === "undefined") {
//         console.error("Invalid agencyId:", agencyId);
//         alert("Invalid agency ID");
//         setLoading(false);
//         return;
//       }
      
//       setLoading(true);
//       try {
//         // Fetch employees for this agency
//               console.log("Making API call to:", `http://localhost:8080/employee/getemployeebyid/${agencyId}`);
//         const employeesResponse = await axios.get(
//           `http://localhost:8080/employee/getemployeebyid/${agencyId}`
//         );
        
//         console.log("Employees response:", employeesResponse.data);
        
  
//         try {
//           const agencyResponse = await axios.get("http://localhost:8080/agency/");
//           const agency = agencyResponse.data.find(a => a.agencyId === agencyId);
//           if (agency) {
//             setAgencyName(agency.agencyName);
//           } else {
//             console.error("Agency not found for ID:", agencyId);
//           }
//         } catch (error) {
//           console.error("Error fetching agency details:", error);
//         }
        
//         setEmployees(employeesResponse.data);
//       } catch (error) {
//         console.error("Error fetching employees:", error);
//         if (error.response) {
//           console.error("Error response:", error.response.data);
//           console.error("Error status:", error.response.status);
//         }
//        // alert("Failed to fetch employees. Check console for details.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [agencyId]);

//  const handleDelete = async (id, e) => {
//     e.stopPropagation(); // Prevent row click event
    
//     if (!window.confirm("Are you sure you want to delete this employee?")) {
//       return;
//     }
    
//     try {
//       // Make the API call to delete the employee
//       await axios.delete(`http://localhost:8080/employee/deleteemployee/${id}`);
      
//       // Remove the deleted employee from the local state
//       setEmployees(prevEmployees => 
//         prevEmployees.filter(emp => 
//           (emp.id !== id && emp.employeeId !== id) ||
//           (emp.id !== id && emp.employeeId !== id.toString())
//         )
//       );
      
//       alert("Employee deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting employee:", error);
//       if (error.response) {
//         console.error("Delete error response:", error.response.data);
//         console.error("Delete error status:", error.response.status);
//       }
//       //alert("Failed to delete employee. Check console for details.");
//     }
//   };

//   const handleRowClick = (employee) => {
//     navigate(`/admin-login/card/display/employee/${employee.id || employee.employeeId}`, {
//       state: { employee },
//     });
//   };

//   if (loading) {
//     return (
//       <div className={styles.displayContainer}>
//         <div className={styles.topBar}>
//           <button className={styles.backBtn} onClick={() => navigate("/admin-login/card")}>
//             ← Back
//           </button>
//           <h2>Loading employees...</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.displayContainer}>
//       <div className={styles.topBar}>
//         <button className={styles.backBtn} onClick={() => navigate("/admin-login/card")}>
//           ← Back
//         </button>
//         <h2>Employees of {agencyName}</h2>
//         <button
//           className={styles.addEmployeeBtn}
//           onClick={() => navigate(`/admin-login/card/add-employee/${agencyId}`)}
//         >
//           + Add Employee
//         </button>
//       </div>

//       <table className={styles.employeeTable}>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Name</th>
//             <th>Role</th>
//             <th>Contact</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {employees && employees.length > 0 ? (
//             employees.map((emp) => (
//               <tr
//                 key={emp.id || emp.employeeId}
//                 className={styles.clickableRow}
//                 onClick={() => handleRowClick(emp)}
//               >
//                 <td>{emp.id || emp.employeeId}</td>
//                 <td>{emp.name || emp.employeeName}</td>
//                 <td>{emp.role || emp.position}</td>
//                 <td>{emp.contact || emp.phoneNumber}</td>
//                 <td
//                   className={styles.deleteIcon}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleDelete(emp.id || emp.employeeId,e);
//                   }}
//                 >
//                   🗑
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="5" className={styles.noData}>
//                 No employees found for this agency.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Display;