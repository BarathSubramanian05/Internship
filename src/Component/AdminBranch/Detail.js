import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { dummyData } from "./data";
import styles from "./Detail.module.css";

const calculateWorkHours = (timeIn, timeOut) => {
  if (timeIn === "-" || timeOut === "-" || timeIn === "--" || timeOut === "--")
    return "-";

  const [inHour, inMin] = timeIn.split(":").map(Number);
  const [outHour, outMin] = timeOut.split(":").map(Number);

  const inDate = new Date(0, 0, 0, inHour, inMin);
  const outDate = new Date(0, 0, 0, outHour, outMin);

  let diff = (outDate - inDate) / (1000 * 60 * 60);
  if (diff < 0) diff += 24;

  return diff.toFixed(2);
};

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = useState(dummyData);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const employee =
    location.state?.employee || records.find((emp) => emp.id === parseInt(id));

  if (!employee) {
    return (
      <div className={styles.error}>
        <p>No employee data found. Please go back and try again.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Filter records for the employee
  const allAttendanceRecords = records
    .filter((item) => item.id === employee.id && item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination
  const recordsPerPage = 10;
  const totalPages = Math.ceil(allAttendanceRecords.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = allAttendanceRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // when user picks a date
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleDateOk = () => {
    if (!selectedDate) return alert("Please choose a date first.");
    const record = allAttendanceRecords.find((r) => r.date === selectedDate);
    if (record) {
      setSelectedRecord({ ...record });
      setShowModal(true);
    } else {
      alert("No record found for this date!");
    }
  };

  // toggle Present/Absent
  const toggleStatus = () => {
    setSelectedRecord((prev) => {
      const newStatus = prev.status === "Present" ? "Absent" : "Present";
      return {
        ...prev,
        status: newStatus,
        timeIn: "--",
        timeOut: "--",
      };
    });
  };

  // update data
  const handleDone = () => {
    setRecords((prev) =>
      prev.map((rec) =>
        rec.id === employee.id && rec.date === selectedRecord.date
          ? {
              ...rec,
              status: selectedRecord.status,
              timeIn: selectedRecord.timeIn,
              timeOut: selectedRecord.timeOut,
            }
          : rec
      )
    );
    setShowModal(false);
    setSelectedDate("");
  };

  // pagination change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={styles.detailContainer}>
      <div className={styles.leftPanel}>
        <h2>Employee Details</h2>
        <p>
          <strong>ID:</strong> {employee.id}
        </p>
        <p>
          <strong>Name:</strong> {employee.name}
        </p>
        <p>
          <strong>Agency:</strong> {employee.agency || employee.role}
        </p>
        <p>
          <strong>Position:</strong> {employee.position}
        </p>
      </div>

      <div className={styles.rightPanel}>
        {/* Date filter */}
        <div className={styles.filterBox}>
          <label>Filter by Date: </label>
          <input type="date" value={selectedDate} onChange={handleDateChange} />
          <button onClick={handleDateOk}>OK</button>
        </div>

        <h3>Attendance Records (Month)</h3>
        <table className={styles.attendanceTable}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Work Hours</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No attendance records found.
                </td>
              </tr>
            )}
            {currentRecords.map((record, idx) => (
              <tr
                key={idx}
                className={record.status === "Absent" ? styles.absentRow : ""}
              >
                <td>{record.date}</td>
                <td>{record.status}</td>
                <td>{record.timeIn}</td>
                <td>{record.timeOut}</td>
                <td>{calculateWorkHours(record.timeIn, record.timeOut)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={currentPage === i + 1 ? styles.activePage : ""}
              >
                {i + 1}
              </button>
            ))}
            {currentPage < totalPages && (
              <button onClick={() => handlePageChange(currentPage + 1)}>
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedRecord && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Attendance Details</h3>
            <p>
              <strong>Date:</strong> {selectedRecord.date}
            </p>
            <p>
              <strong>Status:</strong> {selectedRecord.status}
            </p>
            <p>
              <strong>Time In:</strong> {selectedRecord.timeIn}
            </p>
            <p>
              <strong>Time Out:</strong> {selectedRecord.timeOut}
            </p>
            <p>
              <strong>Work Hours:</strong>{" "}
              {calculateWorkHours(
                selectedRecord.timeIn,
                selectedRecord.timeOut
              )}
            </p>

            <button onClick={toggleStatus} className={styles.toggleBtn}>
              Toggle to{" "}
              {selectedRecord.status === "Present" ? "Absent" : "Present"}
            </button>

            <div className={styles.modalActions}>
              <button onClick={handleDone} className={styles.doneBtn}>
                Done
              </button>
              <button
                onClick={() => setShowModal(false)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Detail;