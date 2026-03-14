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
  
  // Validate URL format
  if (!originalUrl) {
    return res.json({ error: "invalid url" });
  }
  
  // Parse URL to validate format
  try {
    const parsedUrl = new URL(originalUrl);
    
    // Validate protocol
    if (!parsedUrl.protocol || !["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.json({ error: "invalid url" });
    }
    
    // Validate hostname format (should contain www or at least have a proper domain)
    const hostname = parsedUrl.hostname;
    if (!hostname || hostname === "localhost") {
      return res.json({ error: "invalid url" });
    }
    
    // Use DNS lookup to verify the URL is valid
    dns.lookup(hostname, (err, address) => {
      if (err) {
        console.log("DNS lookup failed:", err);
        return res.json({ error: "invalid url" });
      }
      
      // Check if URL already exists in database
      let shortUrl;
      const existingEntry = Object.entries(urlDatabase).find(
        ([key, val]) => val === originalUrl
      );
      
      if (existingEntry) {
        shortUrl = existingEntry[0];
      } else {
        // Create new short URL
        shortUrl = shortUrlCounter;
        urlDatabase[shortUrl] = originalUrl;
        shortUrlCounter++;
      }
      
      console.log("URL shortened:", { original_url: originalUrl, short_url: parseInt(shortUrl) });
      res.json({
        original_url: originalUrl,
        short_url: parseInt(shortUrl)
      });
    });
  } catch (error) {
    console.log("URL parsing error:", error);
    return res.json({ error: "invalid url" });
  }
});

// GET /api/shorturl/:short_url - Redirect to original URL
app.get("/api/shorturl/:short_url", (req, res) => {
  const shortUrl = req.params.short_url;
  
  if (urlDatabase[shortUrl]) {
    const originalUrl = urlDatabase[shortUrl];
    console.log("Redirecting:", shortUrl, "->", originalUrl);
    res.redirect(originalUrl);
  } else {
    res.json({ error: "Short URL not found" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});