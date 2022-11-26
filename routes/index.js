var express = require('express');
var libs = require('./libs.js');
var router = express.Router();
var moment = require("moment");
var dummydate = "2017-01-01";

/* GET home page. */
async function createIndexPage(req, res, next){
  let wetter = await libs.getWeatherWeather338(true, true);
  //console.log(JSON.stringify(wetter.cloudCover))
  res.render('index', { title: 'Sonne',  wetter : wetter, sunset: wetter.sunset, sunrise: wetter.sunrise });
}

function getZeit(s){
  let t = "00:00";
  if(s.indexOf(":") == 1){
    t = moment(dummydate+" 0"+s).format("HH")
  }else if(s.indexOf(":") == -1){
    t = moment(dummydate+" "+s+":00").format("HH")
  }else{
    t = moment(dummydate+" "+s).format("HH")
  }
  t = parseInt(t);
  console.log(`getZeit: ${t}`);
  return t;
}

router.get('/', function(req, res, next) {
  createIndexPage(req, res, next);
});

async function getStatus(req, res, next){
  let wetter = await libs.getWeatherWeather338(true, true);
  let sonnenaufgang = parseInt(moment(wetter.sunrise).format("HH"));
  let sonnenuntergang = parseInt(moment(wetter.sunset).format("HH"));

  let input = [];
  if(req.query.waschmaschinenzeit && req.query.waschmaschinenzeit.length > 1 ){
    console.log(`waschmaschine ${req.query.waschmaschinenzeit}`)
    input.push({
      name : "Waschmaschine",
      fertig : getZeit(req.query.waschmaschinenzeit),
      dauer : 2, 
      port : 2,
    });
  }

  if(req.query.spülmaschinenzeit && req.query.spülmaschinenzeit.length > 1){
    console.log(`Spülmaschine ${req.query.spülmaschinenzeit}`)
    input.push({
      name : "Spülmaschine",
      fertig : getZeit(req.query.spülmaschinenzeit),
      dauer : 2, 
      port : 1
    });
  }
  
  if(req.query.trocknerzeit && req.query.trocknerzeit.length > 1){
    console.log(`Trockner ${req.query.trocknerzeit}`)
    input.push({
      name : "trockner",
      fertig : getZeit(req.query.trocknerzeit),
      dauer : 2, 
      port : 3
    });
  }

  let heizschwert = {};
  if(req.query.heizschwert && req.query.heizschwert == "on"){
    console.log(`heizschwert ${req.query.heizschwert}`)
    heizschwert = {
      name : "heizschwert",
      dauer : 1, 
      port : 4
    };
  }
  console.log(`heizschwert: ${JSON.stringify(heizschwert)}`)

  input.sort((a, b) => a.fertig - b.fertig);
  console.log("Uhrzeit "+JSON.stringify(input))
  
  let start = 0;
  let hours = wetter.cloudCover;
  let besterWert = 200;  
  let besteUhrzeit = 0;
  console.log(`before hours loop: ${wetter.cloudCover.length}, sonnenaufgang: ${sonnenaufgang}, sonnenuntergang : ${sonnenuntergang}`)
  let aktuellesGeraet = 0;
  let belegt = [];
  for (let j = 0; j<input.length; j++){
    besterWert = 200;  
    besteUhrzeit = 0;
  
    for(let i = sonnenaufgang; i<sonnenuntergang; i++){
      if(i > input[j].fertig){
        start = i;
        break;
      }
      if(!belegt[i] && !belegt[i+1]){
        console.log(`nicht belegt ${i}`);
        if(besterWert > hours[i] + hours[i+1]){
          besterWert = hours[i] + hours[i+1]
          besteUhrzeit = i
          console.log(`BesteUhrzeit: ${besteUhrzeit} - ${j} - length: ${input.length}`);
          input[j].start = i;
          input[j].ende = i + input[j].dauer
        }
      }
    } 
    belegt[besteUhrzeit]=true
    belegt[besteUhrzeit + 1]=true
  }

  console.log(`Belegt: ${JSON.stringify(belegt)}`)
  console.log(besteUhrzeit);
  res.render('status', { title: 'Sonne', wetter : wetter, data: input, sunset: wetter.sunset, sunrise: wetter.sunrise, besteUhrzeit : besteUhrzeit});
}

router.get('/status', function(req, res, next) {
  getStatus(req, res);
});

router.get('/impressum', function(req, res, next) {
  res.render('impressum', { title: 'Spielplatz App' });
});

router.get('/db', function(req, res, next) {

  const { Client } = require('pg');

  console.log(`DB Server url: ${process.env.DATABASE_URL}`)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });
  
  client.connect();
  
  var rows = [];

  client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, r) => {
    if (err) throw err;
    for (let row of r.rows) {
      rows.push(row)
    }
    client.end();

    res.render('db', { title: 'Spielplatz App DB Test', rows : rows });
  });
});




module.exports = router;
