import React, { useState } from "react";
import { useQuery } from "react-query";
import { aiAPI, cache } from "../services/api";

const Recommendations = () => {
  const [preferences, setPreferences] = useState({
    topics: [],
    skillLevel: "",
    interests: [],
    learningGoals: "",
  });

  const [selectedTopic, setSelectedTopic] = useState("");

  const { data: categoriesData } = useQuery(
    "categories",
    () => aiAPI.getCategories().then((res) => res.data),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const {
    data: recommendations,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ["recommendations", preferences],
    () => aiAPI.getRecommendations(preferences).then((res) => res.data),
    {
      enabled: false,
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  const handleAddTopic = () => {
    if (selectedTopic && !preferences.topics.includes(selectedTopic)) {
      setPreferences((prev) => ({
        ...prev,
        topics: [...prev.topics, selectedTopic],
      }));
      setSelectedTopic("");
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setPreferences((prev) => ({
      ...prev,
      topics: prev.topics.filter((topic) => topic !== topicToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    refetch();
  };

  return (
    <div className="container">
      <h1>AI Course Recommendations</h1>

      <div className="card">
        <h3>Tell us about your learning preferences</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Topics of Interest:</label>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                style={{ flex: 1 }}>
                <option value="">Select a topic</option>
                {categoriesData?.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddTopic}>
                Add
              </button>
            </div>

            {preferences.topics.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {preferences.topics.map((topic) => (
                  <span
                    key={topic}
                    style={{
                      background: "#3498db",
                      color: "white",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}>
                    {topic}
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(topic)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "1rem",
                      }}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Skill Level:</label>
            <select
              value={preferences.skillLevel}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  skillLevel: e.target.value,
                }))
              }>
              <option value="">Any Level</option>
              {categoriesData?.skillLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Learning Goals:</label>
            <textarea
              value={preferences.learningGoals}
              onChange={(e) =>
                setPreferences((prev) => ({
                  ...prev,
                  learningGoals: e.target.value,
                }))
              }
              rows="3"
              placeholder="What do you want to achieve with these courses?"
            />
          </div>

          <button
            type="submit"
            className="btn btn-success"
            disabled={isLoading}>
            {isLoading
              ? "Generating Recommendations..."
              : "Get Recommendations"}
          </button>
        </form>
      </div>

      {error && (
        <div className="error">
          Failed to generate recommendations: {error.message}
        </div>
      )}

      {recommendations && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Recommended Courses</h2>
          <p>
            <em>{recommendations.note}</em>
          </p>

          <div className="course-grid">
            {recommendations.recommendations?.map((course, index) => (
              <div key={index} className="course-card">
                <h3>{course.title}</h3>
                <p>{course.description}</p>

                <div className="course-meta">
                  <span>
                    <strong>Category:</strong> {course.category}
                  </span>
                  <span>
                    <strong>Level:</strong> {course.skillLevel}
                  </span>
                </div>

                <div className="course-meta">
                  <span>
                    <strong>Duration:</strong> {course.estimatedDuration}
                  </span>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <strong>Why this course:</strong>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "#666",
                      marginTop: "0.5rem",
                    }}>
                    {course.reason}
                  </p>
                </div>

                {course.keyTopics && (
                  <div style={{ marginTop: "1rem" }}>
                    <strong>Key Topics:</strong>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.25rem",
                        marginTop: "0.5rem",
                      }}>
                      {course.keyTopics.map((topic, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#ecf0f1",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                          }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
