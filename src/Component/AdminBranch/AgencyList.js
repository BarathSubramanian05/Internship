import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Display.module.css";

const AgencyList = () => {
  const [agencies, setAgencies] = useState([]);
  const [search, setSearch] = useState("");
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingAgency, setEditingAgency] = useState(null);
  const [fieldsToUpdate, setFieldsToUpdate] = useState({});
  const [formData, setFormData] = useState({});

  const [editShowDropdown, setEditShowDropdown] = useState(false);
  const [editSelectedTypes, setEditSelectedTypes] = useState([]);
  const [editCustomType, setEditCustomType] = useState("");
  const agencyOptions = ["Catering", "Sanitary", "Transport", "Security", "Maintenance", "Custom"];

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const res = await axios.get("http://localhost:8080/agency/");
        const activeAgencies = res.data.filter(
          (agency) => agency.status === true || agency.status === "true"
        );
        setAgencies(activeAgencies);
      } catch (err) {
        console.error("Error fetching agencies:", err);
      }
    };
    fetchAgencies();
  }, []);

  // === Delete Mode Selection ===
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) {
      alert("Select at least one agency to delete.");
      return;
    }
    if (!window.confirm(`Delete ${selectedIds.length} agencies?`)) return;

    try {
      await axios.delete("http://localhost:8080/agency/deleteagencies", {
        data: selectedIds,
        headers: { "Content-Type": "application/json" },
      });
      setAgencies((prev) => prev.filter((a) => !selectedIds.includes(a.agencyId)));
      setSelectedIds([]);
      setDeleteMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to delete agencies");
    }
  };

  // === Open Edit Popup ===
  const handleEditClick = (agency, e) => {
    e.stopPropagation();
    setEditingAgency(agency);

    setFieldsToUpdate({
      agencyName: false,
      agencyType: false,
      contactPersonName: false,
      phoneNumber: false,
      email: false,
      address: false,
      pinCode: false,
    });

    setFormData({
      agencyName: agency.agencyName || "",
      contactPersonName: agency.contactPersonName || "",
      phoneNumber: agency.phoneNumber || "",
      email: agency.email || "",
      address: agency.address || "",
      pinCode: agency.pinCode || "",
    });

    // Initialize edit agency type
    const types = agency.agencyType ? agency.agencyType.split(", ") : [];
    const knownTypes = types.filter((t) => agencyOptions.includes(t));
    const customTypes = types.filter((t) => !agencyOptions.includes(t));
    setEditSelectedTypes(customTypes.length ? [...knownTypes, "Custom"] : knownTypes);
    setEditCustomType(customTypes.join(", "));
  };

  // === Input Change ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      setFieldsToUpdate((prev) => ({ ...prev, [name]: true }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFieldsToUpdate((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleEditTypeToggle = (type) => {
    if (editSelectedTypes.includes(type)) {
      setEditSelectedTypes(editSelectedTypes.filter((t) => t !== type));
      if (type === "Custom") setEditCustomType("");
    } else {
      setEditSelectedTypes([...editSelectedTypes, type]);
    }
  };

  // === Save Update ===
  const handleUpdate = async () => {
    if (!editingAgency) return;

    const updatedAgency = { ...editingAgency };

    Object.keys(fieldsToUpdate).forEach((field) => {
      if (fieldsToUpdate[field]) {
        updatedAgency[field] = formData[field];
      }
    });

    // Merge agency type selections
    const finalTypes = editSelectedTypes.includes("Custom")
      ? [...editSelectedTypes.filter((t) => t !== "Custom"), editCustomType]
      : editSelectedTypes;
    updatedAgency.agencyType = finalTypes.join(", ");

    try {
      await axios.put(`http://localhost:8080/agency/updateagency`, updatedAgency);
      setAgencies((prev) =>
        prev.map((a) => (a.agencyId === editingAgency.agencyId ? updatedAgency : a))
      );
      alert("Agency updated successfully!");
      setEditingAgency(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update agency");
    }
  };

  // === Filter ===
  // === Filter ===
const filtered = agencies.filter(
  (a) =>
    a.agencyName.toLowerCase().includes(search.toLowerCase()) ||
    String(a.agencyId).includes(search) ||
    (a.agencyType || "").toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className={styles.displayContainer}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate("/admin-login/card")}>← Back</button>
        <h2>Agencies</h2>
        <button className={styles.addEmployeeBtn} onClick={() => navigate("/admin-login/card/add-agency")}>+ Add Agency</button>

        {!deleteMode ? (
          <button className={styles.addEmployeeBtn} onClick={() => setDeleteMode(true)} style={{ marginLeft: "15px", backgroundColor: "#dc3545" }}>
            Delete Agency
          </button>
        ) : (
          <>
            <button className={styles.addEmployeeBtn} onClick={handleDeleteSelected} style={{ marginLeft: "15px", backgroundColor: "#dc3545" }}>Confirm Delete</button>
            <button className={styles.backBtn} onClick={() => { setDeleteMode(false); setSelectedIds([]); }} style={{ marginLeft: "10px" }}>Cancel</button>
          </>
        )}
      </div>

      {/* Search */}
      <div className={styles.filterBox}>
        <input type="text" placeholder="Search by ID or Name..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <table className={styles.employeeTable}>
        <thead>
          <tr>
            {deleteMode && <th>Select</th>}
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Contact</th>
            <th>Phone</th>
            {!deleteMode && <th>Actions</th>}
          </tr>
        </thead>
     <tbody>
  {filtered.map((agency) => (
    <tr
      key={agency.agencyId}
      className={styles.clickableRow}
      onClick={() => {
        if (deleteMode) {
          handleSelect(agency.agencyId); // Toggle checkbox when delete mode is on
        } else {
          navigate(`/admin-login/display/${agency.agencyId}`); // Navigate normally
        }
      }}
    >
      {deleteMode && (
        <td>
          <input
            type="checkbox"
            checked={selectedIds.includes(agency.agencyId)}
            onClick={(e) => e.stopPropagation()} // Prevent double toggle
            onChange={() => handleSelect(agency.agencyId)}
          />
        </td>
      )}
      <td>{agency.agencyId}</td>
      <td>{agency.agencyName}</td>
      <td>{agency.agencyType}</td>
      <td>{agency.contactPersonName}</td>
      <td>{agency.phoneNumber}</td>
      {!deleteMode && (
        <td>
          <span
            className={styles.editIcon}
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              handleEditClick(agency, e);
            }}
          >
            ✏️
          </span>
        </td>
      )}
    </tr>
  ))}
