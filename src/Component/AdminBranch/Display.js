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
  
  // Pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!agencyId || agencyId === "undefined") {
        alert("Invalid agency ID");
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Fetch agency details
        const agencyResponse = await axios.get("http://localhost:8080/agency/");
        const agency = agencyResponse.data.find(a => a.agencyId === agencyId);
        if (agency) setAgencyName(agency.agencyName);

        // Fetch employees
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

  // Filter employees based on search term (ID or Name)
  const filteredEmployees = employees.filter(
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

      {/* Search */}
      <div className={styles.filterBox}>
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset page when searching
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
            <th>Actions</th>
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
              <td colSpan="5" style={{ textAlign: "center" }}>
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
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Display;
