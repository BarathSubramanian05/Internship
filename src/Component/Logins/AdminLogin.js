import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css"; 
import axios from "axios";


/*const SAMPLE_ADMINS = [
  { username: "admin", email: "admin@example.com", password: "admin123" },
  { username: "superuser", email: "super@example.com", password: "super123" },
];*/

const AdminLogin = () => {
  const [userName, setuserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, /*setError*/] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(
      `http://localhost:8080/login/admin-login?userName=${userName}&password=${password}`
    );

    if (res.status === 200) {
      const message = res.data; // e.g., "login successful-admin"
      
      // Extract role from the message
      let userRole = "admin"; // default
      if (message.includes("superadmin")) {
        userRole = "superadmin";
      }

      // Save login info
      sessionStorage.setItem("adminLoggedIn", "true");
      sessionStorage.setItem("userRole", userRole);

      navigate("/admin-login/card", { replace: true });
    }
  } catch (err) {
    // If backend returns bad request (400)
    if (err.response && err.response.status === 400) {
      alert(err.response.data); // shows "invalid login"
    } else {
      alert("Something went wrong");
    }
  }
};

  return (
    <div className={styles.adminLoginWrapper}>
            <button
  className={styles.homeButton}
  onClick={() => navigate("/")}>  
  Home</button>
      <div className={styles.adminLoginCard}>
        <h3 className={styles.adminLoginTitle}>Admin Login</h3>

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="userName">Username or Email</label>
            <input
              type="text"
              id="userName"
              placeholder="Enter username"
              value={userName}
              onChange={(e) => setuserName(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.inputField}
              required
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <button type="submit" className={styles.loginBtn}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
