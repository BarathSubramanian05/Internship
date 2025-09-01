import React, { createContext, useState, useEffect } from "react";

export const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const [employee, setEmployee] = useState(() => {
    const savedEmployee = localStorage.getItem("employee");
    return savedEmployee ? JSON.parse(savedEmployee) : null;
  });

  useEffect(() => {
    if (employee) {
      localStorage.setItem("employee", JSON.stringify(employee));
    } else {
      localStorage.removeItem("employee");
    }
  }, [employee]);

  const logout = () => {
    setEmployee(null);
    localStorage.removeItem("employee");
  };

  return (
    <EmployeeContext.Provider value={{ employee, setEmployee, logout }}>
      {children}
    </EmployeeContext.Provider>
  );
};
