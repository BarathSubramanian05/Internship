import React, { useState, useEffect,useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AttendancePage.module.css";
import { EmployeeContext } from "../../Context/EmployeeContext";

const AttendancePage = () => {
  const navigate = useNavigate();
  const { employee } = useContext(EmployeeContext);
  const todayKey = new Date().toISOString().slice(0, 10);

  // useEffect(() => {
  //   // Fetch employee from backend (hardcoded id for now)
  //   axios.get("http://localhost:8080/employees/101")
  //     .then((res) => setEmployee(res.data))
  //     .catch((err) => console.error(err));
  // }, []);
  const todayData =
    JSON.parse(localStorage.getItem(`attendance_${todayKey}`)) || {};

  const [checkinTime, setCheckinTime] = useState(todayData.checkinTime || "");
  const [checkoutTime, setCheckoutTime] = useState(todayData.checkoutTime || "");
  const [buttonLabel, setButtonLabel] = useState("Checkin");

  useEffect(() => {
    if (!checkinTime) setButtonLabel("Checkin");
    else if (checkinTime && !checkoutTime) setButtonLabel("Checkout");
    else setButtonLabel("Checked Out");
  }, [checkinTime, checkoutTime]);

  const formatTime = (date) => new Date(date).toLocaleString();

  const calculateWorkingHours = () => {
    if (!checkinTime || !checkoutTime) return "-";
    const checkin = new Date(checkinTime);
    const checkout = new Date(checkoutTime);
    let diffMs = checkout - checkin;
    if (diffMs <= 0) return "-";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const handleCheckin = () => {
    if (!employee) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      try {
        const validateRes = await axios.post("http://localhost:8080/gps/test", {  //dummycheck {Refer backend gps} or /login for inside company
          latitude,
          longitude
        });

        if (validateRes.data === "Success") {
          const currentTime = new Date().toISOString();
          console.log(employee.employeeId);
          console.log(currentTime);
          await axios.post("http://localhost:8080/attendance/addintime",null, {
           params:{ employeeId: employee.employeeId,
            inTime: currentTime}
          });

//           await axios.post("http://localhost:8080/attendance/addintime", null, {
//   params: {
//     employeeId: employee.employeeId,
//     inTime: currentTime
//   }
// });


          setCheckinTime(currentTime);
          localStorage.setItem(
            `attendance_${todayKey}`,
            JSON.stringify({ checkinTime: currentTime })
          );
          setButtonLabel("Checkout");
          alert("✅ Check-in successful! Redirecting in 5 seconds...");
          setTimeout(() => navigate("/user/dashboard"), 5000);
        } else {
          alert("❌ You are outside the allowed perimeter. Cannot check-in.");
        }
      } catch (error) {
        console.error("Check-in error", error);
      }
    });
  };

  const handleCheckout = async () => {
    if (!employee) return;
    const confirmCheckout = window.confirm("Are you sure you want to checkout?");
    if (!confirmCheckout) return;

    const currentTime = new Date().toISOString();

    try {
      await axios.post("http://localhost:8080/attendance/addouttime",null, {
        params:{
        employeeId: employee.employeeId,
        outTime: currentTime}
      });

      setCheckoutTime(currentTime);
      localStorage.setItem(
        `attendance_${todayKey}`,
        JSON.stringify({ checkinTime, checkoutTime: currentTime })
      );
      setButtonLabel("Checked Out");
      alert("✅ Checkout successful! Redirecting in 5 seconds...");
      setTimeout(() => navigate("/user/dashboard"), 5000);
    } catch (error) {
      console.error("Checkout error", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Employee Attendance</h2>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.theadRow}>
              <th className={styles.th}>Employee ID</th>
              <th className={styles.th}>Name</th>
              <th className={styles.th}>Check-in Time</th>
              <th className={styles.th}>Checkout Time</th>
              <th className={styles.th}>Total Hours</th>
              <th className={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {employee && (
              <tr className={styles.trHover}>
                <td className={styles.td}>{employee.employeeId}</td>
                <td className={styles.td}>{employee.name}</td>
                <td className={styles.td}>
                  {checkinTime ? formatTime(checkinTime) : "-"}
                </td>
                <td className={styles.td}>
                  {checkoutTime ? formatTime(checkoutTime) : "-"}
                </td>
                <td className={`${styles.td} ${styles.workingHours}`}>
                  {calculateWorkingHours()}
                </td>
                <td className={styles.td}>
                  {buttonLabel === "Checkin" ? (
                    <button className={styles.btnPrimary} onClick={handleCheckin}>
                      {buttonLabel}
                    </button>
                  ) : buttonLabel === "Checkout" ? (
                    <button className={styles.btnPrimary} onClick={handleCheckout}>
                      {buttonLabel}
                    </button>
                  ) : (
                    <span className={styles.textSuccess}>Checked Out</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
