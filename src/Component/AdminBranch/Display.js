import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Display.module.css";
import { EmployeeContext } from "../../Context/EmployeeContext";


const Display = () => {
  const { agencyId } = useParams();
  const navigate = useNavigate();

  const { employee, setEmployee } = useContext(EmployeeContext); // 🔥 use context

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agencyName, setAgencyName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");
const userRole = sessionStorage.getItem("userRole"); 
  // Edit modal state
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [fieldsToUpdate, setFieldsToUpdate] = useState({
    phone: false,
    address: false,
    role: false,
    salary: false,
    startTime: false,
    endTime: false
  });
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    role: "",
    salary: "",
    startTime: "",
    endTime: ""
  });

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
    if (!isLoggedIn) {
      window.location.replace("/admin-login");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!agencyId || agencyId === "undefined") {
        alert("Invalid agency ID");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const agencyResponse = await axios.get("http://localhost:8080/agency/");
        const agency = agencyResponse.data.find(a => a.agencyId === agencyId);
        if (agency) setAgencyName(agency.agencyName);

        const employeesResponse = await axios.get(
          `http://localhost:8080/employee/getemployeebyid/${agencyId}`
        );
        setEmployees(employeesResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [agencyId]);

  const filteredEmployees = employees
  .filter(emp => emp.isActive) // ✅ Only active employees
  .filter(
    (emp) =>
      (emp.id?.toString().includes(searchTerm) ||
        emp.employeeId?.toString().includes(searchTerm) ||
        emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredEmployees.slice(indexOfFirst, indexOfLast);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await axios.delete(`http://localhost:8080/employee/deleteemployee/${id}`);
      setEmployees(prev => prev.filter(emp => (emp.id || emp.employeeId) !== id));
      alert("Employee deleted successfully!");
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  // Open edit popup
  const handleEditClick = (emp, e) => {
    e.stopPropagation();
    setEditingEmployee(emp);
    setFieldsToUpdate({
      phone: false,
      address: false,
      role: false,
      salary: false,
      startTime: false,
      endTime: false
    });
    setFormData({
      phone: emp.contact || "",
      address: emp.address || "",
      role: emp.role || "",
      salary: emp.salary || "",
      startTime: emp.startTime || "",
      endTime: emp.endTime || ""
    });
  };

  // Update input values
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "phone") {
    // only digits, max 10
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};


  // Submit updated employee
  const handleUpdate = async () => {
    if (!editingEmployee) return;
    const updatedEmployee = { ...editingEmployee };

    Object.keys(fieldsToUpdate).forEach(field => {
      if (fieldsToUpdate[field]) {
        updatedEmployee[field === "phone" ? "contact" : field] = formData[field];
      }
    });

    try {
      await axios.put(
        `http://localhost:8080/employee/updateemployee`,
        updatedEmployee
      );

      setEmployees(prev =>
        prev.map(emp =>
          (emp.id || emp.employeeId) === (editingEmployee.id || editingEmployee.employeeId)
            ? updatedEmployee
            : emp
        )
      );

      // 🔥 Update global context if the updated employee is the logged-in one
      if ((employee?.id || employee?.employeeId) === (updatedEmployee.id || updatedEmployee.employeeId)) {
        setEmployee(updatedEmployee);
      }

      alert("Employee updated successfully!");
      setEditingEmployee(null);
    } catch (error) {
      console.error("Error updating employee:", error);
    }
  };

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
        <button className={styles.backBtn} onClick={() => navigate("/admin-login/agencylist")}>
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

      {/* Search */}
      <div className={styles.filterBox}>
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Employee Table */}
      <table className={styles.employeeTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Contact</th>
            <th>Salary</th>
            <th style={{textAlign:"center"}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((emp) => (
              <tr
                key={emp.id || emp.employeeId}
                className={styles.clickableRow}
                onClick={() => handleRowClick(emp)}
              >
                <td>{emp.id || emp.employeeId}</td>
                <td>{emp.name || emp.employeeName}</td>
                <td>{emp.role || emp.position}</td>
                <td>{emp.contact || emp.phoneNumber}</td>
                <td>{emp.salary || emp.salary}</td>
                <td className={styles.actionsCell}>
                  <span
                    className={styles.editIcon}
                    onClick={(e) => handleEditClick(emp, e)}
                  >
                    ✏️
                  </span>
                  <span
                    className={styles.deleteIcon}
                    onClick={(e) => handleDelete(emp.id || emp.employeeId, e)}
                  >
                    🗑
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No employees found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
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

      {/* Modal overlay */}
      {editingEmployee && (
        <div style={overlayStyle} onClick={() => setEditingEmployee(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px" }}>
              Edit Employee: {editingEmployee.name || editingEmployee.employeeName}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Phone */}
             <EditableField
  label="Phone"
  field="phone"
  type="tel"
  fieldsToUpdate={fieldsToUpdate}
  setFieldsToUpdate={setFieldsToUpdate}
  handleChange={handleChange}
  formData={formData}
/>



              {/* Address */}
              <EditableField
                label="Address"
                field="address"
                type="textarea"
                fieldsToUpdate={fieldsToUpdate}
                setFieldsToUpdate={setFieldsToUpdate}
                handleChange={handleChange}
                formData={formData}
              />

              {/* Role */}
              <EditableField
                label="Role"
                field="role"
                type="text"
                fieldsToUpdate={fieldsToUpdate}
                setFieldsToUpdate={setFieldsToUpdate}
                handleChange={handleChange}
                formData={formData}
              />

              {/* Salary */}
              <EditableField
                label="Salary"
                field="salary"
                type="text"
                fieldsToUpdate={fieldsToUpdate}
                setFieldsToUpdate={setFieldsToUpdate}
                handleChange={handleChange}
                formData={formData}
              />

              {/* Start Time */}
              <EditableField
                label="Start Time"
                field="startTime"
                type="time"
                fieldsToUpdate={fieldsToUpdate}
                setFieldsToUpdate={setFieldsToUpdate}
                handleChange={handleChange}
                formData={formData}
              />

              {/* End Time */}
              <EditableField
                label="End Time"
                field="endTime"
                type="time"
                fieldsToUpdate={fieldsToUpdate}
                setFieldsToUpdate={setFieldsToUpdate}
                handleChange={handleChange}
                formData={formData}
              />
            </div>

            <div style={{ marginTop: "25px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={handleUpdate} style={updateBtnStyle}>Update</button>
              <button onClick={() => setEditingEmployee(null)} style={cancelBtnStyle}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Reusable editable field component
const EditableField = ({ label, field, type, fieldsToUpdate, setFieldsToUpdate, handleChange, formData }) => {
  return (
    <>
      <div style={fieldRowStyle}>
        <span
          style={plusBtnStyle}
          onClick={() =>
            setFieldsToUpdate((prev) => ({ ...prev, [field]: !prev[field] }))
          }
        >
          {fieldsToUpdate[field] ? "-" : "+"}
        </span>
        <label style={labelStyle}>{label}</label>
      </div>
      {fieldsToUpdate[field] &&
        (type === "textarea" ? (
          <textarea
            name={field}
            value={formData[field] || ""}   // ✅ controlled
            onChange={handleChange}
            placeholder={`Enter new ${label.toLowerCase()}`}
            style={textareaStyle}
          />
        ) : (
          <input
            type={type}
            name={field}
            value={formData[field] || ""}   // ✅ controlled
            onChange={handleChange}
            placeholder={`Enter new ${label.toLowerCase()}`}
            style={inputStyle}
            maxLength={field === "phone" ? 10 : undefined} // ✅ enforce 10 digits
          />
        ))}
    </>
  );
};


const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
   overflow: "scroll"
};

const modalStyle = {
  backgroundColor: "white",
  padding: "30px 35px",
  borderRadius: "12px",
  boxShadow: "0 10px 20px rgba(0,0,0,0.3)",
  width: "400px",
  maxWidth: "95%",
  pointerEvents: "auto"
};

const fieldRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px"
};

const plusBtnStyle = {
  display: "inline-block",
  width: "28px",
  height: "28px",
  lineHeight: "28px",
  textAlign: "center",
  borderRadius: "50%",
  backgroundColor: "#4CAF50",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
  userSelect: "none",
  fontSize: "16px"
};

const labelStyle = {
  width: "80px",
  fontWeight: "500"
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "15px"
};

const textareaStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "15px",
  minHeight: "80px",
  resize: "vertical"
};

const updateBtnStyle = {
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer"
};

const cancelBtnStyle = {
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer"
};

export default Display;
