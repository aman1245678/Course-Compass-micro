const express = require("express");
const geminiService = require("../services/geminiService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { topics, skillLevel, interests, learningGoals } = req.body;

    const userPreferences = {
      topics: Array.isArray(topics) ? topics : [topics].filter(Boolean),
      skillLevel: skillLevel || "beginner",
      interests: Array.isArray(interests)
        ? interests
        : [interests].filter(Boolean),
      learningGoals: learningGoals || "General skill development",
    };

    const recommendations = await geminiService.generateRecommendations(
      userPreferences
    );

    res.json({
      success: true,
      userPreferences,
      ...recommendations,
      note: process.env.GEMINI_API_KEY
        ? "Using Gemini AI"
        : "Using mock data (set GEMINI_API_KEY for AI recommendations)",
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
      error: error.message,
    });
  }
});

router.get("/categories", (req, res) => {
  const categories = [
    "Programming",
    "Web Development",
    "Data Science",
    "Machine Learning",
    "Business",
    "Marketing",
    "Design",
    "Personal Development",
  ];

  const skillLevels = ["Beginner", "Intermediate", "Advanced", "All Levels"];

  res.json({
    categories,
    skillLevels,
  });
});

module.exports = router;
