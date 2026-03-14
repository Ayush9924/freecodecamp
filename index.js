require("dotenv").config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(process.cwd() + "/public"));

// In-memory storage
let urls = [];
let counter = 1;

// Homepage
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// POST /api/shorturl - Create short URL
app.post('/api/shorturl', (req, res) => {
  let original = req.body.url;

  let hostname;
  try {
    hostname = new URL(original).hostname;
  } catch {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const entry = {
      original_url: original,
      short_url: counter++
    };

    urls.push(entry);

    res.json(entry);
  });
});

// GET /api/shorturl/:short_url - Redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  const short = req.params.short_url;

  const found = urls.find(u => u.short_url == short);

  if (!found) {
    return res.json({ error: "No short URL found" });
  }

  res.redirect(found.original_url);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server running on port " + port);
});