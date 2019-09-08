// allows absolute paths in 'require'
//require('module-alias/register');

var libs = {};
libs.bodyParser = require('body-parser');
libs.express = require('express');
libs.path = require('path');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');
emarket.db.dbmigrate = require.main.require('./emarket/db/dbmigrate');

const marketbindings = require('./marketbindings');

// Load the Express package and create our app
var app = libs.express();

process.on('SIGINT', function() {

  console.log('Stopping database');
  emarket.db.db.close();
  
  console.log('Stopping server');
  process.exit();
});
 
// parse application/json
app.use(libs.bodyParser.json());

app.use(function(req, res, next){
  res.setTimeout(1000000, function(){
    console.log('Request has timed out.');
    res.sendStatus(408);
    res.timeouted = true;
  });

  next();
});

app.post('/api', function(req, res) {
  console.log('requesting api call', req.body)
  if(!req.body.requestType) {
    res.send({result: 'ok'})
    return;
  }
  var apiCall = marketbindings.api[req.body.requestType];
  if (!apiCall) {
    res.send({result: 'error'})
  }

  if(!req.body.options) req.body.options = {};

  apiCall(req.body, function(result) {

    try {

      if(!res.timeouted) res.send(result);
    } catch(err) {

      console.log("Response send failed: " + err);
    }
  });
});

app.post('/handleError', function(req, res) {
  console.log('requesting handleError', req.body)
  
});

app.use(libs.express.static(libs.path.join(__dirname, "/app")))
// Send all other requests to the Angular app
app.get('/*', function(req, res, next) {
  // Just send the index.html for other files to support HTML5Mode
  res.sendFile('/app/index.html', { root: __dirname });
});

// start the server
app.listen(1337);

// log what just happened
console.log('Server started. Open http://localhost:1337');

var dbName = 'block.sqlite';
if(emarket.defaults.isTestnet) dbName = 'block-testnet.sqlite';

emarket.db.dbmigrate.open(dbName, function(result) {

  console.log('Database ready.');

  marketbindings.emarketSyncStore({ options: {} }, function(result2) {

    console.log("SyncStore done");

    /*marketbindings.emarketIpfsStoreSync({ options: {} }, function(result3) {

      console.log("IPFS SyncStore done");
    });*/
  }); 
});
