require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

const port = process.env.PORT || 7799;

app.use(cors());
app.use(express.urlencoded({ extended: true })); 
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Use a dictionary instead of an array. 
// Starting at 1 prevents the "0 is falsy" bug in the FCC test runner.
const urlDatabase = {};
let counter = 1;

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  try {
    const parsedUrl = new URL(originalUrl);
    
    // Strict Protocol Verification
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }

    // DNS Lookup
    dns.lookup(parsedUrl.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      }

      // Save to dictionary and increment counter
      const shortUrl = counter;
      urlDatabase[shortUrl] = originalUrl;
      counter++;

      return res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    });
    
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrlParam = req.params.short_url;
  
  // Look up the original URL in our dictionary
  const originalUrl = urlDatabase[shortUrlParam];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});