require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const urlparser = require('url')

// Basic Configuration
const port = process.env.PORT || 7799;

// In-memory storage (replace MongoDB if connection fails)
let urlDatabase = {};
let shortUrlCounter = 1;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl', function(req, res) {
  console.log(req.body)
  const url = req.body.url
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (err || !address){
      return res.json({error: "Invalid url"})
    }else {
      try {
        // Check if URL already exists
        let shortUrl = null;
        for (let key in urlDatabase) {
          if (urlDatabase[key] === url) {
            shortUrl = parseInt(key);
            break;
          }
        }
        
        // If not found, create new short URL
        if (shortUrl === null) {
          shortUrl = shortUrlCounter;
          urlDatabase[shortUrl] = url;
          shortUrlCounter++;
        }
        
        res.json({original_url: url, short_url: shortUrl})
      } catch (e) {
        console.error(e)
        res.json({error: "Server error"})
      }
    }
  })
});

app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const shorturl = parseInt(req.params.short_url);
    if (urlDatabase.hasOwnProperty(shorturl)) {
      res.redirect(urlDatabase[shorturl])
    } else {
      res.json({error: "No short URL found"})
    }
  } catch (e) {
    console.error(e)
    res.json({error: "Server error"})
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});