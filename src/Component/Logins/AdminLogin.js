import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminLogin.module.css"; 
//import axios from "axios";

const AdminLogin = () => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const SAMPLE_ADMINS = [
  { username: "admin", email: "admin@example.com", password: "admin123" },
  { username: "superuser", email: "super@example.com", password: "super123" },
];
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    const isValidAdmin = SAMPLE_ADMINS.some(
      (admin) =>
        (admin.username === emailOrUsername || admin.email === emailOrUsername) &&
        admin.password === password
    );

    if (isValidAdmin) {
      navigate("/admin-login/card");
    } else {
      setError("Invalid credentials. Please try again.");
    }
    // try{
    //     const res = axios.post("http://localhost:8080/login/admin-login/",);
    // if(res.status === 200){
    //   navigate("/admin-login/card");
    // }
    // else if(res.status === 400) {
    //     alert("Invalid credentials. Please try again.");
    // }
    // }catch(err){
    //     console.log(err);
    //     setError("Invalid credentials. Please try again.");
    //     alert("Something went wrong! Please try again later.");
    // }
  };

  return (
    <div className={styles.adminLoginWrapper}>
      <div className={styles.adminLoginCard}>
        <h3 className={styles.adminLoginTitle}>Admin Login</h3>

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="emailOrUsername">Username or Email</label>
            <input
              type="text"
              id="emailOrUsername"
              placeholder="Enter username or email"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
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
