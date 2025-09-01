// src/Component/UserBranch/UserNavbar.js
import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaClipboardList, FaUserCheck, FaPlusCircle, FaUserCircle } from "react-icons/fa"; 
import styles from "./UserNavbar.module.css";
import { useNavigate } from "react-router-dom";
import { EmployeeContext } from "../../Context/EmployeeContext";
import { useContext } from "react";

const UserNavbar = () => {

  const navigate = useNavigate();
  const { employee } = useContext(EmployeeContext);
  const handleLogout = () => {
    navigate("/user-login");
  };

  return (
    <nav className={styles.navbar}>
      {/* Left side links */}
      <div className={styles.navbarLeft}>
        <Link to="/user/dashboard" className={styles.navbarLink}>
          <FaHome className={styles.icon} /> Home
        </Link>
        <Link to="/user/claim-request" className={styles.navbarLink}>
          <FaClipboardList className={styles.icon} /> Claim Request
        </Link>
        <Link to="/user/view-attendance" className={styles.navbarLink}>
          <FaUserCheck className={styles.icon} /> View Attendance
        </Link>
        <Link to="/user/post-attendance" className={styles.navbarLink}>
          <FaPlusCircle className={styles.icon} /> Post Attendance
        </Link>
      </div>

      {/* Right side profile */}
      <div className={styles.navbarRight}>
        <span className={styles.profileName}><span>{employee?.name || "User"}</span></span>
        {/* If no profile picture, use FaUserCircle */}
        <FaUserCircle className={styles.profileIcon} />
        {/* If you have real profile pic, replace above with:
        <img className={styles.profileAvatar} src="/path/to/profile.jpg" alt="Profile" /> */}
        <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
      </div>
    </nav>
  );
};

export default UserNavbar;
