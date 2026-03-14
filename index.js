require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

var dataBase = []

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({extended:false}))

app.use(express.json())

function validarURL(url){  
  const regex = /((https?:\/\/)|(ftp:\/\/)|(^))([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+([a-zA-Z]{2,9})(:\d{1,4})?([-\w\/#~:.?+=&%@~]*)/;
  return regex.test(url);
}

function middleware (req, res, next){
  const url = req.body.url;
  
  if(!validarURL(url)){
    return res.json({error: 'invalid url'})
  }

  return next();
}

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
/* app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
}); */


app.post("/api/shorturl",middleware, (req, res ) => {

    const url = req.body.url

    const randomNumber = Math.round((Math.random() * 100))

    dataBase.push({
      original_url:url,
      short_url:randomNumber
    })

    return res.json(dataBase[dataBase.length - 1])

})
app.get("/api/shorturl/:shorturl", (req, res ) => {
    

    let short = req.params.shorturl

    let result = dataBase.find( el => new String(el.short_url) == short)
  
    if(result != undefined){
      return res.redirect(result.original_url)
    }else{
      return res.json({error: 'invalid url'})
      
    }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});