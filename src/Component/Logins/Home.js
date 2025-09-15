// Home.js

import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
    return (
        <div className="container vh-100 d-flex flex-column justify-content-center align-items-center">
            <h1 className="mb-5 text-primary text-center">Attendance Management System</h1>
            
            <div className="d-flex gap-4">
                <button
                    className="btn btn-outline-primary btn-lg px-5"
                    onClick={() => window.location.href = "/admin-login"}
                >
                    Login as Admin
                </button>

                <button
                    className="btn btn-outline-success btn-lg px-5"
                    onClick={() => window.location.href = "/user-login"}
                >
                    Login as User
                </button>
            </div>
        </div>
    );
};

export default Home;
