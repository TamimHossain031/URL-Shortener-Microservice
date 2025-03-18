require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const validUrl = require('valid-url');
const cors = require('cors');
const { urlencoded } = require('body-parser');
const req = require('express/lib/request');
const app = express();
app.use(express.urlencoded({ extended: true }));
// Basic Configuration
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

// Database
mongoose.connect('mongodb+srv://tamim031:tamim031@freecodecamp.9cwq2.mongodb.net/?retryWrites=true&w=majority&appName=freeCodeCamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});


const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});

const URL = mongoose.model('URL', urlSchema);

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', async function(req, res) {
  const data = await URL.find({});
  console.log(data)
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', async function(req, res) {
  const {url} = req.body
  if(!validUrl.isWebUri(url)){
    return res.json({ error: 'invalid url' })
  }
  try{
    const existingUrl = await URL.findOne({original_url:url})
    if(existingUrl){
      return res.json({
        original_url: existingUrl.original_url,
        short_url: existingUrl.short_url,
      });
    }else{
      const shortId = shortid.generate();
      const newUrl = new URL({
        original_url:url,
        short_url:shortId
      })

      await newUrl.save();
      res.json({
        original_url: url,
        short_url: shortId,
      })
    }

  }catch(error){
    console.log(error)
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/shorturl/:shortUrl',async(req,res)=>{
  const {shortUrl} = req.params
  try{
    const url = await URL.findOne({short_url:shortUrl})

    if(url){
      res.redirect(url.original_url)
    }else{
      res.status(404).json({error:'Url not found'})
    }

  }catch(err){
    res.status(500).json({error:'Server Error'})
  }
  
  
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
