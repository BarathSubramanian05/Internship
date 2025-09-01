
/*import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Component/Logins/Home";
import AdminLogin from "./Component/Logins/AdminLogin";
import AdminCardView from "./Component/AdminBranch/AdminCardView"; 
import Display from "./Component/AdminBranch/Display"; 
import Login from "./Component/Logins/Login";
import AddAgency from "./Component/AdminBranch/AddAgency"; 
import AddEmployee from "./Component/AdminBranch/AddEmployee"; 
import Detail from "./Component/UserBranch/Detail";
import AttendancePage from './Component/UserBranch/AttendancePage';
import UserLayout from './Component/UserBranch/UserLayout'; 
import ClaimRequest from './Component/UserBranch/ClaimRequest';
import UserDashboard from './Component/UserBranch/UserDashboard';
function App() {
    return (
        <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-login/card" element={<AdminCardView />} />
        <Route path="/admin-login/display/:role" element={<Display />} />
        <Route path="/user-login/attendance" element={<AttendancePage />} />
        <Route path="/admin-login/card/display/employee/:id" element={<Detail />} />
        <Route path="/user-login" element={<Login />} />
        <Route path="/user/*" element={<UserLayout />}>
          <Route path="home" element={<Home />} />
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="claim-request" element={<ClaimRequest />} />
          <Route path="view-attendance" element={<AttendancePage />} />  
          <Route path="post-attendance" element={<AttendancePage />} />  
        </Route>
        <Route path="/admin-login/card/add-agency" element={<AddAgency />} />
        <Route path="/admin-login/card/add-employee" element={<AddEmployee />} />
      </Routes>
    </Router>
    );
}

export default App;

*/
// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ClaimRequests from './Component/AdminBranch/ClaimRequests'; // Admin claim requests page
function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-login/card" element={<AdminCardView />} />
        <Route path="/admin-login/display/:role" element={<Display />} />
        <Route path="/admin-login/card/add-agency" element={<AddAgency />} />
        <Route path="/admin-login/card/claim-requests" element={<ClaimRequests />} />
        <Route path="/admin-login/card/add-employee" element={<AddEmployee />} />
        <Route path="/admin-login/card/display/employee/:id" element={<Detail />} />
        <Route path="/user-login" element={<Login />} />

        {/* Protected user routes (with navbar) */}
        <Route path="/user/*" element={<UserLayout />}>
          <Route index element={<UserDashboard  />} /> {/* Default dashboard */}
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="claim-request" element={<ClaimRequest />} />
          <Route path="view-attendance" element={<Detail/>} />
          <Route path="post-attendance" element={<AttendancePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
