import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourses,
  searchCourses,
  clearSearchResults,
} from "../store/slices/coursesSlice";
import { cache } from "../services/api";

const CourseList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchInstructor, setSearchInstructor] = useState("");

  const dispatch = useDispatch();
  const { courses, searchResults, loading, error } = useSelector(
    (state) => state.courses
  );

  useEffect(() => {
    const cachedCourses = cache.get("courses");
    if (cachedCourses) {
      console.log("Using cached courses");
    } else {
      dispatch(fetchCourses());
    }
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = {};

    if (searchQuery) searchParams.q = searchQuery;
    if (searchCategory) searchParams.category = searchCategory;
    if (searchInstructor) searchParams.instructor = searchInstructor;

    dispatch(searchCourses(searchParams));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchCategory("");
    setSearchInstructor("");
    dispatch(clearSearchResults());
  };

  const displayCourses = searchResults.length > 0 ? searchResults : courses;

  return (
    <div className="container">
      <h1>Courses</h1>

      {/* Search Form */}
      <div className="card">
        <h3>Search Courses</h3>
        <form onSubmit={handleSearch}>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by category"
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by instructor"
              value={searchInstructor}
              onChange={(e) => setSearchInstructor(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
            <button
              type="button"
              className="btn"
              onClick={clearSearch}
              style={{ backgroundColor: "#95a5a6", color: "white" }}>
              Clear
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error">{error.message || error}</div>}

      {/* Courses Grid */}
      {loading ? (
        <div className="loading">Loading courses...</div>
      ) : (
        <div className="course-grid">
          {displayCourses.map((course) => (
            <div key={course._id || course.course_id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>

              <div className="course-meta">
                <span>
                  <strong>Category:</strong> {course.category}
                </span>
                <span>
                  <strong>Instructor:</strong> {course.instructor}
                </span>
              </div>

              <div className="course-meta">
                <span>
                  <strong>Duration:</strong> {course.duration}h
                </span>
                <span>
                  <strong>Rating:</strong> {course.rating}/5
                </span>
              </div>

              {course.students_enrolled && (
                <div className="course-meta">
                  <span>
                    <strong>Students:</strong> {course.students_enrolled}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {!loading && displayCourses.length === 0 && (
        <div className="card">
          <p>
            No courses found. Try adjusting your search criteria or upload some
            courses.
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseList;
