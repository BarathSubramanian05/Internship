import React, { useState, useContext } from "react";
import styles from "./Login.module.css"; // Your CSS module
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { EmployeeContext } from "../../Context/EmployeeContext";

const generateCaptcha = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return captcha;
};

const Login = () => {
  const { setEmployee } = useContext(EmployeeContext);
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userCaptcha, setUserCaptcha] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSentMessage, setOtpSentMessage] = useState("");
  const [otpError, setOtpError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false); // 🔥 New state for loading

  const isPhoneValid = (number) => /^[6-9][0-9]{9}$/.test(number);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setPhone(value);
    if (phoneError) setPhoneError("");
  };

  const handleCaptchaInput = (e) => {
    const value = e.target.value.toUpperCase();
    setUserCaptcha(value);
    if (captchaError) setCaptchaError("");
  };

  const handleGenerateOtp = async () => {
    if (!isPhoneValid(phone)) {
      setPhoneError("Phone number must be 10 digits and start with 6, 7, 8, or 9.");
      return;
    }

    if (userCaptcha !== captcha) {
      setCaptchaError("Captcha does not match. Please try again.");
      setCaptcha(generateCaptcha());
      setUserCaptcha("");
      setShowOtpInput(false);
      setOtpSentMessage("");
      return;
    }

    try {
      setLoading(true); // 🔥 Start loading
      const response = await axios.post("http://localhost:8080/auth/send", null, {
        params: { phoneNumber: phone },
      });

      setCaptchaError("");
      setPhoneError("");
      setOtpSentMessage(response.data || "OTP sent to your phone number!");
      setShowOtpInput(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setOtpSentMessage("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false); // 🔥 Stop loading
    }
  };

  const handleSubmit = async () => {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setOtpError("Please enter a valid 6-digit OTP.");
      setSuccessMessage("");
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/auth/verify", null, {
        params: {
          phoneNumber: phone,
          otp: otp,
        },
      });

      if (response.status === 200) {
        setOtpError("");
        setSuccessMessage("OTP verified successfully!");
        const response2 = await axios.get(
          `http://localhost:8080/employee/getemployeebyphonenumber`,
          { params: { phoneNumber: phone } }
        );

        const employee = response2.data;

        if (employee) {
          setEmployee(employee);
          localStorage.setItem("employee", JSON.stringify(employee));
          navigate("/user", { state: { employee: employee } });
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setOtpError("Invalid or expired OTP. Please try again.");
    }
  };

  return (
    <div className={styles.loginContainer}>
      <button className={styles.homeButton} onClick={() => navigate("/")}>
        Home
      </button>

      <div className={styles.loginBox}>
        <h2>User Login</h2>

        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          placeholder="Enter 10-digit phone number"
          maxLength={10}
          value={phone}
          onChange={handlePhoneChange}
          className={phoneError ? styles.inputError : ""}
        />
        {phoneError && <div className={styles.errorMessage}>{phoneError}</div>}

        <div className={styles.captchaSection}>
          <div className={styles.captchaBox}>{captcha}</div>
          <button
            className={styles.refreshButton}
            onClick={() => setCaptcha(generateCaptcha())}
          >
            ↻
          </button>
        </div>

        <input
          type="text"
          placeholder="Enter Captcha"
          value={userCaptcha}
          onChange={handleCaptchaInput}
          className={captchaError ? styles.inputError : ""}
        />
        {captchaError && <div className={styles.errorMessage}>{captchaError}</div>}

        <button
          className={styles.otpButton}
          onClick={handleGenerateOtp}
          disabled={loading} // 🔥 disable button while loading
        >
          {loading ? "Sending..." : "Generate OTP"} {/* 🔥 show text change */}
        </button>

        {otpSentMessage && <div className={styles.infoMessage}>{otpSentMessage}</div>}

        {showOtpInput && (
          <>
            <label htmlFor="otp">Enter OTP</label>
            <input
              type="text"
              id="otp"
              placeholder="Enter OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={otpError ? styles.inputError : ""}
            />
            {otpError && <div className={styles.errorMessage}>{otpError}</div>}

            <button className={styles.submitButton} onClick={handleSubmit}>
              Submit
            </button>
          </>
        )}

        {successMessage && <div className={styles.successMessage}>{successMessage}</div>}
      </div>
    </div>
  );
};

export default Login;
