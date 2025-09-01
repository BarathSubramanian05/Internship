import React, { useEffect, useState,useContext } from "react";
import styles from "./UserDashboard.module.css";
import { FaUserCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { EmployeeContext } from "../../Context/EmployeeContext";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { employee } = useContext(EmployeeContext);
  console.log(employee);
  useEffect(() => {
  if (!employee) navigate("/user-login");
}, [employee, navigate]);

if (!employee) return null;

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1>Employee Dashboard</h1>
      </header>

      <div className={styles.userCard}>
        <FaUserCircle className={styles.userIcon} />
        <h2>{employee.name}</h2>
        <p><strong>Phone:</strong> +91 {employee.phoneNumber}</p>
        <p><strong>Employee ID:</strong> {employee.employeeId}</p>
        <p><strong>Agency ID:</strong> {employee.agencyId}</p>
        <p><strong>Role:</strong> {employee.role}</p>
        <p><strong>Salary:</strong> Rs.{employee.salary}</p>
      </div>
    </div>
  );
};

export default UserDashboard;