</tbody>


      </table>

      {/* Edit Popup */}
      {editingAgency && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <h3>Edit Agency</h3>

            <div className="inputGrid">
              {["agencyName", "contactPersonName", "phoneNumber", "email", "address", "pinCode"].map((field) => (
                <div key={field} className={styles.inputGroup}>
                  <label>{field}</label>
                  <input type="text" name={field} value={formData[field]} onChange={handleChange} />
                </div>
              ))}

              {/* Agency Type Multi-Select */}
              {/* Agency Type Multi-Select */}
<div className={styles.inputGroup}>
  <label>Agency Type</label>
  <div className="custom-dropdown">
    <div
      className="dropdown-header"
      onClick={() => setEditShowDropdown(!editShowDropdown)}
    >
      {editSelectedTypes.length > 0
        ? editSelectedTypes
            .map((t) => (t === "Custom" ? editCustomType || "Custom" : t))
            .join(", ")
        : "Select agency type(s)"}
      <span className="arrow">{editShowDropdown ? "▲" : "▼"}</span>
    </div>

    {editShowDropdown && (
      <div className="dropdown-list">
        {agencyOptions.map((type) => (
          <label
            key={type}
            className="dropdown-item d-flex align-items-center gap-2"
            style={{ cursor: "pointer" }}
          >
            <input
              type="checkbox"
              className="form-check-input"
              checked={editSelectedTypes.includes(type)}
              onChange={() => {
                if (editSelectedTypes.includes(type)) {
                  setEditSelectedTypes(editSelectedTypes.filter((t) => t !== type));
                  if (type === "Custom") setEditCustomType("");
                } else {
                  setEditSelectedTypes([...editSelectedTypes, type]);
                  // If Custom selected, close dropdown immediately
                  if (type === "Custom") setEditShowDropdown(false);
                }
              }}
            />
            <span>{type}</span>
          </label>
        ))}

        {!editSelectedTypes.includes("Custom") && (
          <div className="dropdown-actions">
            <button
              type="button"
              className="btn btn-sm btn-success mt-2 w-100"
              onClick={() => setEditShowDropdown(false)}
            >
              Done
            </button>
          </div>
        )}
      </div>
    )}
  </div>

  {/* Custom input */}
  {editSelectedTypes.includes("Custom") && (
    <input
      type="text"
      className="form-control mt-2"
      value={editCustomType}
      onChange={(e) => setEditCustomType(e.target.value)}
      placeholder="Enter custom agency type"
    />
  )}
</div>

            </div>

            <div className={styles.popupActions}>
              <button onClick={handleUpdate}>Save</button>
              <button onClick={() => setEditingAgency(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyList;
