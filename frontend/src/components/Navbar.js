import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-brand">
          <Link to="/">CourseFinder</Link>
        </div>
        <ul className="navbar-nav">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/courses">Courses</Link>
          </li>
          <li>
            <Link to="/recommendations">AI Recommendations</Link>
          </li>

          {user ? (
            <>
              <li>
                <Link to="/upload">Upload Courses</Link>
              </li>
              <li>
                <span style={{ color: "#ecf0f1", padding: "0.5rem 1rem" }}>
                  Welcome, {user.username}
                </span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-primary">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
