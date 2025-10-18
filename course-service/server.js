const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/courses", require("./routes/courses"));

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Course service is running" });
});

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/courses")
  .then(() => console.log("Connected to MongoDB for courses"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Course service running on port ${PORT}`);
});
