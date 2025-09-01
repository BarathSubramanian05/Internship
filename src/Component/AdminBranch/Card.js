import React from "react";
import styles from "./Card.module.css";

const Card = ({ title, isAddCard = false, onClick }) => {
  const cardClass = `${styles.card} ${isAddCard ? styles.addCard : ""}`;

  return (
    <div
      className={cardClass}
      onClick={() => {
        if (isAddCard) {
          window.location.href = "/admin-login/card/add-agency";
        } else {
          onClick(title);
        }
      }}
    >
      {isAddCard ? (
        <div className={styles.addIcon}>+</div>
      ) : (
        <h3 className={styles.cardTitle}>{title}</h3>
      )}
    </div>
  );
};

export default Card;
