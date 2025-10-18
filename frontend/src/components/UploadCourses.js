import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { uploadCourses, clearUploadStatus } from "../store/slices/coursesSlice";

const UploadCourses = () => {
  const [file, setFile] = useState(null);
  const dispatch = useDispatch();
  const { uploadStatus, error } = useSelector((state) => state.courses);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    dispatch(clearUploadStatus());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      dispatch(uploadCourses(file));
    }
  };

  const sampleCSV = `course_id,title,description,category,instructor,duration,price,rating,students_enrolled
course1,Complete Web Development,Learn full-stack web development with modern technologies,Web Development,John Doe,60,99.99,4.5,1500
course2,Data Science Fundamentals,Introduction to data science and machine learning,Data Science,Jane Smith,45,79.99,4.2,800
course3,React Advanced Patterns,Master advanced React patterns and best practices,Web Development,Mike Johnson,20,49.99,4.7,1200
course4,Python for Beginners,Learn Python programming from scratch,Programming,Sarah Wilson,30,29.99,4.3,2000
course5,Digital Marketing Strategy,Create effective digital marketing campaigns,Marketing,David Brown,25,59.99,4.1,600`;

  const downloadSampleCSV = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "courses_sample.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <h1>Upload Courses</h1>

      <div className="card">
        <h3>Upload CSV File</h3>

        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem",
            background: "#f8f9fa",
            borderRadius: "4px",
          }}>
          <h4>CSV Format Requirements:</h4>
          <ul style={{ marginLeft: "1.5rem", marginBottom: "1rem" }}>
            <li>
              <strong>Required columns:</strong> course_id, title, description,
              category, instructor, duration
            </li>
            <li>
              <strong>Optional columns:</strong> price, rating,
              students_enrolled
            </li>
            <li>First row should be header row</li>
            <li>File should be UTF-8 encoded</li>
            <li>Duration should be in hours (numeric)</li>
            <li>Price and rating should be numeric</li>
          </ul>

          <button
            type="button"
            className="btn btn-primary"
            onClick={downloadSampleCSV}
            style={{ marginTop: "0.5rem" }}>
            Download Sample CSV
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select CSV File:</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success"
            disabled={!file || uploadStatus === "uploading"}>
            {uploadStatus === "uploading" ? "Uploading..." : "Upload Courses"}
          </button>
        </form>

        {uploadStatus === "success" && (
          <div className="success" style={{ marginTop: "1rem" }}>
            Courses uploaded successfully! They will appear in the courses list
            shortly.
          </div>
        )}

        {uploadStatus === "error" && error && (
          <div className="error" style={{ marginTop: "1rem" }}>
            Upload failed: {error.message || error}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCourses;
