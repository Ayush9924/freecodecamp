'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// in-memory storage
let urlDatabase = {};
let counter = 1;

/*
POST /api/shorturl
*/
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  let hostname;

  try {
    hostname = new URL(originalUrl).hostname;
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const short = counter++;

    urlDatabase[short] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: short
    });
  });
});

/*
GET /api/shorturl/:short_url
*/
app.get('/api/shorturl/:short_url', (req, res) => {
  const short = req.params.short_url;

  const original = urlDatabase[short];

  if (!original) {
    return res.json({ error: 'No short URL found' });
  }

  // important for test #3
  return res.redirect(original);
});

app.listen(port, () => {
  console.log('Server running on port ' + port);
});