import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css"; // ✅ Import CSS module
import axios from "axios";

// Sample hardcoded admin credentials
const SAMPLE_ADMINS = [
  { username: "admin", email: "admin@example.com", password: "admin123" },
  { username: "superuser", email: "super@example.com", password: "super123" },
];

const AdminLogin = () => {
  const [userName, setuserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async  (e) => {
    e.preventDefault();


    // const isValidAdmin = SAMPLE_ADMINS.some(
    //   (admin) =>
    //     (admin.username === userName || admin.email === userName) &&
    //     admin.password === password
    // );

    // if (isValidAdmin) {
    //   navigate("/admin-login/card");
    // } else {
    //   setError("Invalid credentials. Please try again.");
    // }

    try{
        const res = await axios.post(`http://localhost:8080/login/admin-login?userName=${userName}&password=${password}`);
        if(res.status===200){
          //alert("Success");
          sessionStorage.setItem("adminLoggedIn", "true"); // ✅ store login state
          navigate("/admin-login/card", { replace: true });
        }
        else{
          alert("Invalid credentials")
        }
    }
    catch(err)
    {
      alert("Something wrong");
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
              placeholder="Enter username or email"
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
