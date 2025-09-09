//import React from "react";
import styles from "./Card.module.css";

const Card = ({ agency, isAddCard = false, onClick }) => {
  const cardClass = `${styles.card} ${isAddCard ? styles.addCard : ""}`;

  return (
    <div
      className={cardClass}
      onClick={() => {
        if (isAddCard) {
          window.location.href = "/admin-login/card/add-agency";
        } else {
          onClick(agency); 
        }
      }}
    >
      {isAddCard ? (
        <div className={styles.addIcon}>+</div>
      ) : (
        <div className={styles.cardContent}>
          <h3 className={styles.cardTitle}>{agency.agencyName}</h3>
          <p className={styles.cardSubtitle}>{agency.agencyType}</p>
        </div>
      )}
    </div>
  );
};

export default Card;