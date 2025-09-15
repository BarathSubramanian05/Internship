import React, { useState, useRef, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaClipboardList,
  FaUserCheck,
  FaPlusCircle,
  FaUserCircle,
  FaSignOutAlt,
  FaEdit,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import styles from "./UserNavbar.module.css";
import { EmployeeContext } from "../../Context/EmployeeContext";

const UserNavbar = () => {
  const navigate = useNavigate();
  const { employee, setEmployee, logout } = useContext(EmployeeContext);
const { toggleRefresh } = useContext(EmployeeContext);
  const [showProfile, setShowProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Checkin/Checkout state
  const [buttonLabel, setButtonLabel] = useState("Checkin");

  const todayKey = new Date().toISOString().slice(0, 10);
  const [sessions, setSessions] = useState([]);

  // --- Profile state remains same ---
  const [profileData, setProfileData] = useState({
    empId: employee?.employeeId || "EMP001",
    agency: employee?.agencyId || "Agency",
    name: employee?.name || "User",
    email: employee?.email || "",
    role: employee?.role || "",
    mobile: employee?.phoneNumber || "",
    profilePic: employee?.profileImageId || null,
  });
  const [editedData, setEditedData] = useState({ ...profileData });
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (employee) {
      fetchAttendance();
      const updatedData = {
        empId: employee.employeeId || "EMP001",
        agency: employee.agencyId || "Agency",
        name: employee.name || "User",
        email: employee.email || "",
        role: employee.role || "",
        mobile: employee.phoneNumber || "",
        profilePic: employee.profileImageId || null,
      };
      setProfileData(updatedData);
      setEditedData(updatedData);
    }
  }, [employee]);

  // ✅ Fetch attendance for today
  const fetchAttendance = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/attendance/${employee.employeeId}`
      );
      const data = res.data;
      const todaySessions = data.attendanceMap?.[todayKey] || [];
      setSessions(todaySessions);

      if (todaySessions.length > 0) {
        const lastSession = todaySessions[todaySessions.length - 1];
        if (lastSession && !lastSession.outTime) {
          setButtonLabel("Checkout");
        } else {
          setButtonLabel("Checkin");
        }
      } else {
        setButtonLabel("Checkin");
      }
    } catch (err) {
      console.error("Error fetching attendance", err);
    }
  };

  // ✅ Handle checkin
  const handleCheckin = () => {
    if (!employee) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const latitude = pos.coords.latitude;
      const longitude = pos.coords.longitude;

      try {
        const validateRes = await axios.post("http://localhost:8080/gps/test", {
          latitude,
          longitude,
        });

        if (validateRes.data === "Success") {
          const currentTime = new Date();
          const localISOTime = new Date(
            currentTime.getTime() - currentTime.getTimezoneOffset() * 60000
          )
            .toISOString()
            .split(".")[0];

          await axios.post("http://localhost:8080/attendance/addintime", null, {
            params: {
              employeeId: employee.employeeId,
              agencyId: employee.agencyId,
              inTime: localISOTime,
            },
          });

          alert("Check-in successful!");
          toggleRefresh();
          fetchAttendance();
        } else {
          alert("You are outside the allowed perimeter. Cannot check-in.");
        }
      } catch (error) {
        console.error("Check-in error", error);
      }
    });
  };

  // ✅ Handle checkout
  const handleCheckout = async () => {
    if (!employee) return;
    const confirmCheckout = window.confirm("Are you sure you want to checkout?");
    if (!confirmCheckout) return;

    const currentTime = new Date();
    const localISOTime = new Date(
      currentTime.getTime() - currentTime.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split(".")[0];

    try {
      await axios.post("http://localhost:8080/attendance/addouttime", null, {
        params: {
          employeeId: employee.employeeId,
          outTime: localISOTime,
        },
      });

      alert("Checkout successful!");
      toggleRefresh();
      fetchAttendance();
    } catch (error) {
      console.error("Checkout error", error);
    }
  };
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedData({ ...editedData, profilePic: file }); // store file
      const reader = new FileReader();
      reader.onload = () => setPreviewImage(reader.result); // preview only
      reader.readAsDataURL(file);
    }
  };
  const handleSave = async () => {
    try {
      let imageId = profileData.profilePic;

      // ✅ If new image is uploaded
      if (editedData.profilePic instanceof File) {
        const formData = new FormData();
        formData.append("file", editedData.profilePic);

        const uploadResponse = await axios.post(
          "http://localhost:8080/image/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        imageId = uploadResponse.data; // MongoDB GridFS ObjectId
      }

      const updatedEmployee = {
        ...employee,
        name: editedData.name,
        phoneNumber: editedData.mobile,
        profileImageId: imageId,
      };

      await axios.put(
        "http://localhost:8080/employee/updateemployee",
        updatedEmployee
      );

      setProfileData({ ...updatedEmployee });
      setEmployee(updatedEmployee);
      setIsEditing(false);
      setPreviewImage(null);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };


 const handleRemoveProfile = async () => {
  try {
    // Update backend: set profileImageId to null
    const updatedEmployee = {
      ...employee,
      profileImageId: null,
    };

    await axios.put(
      "http://localhost:8080/employee/updateemployee",
      updatedEmployee
    );

    // Update frontend state
    setProfileData({ ...profileData, profilePic: null });
    setEditedData({ ...editedData, profilePic: null });
    setPreviewImage(null);

    // Update global context
    setEmployee(updatedEmployee);
  } catch (error) {
    console.error("Error removing profile:", error);
  }
};

  const handleLogout = () => {
    logout();
    navigate("/user-login");
  };

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <Link to="/user/dashboard" className={styles.navbarLink}>
            <FaHome className={styles.icon} /> Home
          </Link>

          <Link to="/user/claim-request" className={styles.navbarLink}>
            <FaClipboardList className={styles.icon} /> Claim Request
          </Link>
        </div>

        <div className={styles.navbarRight}>
          {/* ✅ New Checkin/Checkout Button */}
          {buttonLabel === "Checkin" ? (
  <button
    className={styles.checkinButton}
    onClick={handleCheckin}
  >
    Checkin
  </button>
) : (
  <button
    className={styles.checkoutButton}
    onClick={handleCheckout}
  >
    Checkout
  </button>
)}


          <button onClick={handleLogout} className={styles.logoutButton}>
            <FaSignOutAlt /> Logout
          </button>
          <span className={styles.profileName}>{profileData.name}</span>
          <div
            className={styles.profileContainer}
            onClick={() => setShowProfile(true)}
          >
            {profileData.profilePic ? (
              <img
                src={`http://localhost:8080/image/${profileData.profilePic}`}
                alt="Profile"
                className={styles.profileIconImg}
              />
            ) : (
              <FaUserCircle className={styles.profileIcon} />
            )}
          </div>
        </div>
      </nav>

      {/* Profile modal stays same */}
      {showProfile && (
        <div className={styles.profileModalOverlay}>
          <div
            className={`${styles.profileModal} ${
              isEditing ? styles.editMode : ""
            }`}
          >
            <div className={styles.modalHeader}>
              <h3>Profile</h3>
              <FaTimes
                className={styles.closeIcon}
                onClick={() => {
                  setShowProfile(false);
                  setIsEditing(false);
                  setPreviewImage(null);
                }}
              />
            </div>

            <div className={styles.profileCenter}>
              <div
                className={styles.profileWrapper}
                onClick={() => isEditing && fileInputRef.current.click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className={styles.profilePicLarge}
                  />
                ) : profileData.profilePic ? (
                  <img
                    src={`http://localhost:8080/image/${profileData.profilePic}`}
                    alt="Profile"
                    className={styles.profilePicLarge}
                  />
                ) : (
                  <FaUserCircle className={styles.profilePicLarge} />
                )}
                {isEditing && <FaPlus className={styles.addIconLarge} />}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className={styles.profileFileInput}
                  onChange={handleProfileUpload}
                  style={{ display: "none" }}
                />
              </div>
              <h2 className={styles.centerName}>{profileData.name}</h2>
              {isEditing &&
                (previewImage || profileData.profilePic) && (
                  <button
                    className={styles.removeBtn}
                    onClick={handleRemoveProfile}
                  >
                    Remove Profile
                  </button>
                )}
            </div>

            {!isEditing ? (
              <div className={styles.profileInfo}>
                <div className={styles.infoRow}>
                  <label>Employee ID:</label>
                  <span>{profileData.empId}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Agency Name:</label>
                  <span>{profileData.agency}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Role:</label>
                  <span>{profileData.role}</span>
                </div>
                <div className={styles.infoRow}>
                  <label>Mobile:</label>
                  <span>{profileData.mobile}</span>
                </div>
                <button
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  <FaEdit /> Edit
                </button>
              </div>
            ) : (
              <div className={styles.profileEdit}>
                <div className={styles.infoRow}>
                  <label>Employee ID:</label>
                  <input type="text" value={editedData.empId} disabled />
                </div>
                <div className={styles.infoRow}>
                  <label>Agency Name:</label>
                  <input type="text" value={editedData.agency} disabled />
                </div>
                <div className={styles.infoRow}>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={editedData.name}
                    onChange={(e) =>
                      setEditedData({ ...editedData, name: e.target.value })
                    }
                  />
                </div>
                <div className={styles.infoRow}>
                  <label>Role:</label>
                  <input type="text" value={editedData.role} disabled />
                </div>
                <div className={styles.infoRow}>
                  <label>Mobile:</label>
                  <input
                    type="tel"
                    value={editedData.mobile}
                    maxLength={10} 
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        mobile: e.target.value,
                      })
                    }
                  />
                </div>
                <div className={styles.modalActions}>
                  <button className={styles.saveBtn} onClick={handleSave}>
                    Save
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setIsEditing(false);
                      setPreviewImage(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UserNavbar;


// import React, { useState, useRef, useContext, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   FaHome,
//   FaClipboardList,
//   FaUserCheck,
//   FaPlusCircle,
//   FaUserCircle,
//   FaSignOutAlt,
//   FaEdit,
//   FaTimes,
//   FaPlus,
// } from "react-icons/fa";
// import styles from "./UserNavbar.module.css";
// import { EmployeeContext } from "../../Context/EmployeeContext";

// const UserNavbar = () => {
//   const navigate = useNavigate();
//   const { employee, setEmployee, logout } = useContext(EmployeeContext);

//   const [showProfile, setShowProfile] = useState(false);
//   const [isEditing, setIsEditing] = useState(false);

//   const [profileData, setProfileData] = useState({
//     empId: employee?.employeeId || "EMP001",
//     agency: employee?.agencyId || "Agency",
//     name: employee?.name || "User",
//     email: employee?.email || "",
//     role: employee?.role || "",
//     mobile: employee?.phoneNumber || "",
//     profilePic: employee?.profileImageId || null,
//   });

//   const [editedData, setEditedData] = useState({ ...profileData });
//   const fileInputRef = useRef(null);
//   const [previewImage, setPreviewImage] = useState(null); // ✅ for preview

//   useEffect(() => {
//         if (employee) {
//       fetchAttendance();
//       const updatedData = {
//         empId: employee.employeeId || "EMP001",
//         agency: employee.agencyId || "Agency",
//         name: employee.name || "User",
//         email: employee.email || "",
//         role: employee.role || "",
//         mobile: employee.phoneNumber || "",
//         profilePic: employee.profileImageId || null,
//       };
//       setProfileData(updatedData);
//       setEditedData(updatedData);
//     }
//   }, [employee]);

//   const handleProfileUpload = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setEditedData({ ...editedData, profilePic: file }); // store file
//       const reader = new FileReader();
//       reader.onload = () => setPreviewImage(reader.result); // preview only
//       reader.readAsDataURL(file);
//     }
//   };

//  const handleRemoveProfile = async () => {
//   try {
//     // Update backend: set profileImageId to null
//     const updatedEmployee = {
//       ...employee,
//       profileImageId: null,
//     };

//     await axios.put(
//       "http://localhost:8080/employee/updateemployee",
//       updatedEmployee
//     );

//     // Update frontend state
//     setProfileData({ ...profileData, profilePic: null });
//     setEditedData({ ...editedData, profilePic: null });
//     setPreviewImage(null);

//     // Update global context
//     setEmployee(updatedEmployee);
//   } catch (error) {
//     console.error("Error removing profile:", error);
//   }
// };

// const handleCheckout = async () => {
//     if (!employee) return;
//     const confirmCheckout = window.confirm("Are you sure you want to checkout?");
//     if (!confirmCheckout) return;

//     const currentTime = new Date();
//     const localISOTime = new Date(
//       currentTime.getTime() - currentTime.getTimezoneOffset() * 60000
//     )
//       .toISOString()
//       .split(".")[0];

//     try {
//       await axios.post("http://localhost:8080/attendance/addouttime", null, {
//         params: {
//           employeeId: employee.employeeId,
//           outTime: localISOTime,
//         },
//       });

//       alert("Checkout successful!");
//       fetchAttendance();
//     } catch (error) {
//       console.error("Checkout error", error);
//     }
//   };


// const handleCheckin = () => {
//     if (!employee) return;

//     navigator.geolocation.getCurrentPosition(async (pos) => {
//       const latitude = pos.coords.latitude;
//       const longitude = pos.coords.longitude;

//       try {
//         const validateRes = await axios.post("http://localhost:8080/gps/test", {
//           latitude,
//           longitude,
//         });

//         if (validateRes.data === "Success") {
//           const currentTime = new Date();
//           const localISOTime = new Date(
//             currentTime.getTime() - currentTime.getTimezoneOffset() * 60000
//           )
//             .toISOString()
//             .split(".")[0];

//           await axios.post("http://localhost:8080/attendance/addintime", null, {
//             params: {
//               employeeId: employee.employeeId,
//               agencyId: employee.agencyId,
//               inTime: localISOTime,
//             },
//           });

//           alert("Check-in successful!");
//           fetchAttendance();
//         } else {
//           alert("You are outside the allowed perimeter. Cannot check-in.");
//         }
//       } catch (error) {
//         console.error("Check-in error", error);
//       }
//     });
//   };

  // const handleSave = async () => {
  //   try {
  //     let imageId = profileData.profilePic;

  //     // ✅ If new image is uploaded
  //     if (editedData.profilePic instanceof File) {
  //       const formData = new FormData();
  //       formData.append("file", editedData.profilePic);

  //       const uploadResponse = await axios.post(
  //         "http://localhost:8080/image/upload",
  //         formData,
  //         {
  //           headers: { "Content-Type": "multipart/form-data" },
  //         }
  //       );
  //       imageId = uploadResponse.data; // MongoDB GridFS ObjectId
  //     }

  //     const updatedEmployee = {
  //       ...employee,
  //       name: editedData.name,
  //       phoneNumber: editedData.mobile,
  //       profileImageId: imageId,
  //     };

  //     await axios.put(
  //       "http://localhost:8080/employee/updateemployee",
  //       updatedEmployee
  //     );

  //     setProfileData({ ...updatedEmployee });
  //     setEmployee(updatedEmployee);
  //     setIsEditing(false);
  //     setPreviewImage(null);
  //   } catch (error) {
  //     console.error("Error saving profile:", error);
  //   }
  // };

//   const handleLogout = () => {
//     logout();
//     navigate("/user-login");
//   };

//   return (
//     <>
//       <nav className={styles.navbar}>
//         <div className={styles.navbarLeft}>
//           <Link to="/user/dashboard" className={styles.navbarLink}>
//             <FaHome className={styles.icon} /> Home
//           </Link>
//           <Link to="/user/post-attendance" className={styles.navbarLink}>
//             <FaPlusCircle className={styles.icon} /> Post Attendance
//           </Link>
//           <Link to="/user/claim-request" className={styles.navbarLink}>
//             <FaClipboardList className={styles.icon} /> Claim Request
//           </Link>
//         </div>

//         <div className={styles.navbarRight}>
//            {buttonLabel === "Checkin" ? (
//             <button className={styles.logoutButton} onClick={handleCheckin}>
//               Checkin
//             </button>
//           ) : (
//             <button className={styles.logoutButton} onClick={handleCheckout}>
//               Checkout
//             </button>
//           )}
//           <button onClick={handleLogout} className={styles.logoutButton}>
//             <FaSignOutAlt /> Logout
//           </button>
//           <span className={styles.profileName}>{profileData.name}</span>
//           <div
//             className={styles.profileContainer}
//             onClick={() => setShowProfile(true)}
//           >
//             {profileData.profilePic ? (
//               <img
//                 src={`http://localhost:8080/image/${profileData.profilePic}`}
//                 alt="Profile"
//                 className={styles.profileIconImg}
//               />
//             ) : (
//               <FaUserCircle className={styles.profileIcon} />
//             )}
//           </div>
//         </div>
//       </nav>

      // {showProfile && (
      //   <div className={styles.profileModalOverlay}>
      //     <div
      //       className={`${styles.profileModal} ${
      //         isEditing ? styles.editMode : ""
      //       }`}
      //     >
      //       <div className={styles.modalHeader}>
      //         <h3>Profile</h3>
      //         <FaTimes
      //           className={styles.closeIcon}
      //           onClick={() => {
      //             setShowProfile(false);
      //             setIsEditing(false);
      //             setPreviewImage(null);
      //           }}
      //         />
      //       </div>

      //       <div className={styles.profileCenter}>
      //         <div
      //           className={styles.profileWrapper}
      //           onClick={() => isEditing && fileInputRef.current.click()}
      //         >
      //           {previewImage ? (
      //             <img
      //               src={previewImage}
      //               alt="Preview"
      //               className={styles.profilePicLarge}
      //             />
      //           ) : profileData.profilePic ? (
      //             <img
      //               src={`http://localhost:8080/image/${profileData.profilePic}`}
      //               alt="Profile"
      //               className={styles.profilePicLarge}
      //             />
      //           ) : (
      //             <FaUserCircle className={styles.profilePicLarge} />
      //           )}
      //           {isEditing && <FaPlus className={styles.addIconLarge} />}
      //           <input
      //             type="file"
      //             accept="image/*"
      //             ref={fileInputRef}
      //             className={styles.profileFileInput}
      //             onChange={handleProfileUpload}
      //             style={{ display: "none" }}
      //           />
      //         </div>
      //         <h2 className={styles.centerName}>{profileData.name}</h2>
      //         {isEditing &&
      //           (previewImage || profileData.profilePic) && (
      //             <button
      //               className={styles.removeBtn}
      //               onClick={handleRemoveProfile}
      //             >
      //               Remove Profile
      //             </button>
      //           )}
      //       </div>

      //       {!isEditing ? (
      //         <div className={styles.profileInfo}>
      //           <div className={styles.infoRow}>
      //             <label>Employee ID:</label>
      //             <span>{profileData.empId}</span>
      //           </div>
      //           <div className={styles.infoRow}>
      //             <label>Agency Name:</label>
      //             <span>{profileData.agency}</span>
      //           </div>
      //           <div className={styles.infoRow}>
      //             <label>Role:</label>
      //             <span>{profileData.role}</span>
      //           </div>
      //           <div className={styles.infoRow}>
      //             <label>Mobile:</label>
      //             <span>{profileData.mobile}</span>
      //           </div>
      //           <button
      //             className={styles.editBtn}
      //             onClick={() => setIsEditing(true)}
      //           >
      //             <FaEdit /> Edit
      //           </button>
      //         </div>
      //       ) : (
      //         <div className={styles.profileEdit}>
      //           <div className={styles.infoRow}>
      //             <label>Employee ID:</label>
      //             <input type="text" value={editedData.empId} disabled />
      //           </div>
      //           <div className={styles.infoRow}>
      //             <label>Agency Name:</label>
      //             <input type="text" value={editedData.agency} disabled />
      //           </div>
      //           <div className={styles.infoRow}>
      //             <label>Name:</label>
      //             <input
      //               type="text"
      //               value={editedData.name}
      //               onChange={(e) =>
      //                 setEditedData({ ...editedData, name: e.target.value })
      //               }
      //             />
      //           </div>
      //           <div className={styles.infoRow}>
      //             <label>Role:</label>
      //             <input type="text" value={editedData.role} disabled />
      //           </div>
      //           <div className={styles.infoRow}>
      //             <label>Mobile:</label>
      //             <input
      //               type="tel"
      //               value={editedData.mobile}
      //               maxLength={10} 
      //               onChange={(e) =>
      //                 setEditedData({
      //                   ...editedData,
      //                   mobile: e.target.value,
      //                 })
      //               }
      //             />
      //           </div>
      //           <div className={styles.modalActions}>
      //             <button className={styles.saveBtn} onClick={handleSave}>
      //               Save
      //             </button>
      //             <button
      //               className={styles.cancelBtn}
      //               onClick={() => {
      //                 setIsEditing(false);
      //                 setPreviewImage(null);
      //               }}
      //             >
      //               Cancel
      //             </button>
      //           </div>
      //         </div>
      //       )}
      //     </div>
      //   </div>
      // )}
//     </>
//   );
// };

// export default UserNavbar;
