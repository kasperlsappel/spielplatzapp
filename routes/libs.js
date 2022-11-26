const axios = require('axios');
const moment = require('moment');
var CircularJSON = require('circular-json');
const fs = require('fs');
const lat = 49.398750;
const lng = 8.672434;

async function getWeatherStormglass(req, res){
    const params = 'cloudCover';
    const apikey = "68b1f9ea-3e7e-11ed-9e1d-0242ac130002-68b1fa4e-3e7e-11ed-9e1d-0242ac130002";
  
    const end = moment().add(1, 'days').format("YYYY-MM-DD");
    console.log(end);
    
  
    let astro = await axios.get(`https://api.stormglass.io/v2/astronomy/point?lat=${lat}&lng=${lng}&end=${end}`, {
      headers: {
        'Authorization': apikey
      }
    });
  
    let weather = await axios.get(`https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${params}`, {
      headers: {
        'Authorization': apikey
      }
    });

    let w = {
      weather : JSON.parse(CircularJSON.stringify(weather)),
      astro : JSON.parse(CircularJSON.stringify(astro))
    };

    console.log(JSON.stringify(w, null, 2))
    /*
    fs.writeFileSync('./public/weather.json', JSON.stringify(w, null, 2), err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      });
    */

    return w;
}

async function getWeatherWeather338(loadFromBuffer, writeToFile){
  let fileLocation = './weatherWeather338.json'
  let w = {}
  if(loadFromBuffer){
    w = JSON.parse(fs.readFileSync(fileLocation, 'utf8'));
  }else{
    const today = moment().add(0, 'days').format("YYYYMMDD");
    console.log(`startDate: ${today}`);
    
    let weather = await axios.get(`https://weather338.p.rapidapi.com/weather/forecast?latitude=${lat}&longitude=${lng}&date=${today}&language=en-US&units=m`, {
      headers: {
        'X-RapidAPI-Key': "c8b1609197msh616f029551e87c8p1ee9e8jsnac18cb5b44c2",
        'X-RapidAPI-Host' : "weather338.p.rapidapi.com"
      }
    });

    console.log(CircularJSON.stringify(weather));
    weather = JSON.parse(CircularJSON.stringify(weather));

    w = {
      startDate : today,
      cloudCover : weather.data["v3-wx-forecast-hourly-10day"].cloudCover,
      sunrise : weather.data["v3-wx-observations-current"].sunriseTimeLocal, 
      sunset : weather.data["v3-wx-observations-current"].sunsetTimeLocal
    } 

    console.log(JSON.stringify(w, null, 2))

    if(writeToFile){
      fs.writeFileSync(fileLocation, JSON.stringify(w, null, 2), err => {
        if (err) {
          console.error(err);
        }
        // file written successfully
      });
    }
  }
  return w;
}

module.exports = {
	getWeatherStormglass : getWeatherStormglass, 
  getWeatherWeather338 : getWeatherWeather338
}