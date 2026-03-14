require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/* --------------------------
   In-memory database
--------------------------- */

let urlDatabase = {};
let counter = 1;

/* --------------------------
   POST /api/shorturl
--------------------------- */

app.post('/api/shorturl', (req, res) => {

  const originalUrl = req.body.url;
  let parsed;

  /* Step 1 — URL syntax validation */

  try {
    parsed = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  /* Step 2 — protocol validation */

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  /* Step 3 — DNS lookup */

  dns.lookup(parsed.hostname, (err) => {

    if (err) {
      return res.json({ error: 'invalid url' });
    }

    /* Step 4 — check if URL already exists */

    for (let key in urlDatabase) {
      if (urlDatabase[key] === originalUrl) {
        return res.json({
          original_url: originalUrl,
          short_url: parseInt(key)
        });
      }
    }

    /* Step 5 — create new short url */

    const shortUrl = counter;

    urlDatabase[shortUrl] = originalUrl;

    counter++;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });

  });

});

/* --------------------------
   GET /api/shorturl/:id
--------------------------- */

app.get('/api/shorturl/:short_url', (req, res) => {

  const shortUrl = parseInt(req.params.short_url);

  if (urlDatabase[shortUrl]) {

    // Important: must be return
    return res.redirect(urlDatabase[shortUrl]);

  }

  res.json({ error: 'No short URL found' });

});

/* --------------------------
   Start server
--------------------------- */

app.listen(port, () => {
  console.log('Server running on port', port);
});