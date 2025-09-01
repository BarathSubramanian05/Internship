/*import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import styles from "./Card.module.css"; // ✅ Import CSS module styles

const AdminCardView = () => {
  const navigate = useNavigate();

  const handleCardClick = (role) => {
    navigate(`/admin-login/display/${role}`);
  };

  return (
    <div className={styles.cardContainer}> 
      <Card title="Employee" onClick={handleCardClick} />
      <Card title="Canteen Employee" onClick={handleCardClick} />
      <Card title="Sanitary Employee" onClick={handleCardClick} />
      <Card isAddCard /> 
    </div>
  );
};

export default AdminCardView;
*/


import React from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";  // Bell icon
import Card from "./Card";
import styles from "./Card.module.css";

const AdminCardView = () => {
  const navigate = useNavigate();

  const handleCardClick = (role) => {
    navigate(`/admin-login/display/${role}`);
  };

  return (
    <div className={styles.cardWrapper}>
      {/* 🔔 Bell Icon */}
      <div
        className={styles.bellWrapper}
        onClick={() => navigate("/admin-login/card/claim-requests")}
      >
        <FaBell className={styles.bellIcon} />
      </div>

      {/* 📋 Cards */}
      <div className={styles.cardContainer}>
        <Card title="Software Engineer" onClick={() => handleCardClick("Software Engineer")} />
        <Card title="Manager" onClick={() => handleCardClick("Manager")} />
        <Card title="Designer" onClick={() => handleCardClick("Designer")} />

        <Card isAddCard />
      </div>
    </div>
  );
};

export default AdminCardView;
