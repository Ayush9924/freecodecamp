require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
  if (!req.file) {
    return res.json({ error: "No file uploaded" });
  }
  const file = req.file;
  const respond = {
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  };
  res.json(respond);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});