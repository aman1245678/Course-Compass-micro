import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { verifyToken } from "./store/slices/authSlice";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import Signup from "./components/Signup";
import CourseList from "./components/CourseList";
import Recommendations from "./components/Recommendations";
import UploadCourses from "./components/UploadCourses";

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(verifyToken());
    }
  }, [dispatch]);

  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/courses" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/recommendations" element={<Recommendations />} />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadCourses />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
