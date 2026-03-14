require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/public", express.static(process.cwd() + "/public"));

// In-memory storage for URL mappings
let urlDatabase = {};
let shortUrlCounter = 1;

// Homepage
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// POST /api/shorturl - Create short URL
app.post("/api/shorturl", (req, res) => {
  const originalUrl = req.body.url;
  
  // Validate URL exists
  if (!originalUrl) {
    return res.json({ error: "invalid url" });
  }
  
  // Parse URL to validate format
  try {
    const parsedUrl = new URL(originalUrl);
    
    // Validate protocol
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.json({ error: "invalid url" });
    }
    
    // Validate hostname
    const hostname = parsedUrl.hostname;
    if (!hostname) {
      return res.json({ error: "invalid url" });
    }
    
    // Use DNS lookup to verify the URL domain exists
    dns.lookup(hostname, (err, address) => {
      if (err) {
        console.log("DNS lookup failed for:", hostname, err.message);
        return res.json({ error: "invalid url" });
      }
      
      // Check if URL already exists in database
      let shortUrl = null;
      for (let key in urlDatabase) {
        if (urlDatabase[key] === originalUrl) {
          shortUrl = parseInt(key);
          break;
        }
      }
      
      // If not found, create new short URL
      if (shortUrl === null) {
        shortUrl = shortUrlCounter;
        urlDatabase[shortUrl] = originalUrl;
        shortUrlCounter++;
      }
      
      console.log("URL shortened:", { original_url: originalUrl, short_url: shortUrl });
      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
  } catch (error) {
    console.log("URL parsing error:", error.message);
    return res.json({ error: "invalid url" });
  }
});

// GET /api/shorturl/:short_url - Redirect to original URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = parseInt(req.params.short_url);
  
  // Check if shortUrl exists in database
  if (!isNaN(shortUrl) && urlDatabase.hasOwnProperty(shortUrl)) {
    const originalUrl = urlDatabase[shortUrl];
    console.log("Redirecting:", shortUrl, "->", originalUrl);
    // Use 301 Moved Permanently redirect
    res.redirect(301, originalUrl);
  } else {
    res.status(404).json({ error: "URL not found" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});