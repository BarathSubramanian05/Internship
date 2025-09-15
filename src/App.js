// App.js
import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { EmployeeContext } from "./Context/EmployeeContext";  

import Home from "./Component/Logins/Home";
import AdminLogin from "./Component/Logins/AdminLogin";
import AdminCardView from "./Component/AdminBranch/AdminCardView"; 
import Display from "./Component/AdminBranch/Display"; 
import Login from "./Component/Logins/Login";
import AddAgency from "./Component/AdminBranch/AddAgency"; 
import AddEmployee from "./Component/AdminBranch/AddEmployee"; 
import Detail from "./Component/AdminBranch/Detail";
import AttendancePage from './Component/UserBranch/AttendancePage';
import UserLayout from './Component/UserBranch/UserLayout'; 
import ClaimRequest from './Component/UserBranch/ClaimRequest';
import UserDashboard from './Component/UserBranch/UserDashboard';
import UserDetail from "./Component/UserBranch/UserDetail";
import ClaimRequests from './Component/AdminBranch/ClaimRequests'; 
import AgencyList from "./Component/AdminBranch/AgencyList";

function App() {
  const { employee } = useContext(EmployeeContext);  

  return (      
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-login/card" element={<AdminCardView />} />
        <Route path="/admin-login/display/:agencyId" element={<Display />} />
        <Route path="/admin-login/card/add-agency" element={<AddAgency />} />
        <Route path="/admin-login/card/claim-requests" element={<ClaimRequests />} />
        <Route path="/admin-login/card/add-employee/:aid" element={<AddEmployee />} />
        <Route path="/admin-login/card/display/employee/:id" element={<Detail />} />
        <Route path="/user-login" element={<Login />} />
        <Route path="/admin-login/agencylist" element={<AgencyList/>} />

        {/* Protected user routes */}
        <Route
          path="/user/*"
          element={
            employee ? <UserLayout /> : <Navigate to="/user-login" replace />
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="claim-request" element={<ClaimRequest />} />
          <Route path="view-attendance" element={<UserDetail />} />
          <Route path="post-attendance" element={<AttendancePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
