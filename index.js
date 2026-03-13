'use strict';

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// configure multer storage (use memory storage for compatibility with Render)
const upload = multer({ storage: multer.memoryStorage() });

// API endpoint
app.post('/api/fileanalyse', multer().single('upfile'), function(req, res) {

  if (!req.file) {
    return res.json({ error: "No file uploaded" });
  }

  const fileData = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size
  };

  res.json(fileData);
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Server running on port ' + port);
});