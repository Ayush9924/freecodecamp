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

// File metadata endpoint - GET (for testing/info)
app.get("/api/fileanalyse", (req, res) => {
  res.json({ 
    message: "Use POST method to upload a file",
    usage: "POST /api/fileanalyse with multipart/form-data",
    fieldName: "upfile"
  });
});

// File metadata endpoint - POST (for file upload)
app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  res.setHeader("Content-Type", "application/json");
  
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  
  const response = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  };
  
  console.log("File uploaded successfully:", response);
  res.json(response);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});