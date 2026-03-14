require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Health check endpoint
app.get("/api/test", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// File metadata endpoint
app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  res.setHeader("Content-Type", "application/json");
  
  if (!req.file) {
    return res.status(400).json({ error: "Please upload a file" });
  }
  
  // Ensure size is a number
  const fileSize = parseInt(req.file.size, 10) || 0;
  
  const response = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: fileSize
  };
  
  console.log("File metadata:", response);
  res.json(response);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});