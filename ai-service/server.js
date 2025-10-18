const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/recommendations", require("./routes/recommendations"));

app.get("/health", (req, res) => {
  res.status(200).json({ message: "AI service is running" });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});
