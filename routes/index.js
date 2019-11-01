var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Spielplatz App' });
});

router.get('/registrierung', function(req, res, next) {
  res.render('registrierung', { title: 'Spielplatz App' });
});

router.get('/karte', function(req, res, next) {
  res.render('karte', { title: 'Spielplatz App' });
});
router.get('/danke', function(req, res, next) {
  res.render('danke', { title: 'Spielplatz App' });
});
router.get('/karteadmin', function(req, res, next) {
  res.render('karteadmin', { title: 'Spielplatz App' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Spielplatz App' });
});
router.get('/problem', function(req, res, next) {
  res.render('problem', { title: 'Spielplatz App' });
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
