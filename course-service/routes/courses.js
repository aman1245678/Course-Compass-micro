const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const stream = require("stream");
const Course = require("../models/Course");
const {
  indexCourse,
  searchCourses,
  initElasticsearch,
} = require("../utils/elasticsearch");
const { getCache, setCache, deleteCacheByPattern } = require("../utils/redis");

const router = express.Router();
const upload = multer();

initElasticsearch();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const results = [];
    const bufferStream = new stream.PassThrough();
    bufferStream.end(req.file.buffer);

    bufferStream
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", async () => {
        try {
          const courses = [];

          for (const row of results) {
            const courseData = {
              course_id: row.course_id || row.id,
              title: row.title,
              description: row.description,
              category: row.category,
              instructor: row.instructor,
              duration: parseInt(row.duration) || 0,
              price: parseFloat(row.price) || 0,
              rating: parseFloat(row.rating) || 0,
              students_enrolled: parseInt(row.students_enrolled) || 0,
            };

            let course = await Course.findOne({
              course_id: courseData.course_id,
            });

            if (course) {
              course = await Course.findOneAndUpdate(
                { course_id: courseData.course_id },
                courseData,
                { new: true }
              );
            } else {
              course = new Course(courseData);
              await course.save();
            }

            await indexCourse(course.toObject());
            courses.push(course);
          }

          await deleteCacheByPattern("courses:*");
          await deleteCacheByPattern("search:*");

          res.json({
            message: `Successfully processed ${courses.length} courses`,
            courses: courses.length,
          });
        } catch (error) {
          console.error("CSV processing error:", error);
          res.status(500).json({ message: "Error processing CSV data" });
        }
      })
      .on("error", (error) => {
        console.error("CSV parsing error:", error);
        res.status(400).json({ message: "Error parsing CSV file" });
      });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

router.get("/search", async (req, res) => {
  try {
    const { q, category, instructor, minRating, maxDuration } = req.query;

    const cacheKey = `search:${JSON.stringify(req.query)}`;

    const cachedResults = await getCache(cacheKey);
    if (cachedResults) {
      return res.json({
        source: "cache",
        results: cachedResults,
      });
    }

    const results = await searchCourses(q, {
      category,
      instructor,
      minRating,
      maxDuration,
    });

    await setCache(cacheKey, results, 900);

    res.json({
      source: "elasticsearch",
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Search failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const cacheKey = "courses:all";

    const cachedCourses = await getCache(cacheKey);
    if (cachedCourses) {
      return res.json({
        source: "cache",
        courses: cachedCourses,
      });
    }

    const courses = await Course.find().sort({ createdAt: -1 }).limit(100);

    await setCache(cacheKey, courses, 600);

    res.json({
      source: "database",
      courses,
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const cacheKey = `course:${req.params.id}`;

    const cachedCourse = await getCache(cacheKey);
    if (cachedCourse) {
      return res.json({
        source: "cache",
        course: cachedCourse,
      });
    }

    const course = await Course.findOne({
      $or: [{ _id: req.params.id }, { course_id: req.params.id }],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await setCache(cacheKey, course, 1800);

    res.json({
      source: "database",
      course,
    });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
});

module.exports = router;
