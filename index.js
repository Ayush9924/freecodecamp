// You can submit a form that includes a file upload.
// Waiting: The form file input field has the name attribute set to upfile.
// Waiting: When you submit a file, you receive the file name, type, and size in bytes within the JSON response.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
const upload = multer({
  dest: "./uploads/",
});

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});
app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
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