const axios = require("axios");

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
  }

  async generateRecommendations(userPreferences) {
    if (!this.apiKey || this.apiKey === "your_gemini_api_key_here") {
      return this.getMockRecommendations(userPreferences);
    }

    try {
      const prompt = this.buildPrompt(userPreferences);

      const response = await axios.post(
        `${this.baseURL}?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return this.parseAIResponse(response.data);
    } catch (error) {
      console.error("Gemini API error:", error);
      return this.getMockRecommendations(userPreferences);
    }
  }

  buildPrompt(userPreferences) {
    const { topics, skillLevel, interests, learningGoals } = userPreferences;

    return `
      As an AI learning advisor, recommend 5-7 online courses based on the following preferences:
      
      Topics of interest: ${topics?.join(", ") || "Not specified"}
      Skill level: ${skillLevel || "Beginner to Advanced"}
      Additional interests: ${interests?.join(", ") || "Not specified"}
      Learning goals: ${learningGoals || "Not specified"}
      
      Please provide recommendations in the following JSON format:
      {
        "recommendations": [
          {
            "title": "Course Title",
            "description": "Brief description",
            "category": "Primary category",
            "skillLevel": "Beginner/Intermediate/Advanced",
            "reason": "Why this course matches the user's preferences",
            "estimatedDuration": "X hours",
            "keyTopics": ["topic1", "topic2", "topic3"]
          }
        ]
      }
      
      Make the recommendations personalized and practical. Focus on courses that would genuinely help the user achieve their learning goals.
    `;
  }

  parseAIResponse(aiResponse) {
    try {
      const text = aiResponse.candidates[0].content.parts[0].text;
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("No JSON found in response");
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return this.getMockRecommendations();
    }
  }

  getMockRecommendations(userPreferences = {}) {
    const { topics = ["programming"], skillLevel = "beginner" } =
      userPreferences;

    const mockCourses = {
      programming: [
        {
          title: "Complete Web Development Bootcamp",
          description:
            "Learn HTML, CSS, JavaScript, React, Node.js and more to become a full-stack developer",
          category: "Web Development",
          skillLevel: "Beginner",
          reason:
            "Perfect for starting your programming journey with modern web technologies",
          estimatedDuration: "60 hours",
          keyTopics: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
        },
        {
          title: "Advanced JavaScript Patterns",
          description:
            "Master advanced JavaScript concepts and design patterns for professional development",
          category: "Programming",
          skillLevel: "Advanced",
          reason:
            "Builds on fundamental knowledge with industry best practices",
          estimatedDuration: "25 hours",
          keyTopics: [
            "Design Patterns",
            "Async Programming",
            "Performance",
            "ES6+",
          ],
        },
      ],
      dataScience: [
        {
          title: "Machine Learning Fundamentals",
          description:
            "Introduction to ML algorithms, data preprocessing, and model evaluation",
          category: "Data Science",
          skillLevel: "Intermediate",
          reason: "Comprehensive coverage of essential ML concepts",
          estimatedDuration: "45 hours",
          keyTopics: ["Python", "Scikit-learn", "Regression", "Classification"],
        },
      ],
      business: [
        {
          title: "Digital Marketing Strategy",
          description:
            "Learn to create effective digital marketing campaigns across multiple channels",
          category: "Marketing",
          skillLevel: "Beginner",
          reason: "Practical skills for modern marketing needs",
          estimatedDuration: "30 hours",
          keyTopics: ["SEO", "Social Media", "Content Marketing", "Analytics"],
        },
      ],
    };

    let recommendations = [];
    topics.forEach((topic) => {
      if (mockCourses[topic]) {
        recommendations = recommendations.concat(mockCourses[topic]);
      }
    });

    if (recommendations.length === 0) {
      recommendations = [
        {
          title: "Introduction to Programming",
          description: "Learn the fundamentals of programming with Python",
          category: "Programming",
          skillLevel: "Beginner",
          reason: "Great starting point for any technical learning path",
          estimatedDuration: "40 hours",
          keyTopics: ["Python", "Algorithms", "Problem Solving"],
        },
        {
          title: "Project Management Fundamentals",
          description: "Essential skills for managing projects effectively",
          category: "Business",
          skillLevel: "Beginner",
          reason: "Valuable skills for any professional role",
          estimatedDuration: "20 hours",
          keyTopics: ["Planning", "Execution", "Team Management"],
        },
      ];
    }

    if (skillLevel && skillLevel !== "all") {
      recommendations = recommendations.filter(
        (course) => course.skillLevel.toLowerCase() === skillLevel.toLowerCase()
      );
    }

    return { recommendations: recommendations.slice(0, 5) };
  }
}

module.exports = new GeminiService();
