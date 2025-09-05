//import {useContext} from "react";
import { Outlet } from "react-router-dom";
//import { useLocation } from "react-router-dom";
import UserNavbar from "./UserNavbar";
//import { EmployeeContext } from "../../Context/EmployeeContext";

const UserLayout = () => {
  //const location = useLocation();
  //const { employee } = useContext(EmployeeContext);
  return (
    <div>
      <UserNavbar/>
      <div style={{ padding: "20px" }}>
        <Outlet /> {/* ✅ This will render the nested routes like Dashboard, Claim Request, etc. */}
      </div>
    </div>
  );
};

export default UserLayout;
