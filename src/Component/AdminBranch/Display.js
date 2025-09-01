/*import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyData } from "../data";
import styles from "./Display.module.css";

const Display = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const filtered = dummyData.filter((item) => item.role === role);

  const handleDelete = (id) => {
    alert(`Delete employee with ID: ${id}`);
    // TODO: backend call or state update to delete
  };

  const handleRowClick = (employee) => {
    navigate(`/admin-login/card/display/employee/${employee.id}`, {
      state: { employee },
    });
  };

  return (
    <div className={styles.displayContainer}>
      
      <div className={styles.buttonRow}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <button
          className={styles.addEmployeeBtn}
          onClick={() => navigate("/admin-login/card/add-employee")}
        >
          + Add Employee
        </button>
      </div>

      
      <div className={styles.headingRow}>
        <h2>Employment Details</h2>
      </div>

      
      <table className={styles.employeeTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((emp) => (
            <tr
              key={emp.id}
              className={styles.clickableRow}
              onClick={() => handleRowClick(emp)}
            >
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td
                className={styles.deleteIcon}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(emp.id);
                }}
              >
                🗑
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Display;
*/
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dummyData } from "./data";
import styles from "./Display.module.css";

const Display = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Filter state
  const [searchTerm, setSearchTerm] = useState("");

  // Filter data by role + search term (ID or Name)
  const filtered = dummyData.filter(
    (item) =>
      item.role === role &&
      (item.id.toString().includes(searchTerm) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);

  const handleDelete = (id) => {
    alert(`Delete employee with ID: ${id}`);
    // TODO: backend call or state update to delete
  };

  const handleRowClick = (employee) => {
    navigate(`/admin-login/card/display/employee/${employee.id}`, {
      state: { employee },
    });
  };

  return (
    <div className={styles.displayContainer}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h2>Employment Details</h2>
        <button
          className={styles.addEmployeeBtn}
          onClick={() => navigate("/admin-login/card/add-employee")}
        >
          + Add Employee
        </button>
      </div>

      {/* Filter input */}
      <div className={styles.filterBox}>
        <input
          type="text"
          placeholder="Search by ID or Name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // reset to first page when filtering
          }}
        />
      </div>

      {/* Table */}
      <table className={styles.employeeTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((emp) => (
              <tr
                key={emp.id}
                className={styles.clickableRow}
                onClick={() => handleRowClick(emp)}
              >
                <td>{emp.id}</td>
                <td>{emp.name}</td>
                <td
                  className={styles.deleteIcon}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(emp.id);
                  }}
                >
                  🗑
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No records found
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
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Display;