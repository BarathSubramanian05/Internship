import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "./Card";
import styles from "./Card.module.css";

const AdminCardView = () => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedAgencies, setSelectedAgencies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  const isLoggedIn = sessionStorage.getItem("adminLoggedIn");
  if (!isLoggedIn) {
    window.location.replace("/admin-login"); 
  }
}, []);


  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/agency/");
        setAgencies(res.data);
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
    if (!deleteMode) navigate(`/admin-login/display/${agency.agencyId}`);
  };

  const handleDeleteModeToggle = () => {
    setDeleteMode(!deleteMode);
    setSelectedAgencies([]);
  };

  const handleSelect = (agencyId) => {
    setSelectedAgencies((prev) =>
      prev.includes(agencyId)
        ? prev.filter((id) => id !== agencyId)
        : [...prev, agencyId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedAgencies.length === 0) {
      alert("Select agencies to delete");
      return;
    }

    try {
      await axios.delete("http://localhost:8080/agency/deleteagencies", {
        data: selectedAgencies,
        headers: { "Content-Type": "application/json" },
      });
      alert("Agencies deleted successfully");
      window.location.reload(); 
    } catch (err) {
      console.error("Error deleting agencies:", err);
      alert("Failed to delete agencies");
    }
  };

  const handleLogout = () => {
  sessionStorage.removeItem("adminLoggedIn"); 
  window.location.replace("/admin-login");
  }

  const handleRequestClick = () => {
    navigate("/admin-login/card/claim-requests");
  }

  if (loading) return <p>Loading agencies...</p>;

  return (
    
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <h2 className={styles.title}>Agencies</h2>
        <div className={styles.buttonGroup}>
          {deleteMode ? (
            <>
              <button
                className={`${styles.deleteBtn} ${styles.confirmBtn}`}
                onClick={handleDeleteSelected}
              >
                Confirm Delete
              </button>
              <button
                className={styles.cancelBtn}
                onClick={handleDeleteModeToggle}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              className={styles.deleteBtn}
              onClick={handleDeleteModeToggle}
            >
              Delete
            </button>
          )}
          <button
              className={styles.deleteBtn}
              onClick={handleRequestClick}
            >
              View Request
            </button>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className={styles.cardContainer}>
        {agencies.map((agency) => (
          <div key={agency.agencyId} className={styles.cardWrapper}>
            {deleteMode && (
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selectedAgencies.includes(agency.agencyId)}
                onChange={() => handleSelect(agency.agencyId)}
              />
            )}
            <Card agency={agency} onClick={() => handleCardClick(agency)} />
          </div>
        ))}
        <Card isAddCard />
      </div>
    </div>
  );
};

export default AdminCardView;
