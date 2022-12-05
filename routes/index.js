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
      fertig : getZeit(req.query.waschmaschinenzeit)-2,
      dauer : 2, 
      port : 2,
    });
  }

  if(req.query.spülmaschinenzeit && req.query.spülmaschinenzeit.length > 1){
    console.log(`Spülmaschine ${req.query.spülmaschinenzeit}`)
    input.push({
      name : "Spülmaschine",
      fertig : getZeit(req.query.spülmaschinenzeit)-2,
      dauer : 2, 
      port : 1
    });
  }
  
  if(req.query.trocknerzeit && req.query.trocknerzeit.length > 1){
    console.log(`Trockner ${req.query.trocknerzeit}`)
    input.push({
      name : "trockner",
      fertig : getZeit(req.query.trocknerzeit)-2,
      dauer : 2, 
      port : 3
    });
  }

  let heizschwert = {};
  if(req.query.heizschwert && req.query.heizschwert == "on"){
    console.log(`Heizschwert ${req.query.heizschwert}`)
    heizschwert = {
      name : "Heizschwert",
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
  let belegt = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
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
          console.log(`BesteUhrzeit: ${besteUhrzeit} - ${j} - length: ${input.length} Bewölkung ${hours[i]} Bewölkung+1 ${hours[i+1]}`);
          input[j].start = i;
          input[j].ende = i + input[j].dauer
        }
      }
    } 
    belegt[besteUhrzeit]=input[j];
    belegt[besteUhrzeit + 1]=true;
  }
  console.log(`Belegt vor Heizschwert: ${JSON.stringify(belegt)}`)

  for (let j = 0; j<belegt.length; j++){
    if(j > sonnenaufgang && j < sonnenuntergang){
      if(!belegt[j] && hours[j]< 51){
        console.log(`noch frei & <= 50 ${j} `);
        let h = JSON.parse(JSON.stringify(heizschwert));
        h.start = j;
        h.ende = j + 1;  
        belegt[j] = h;
      }
    }
  }
  console.log(`Belegt: ${JSON.stringify(belegt)}`)

  let startTabelle = [];
  for (let j = 0; j<belegt.length; j++){
    if(typeof belegt[j] === "object"){
      startTabelle.push(belegt[j]);
    }
  }
  console.log(`startTabelle: ${JSON.stringify(startTabelle)}`)

  console.log(`Belegt: ${JSON.stringify(belegt)}`)
  console.log(besteUhrzeit);
  res.render('status', { title: 'Sonne', wetter : wetter, data: startTabelle, sunset: wetter.sunset, sunrise: wetter.sunrise, besteUhrzeit : besteUhrzeit});
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
