var libs = {};
libs.xss = require('xss');
libs.async = require('async');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.sync = require.main.require('./emarket/sync');
emarket.utils = require.main.require('./emarket/utils');

emarket.ethereum = {};
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.db = {};
emarket.db.feedbbt = require.main.require('./emarket/db/feedbbt');
emarket.db.events = require.main.require('./emarket/db/events');

var myxss = new libs.xss.FilterXSS({ whiteList: {} });

emarket.feedbbt = function () {}

var the = emarket.feedbbt;
the.myname = 'emarket.feedbbt';

var feedbbtAbi = [{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_fee","type":"uint256"},{"name":"_dataInfo","type":"string"}],"name":"add","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"contentCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"version","type":"uint256"},{"indexed":true,"name":"timePage","type":"uint256"},{"indexed":true,"name":"payment","type":"uint256"},{"indexed":false,"name":"dataInfo","type":"string"}],"name":"Feed","type":"event"}];

the.feedbbtAddress = '0xf3d4b6a6d6ef3254c7409163cfc3e2ac50f48f49';
if(emarket.defaults.isTestnet) the.feedbbtAddress = '0x8e3dac11beb621ac398a87171c59502447734e76';
if(emarket.defaults.isTestnet && emarket.defaults.privateTestnet) the.feedbbtAddress = '0x12816f78d062c22fb35c98ba3082409a176cb435';

the.sync = function(options, progressCallback, callback) {

  emarket.sync.syncHelper(
    options, the.myname + '.sync',
    the.feedbbtAddress, feedbbtAbi, 'Feed',
    function(item) {

      return true;
    },
    syncBody,
    progressCallback, callback);
}

the.getFeeds = function (callback) {

  emarket.db.feedbbt.select(function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    callback({result: 'ok', items: result.items});
    return;
  });
}

//private functions

function syncBody(address, event, options, progressCallback, callback) {

  event.payment = myxss.process(event.payment);
  event.version = parseInt(event.version);
  event.blockNumber = parseInt(event.blockNumber);

  var context = { contentCount: 0, height: 0, recentHeight: 0, processed: 0, event: event };
  libs.async.waterfall([
      libs.async.apply(emarket.utils.asyncFindTimestampForEvent, options, context),
      libs.async.apply(saveEventToDB)
    ],
    function(asyncError, asyncResult) {

      if(asyncError) {

        callback({ result: 'error', error: asyncError.error, type: asyncError.type });
        return;
      }

      callback({ result: 'ok', item: asyncResult });
      return;
    }
  );
}

//store event into events DB
function saveEventToDB(context, asyncCallback) {

  emarket.db.feedbbt.insert(context.event, function(result2) {

    asyncCallback(null, context);
    return;
  });
}

module.exports = the
