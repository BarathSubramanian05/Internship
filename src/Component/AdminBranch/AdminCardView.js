import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "./Card";
import styles from "./Card.module.css";

const AdminCardView = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/agency/");
        setAgencies(res.data);
        console.log("Agencies data:", res.data);
      } catch (err) {
        console.error("Error fetching agencies:", err);
        alert("Failed to load agencies");
      } finally {
        setLoading(false);
      }
    };

    fetchAgencies();
  }, []);

  const handleCardClick = (agency) => {
    console.log("Clicked agency:", agency);
    navigate(`/admin-login/display/${agency.agencyId}`);
  };

  const handleLogout = () => {
    // Optional: Clear auth/session here
    navigate("/admin-login"); // Navigate to your login route
  };

  if (loading) return <p>Loading agencies...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <h2 className={styles.title}>Agencies</h2>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className={styles.cardContainer}>
        {agencies.map((agency, index) => (
          <Card
            key={index}
            agency={agency} 
            onClick={handleCardClick}
          />
        ))}
        {/* Add agency card */}
        <Card isAddCard />
      </div>
    </div>
  );
};

export default AdminCardView;
