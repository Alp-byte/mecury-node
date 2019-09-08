var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.sync = require.main.require('./emarket/sync');

emarket.db = {};
emarket.db.blacklists = require.main.require('./emarket/db/blacklists');

/*
Blacklist module. Uses Blacklist contract for blacklisting addresses.
*/

emarket.blacklist = function () {}

var the = emarket.blacklist;
the.myname = 'emarket.blacklist';

var blacklistAbi = [{"constant":false,"inputs":[{"name":"_dataInfo","type":"string"},{"name":"_version","type":"uint256"},{"name":"_who","type":"address"}],"name":"add","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"moderator","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_moderator","type":"address"}],"name":"setModerator","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"contentCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"blacklisted","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_dataInfo","type":"string"},{"name":"_version","type":"uint256"},{"name":"_who","type":"address"}],"name":"remove","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"dataInfo","type":"string"},{"indexed":true,"name":"version","type":"uint256"},{"indexed":true,"name":"who","type":"address"},{"indexed":false,"name":"eventType","type":"uint16"}],"name":"LogEvent","type":"event"}];

the.blacklistAddress = '0xbb6b72c396b5a690a84b5f3fd0ec7ed28985ab17';
if(emarket.defaults.isTestnet) the.blacklistAddress = '0x6cd4a37da53f9a868c7447b00aa6652e1b07182b';
if(emarket.defaults.isTestnet && emarket.defaults.privateTestnet) the.blacklistAddress = '0x40ac673e2b2683ff6371880477eeab71fc6ed428';

the.sync = function(options, progressCallback, callback) {

  emarket.sync.syncHelper(
    options, the.myname + '.sync',
    the.blacklistAddress, blacklistAbi, 'LogEvent',
    function(item) {

      var datatype = parseInt(item.returnValues.eventType);
      if(datatype != 1 && datatype != 2) return false;

      return true;
    },
    syncBody,
    progressCallback, callback);
}

the.isBlacklisted = function(address, callback) {

  emarket.db.blacklists.select(address, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    if(!result.item) {
      callback({ result: 'ok', blacklisted: false });
      return;
    }

    callback({ result: 'ok', blacklisted: result.item.blacklisted, blacklist: result.item.blacklist });
    return;
  });
}

//private functions

function syncBody(address, event, options, progressCallback, callback) {

  var toBlacklist = false;
  if(event.returnValues.eventType == 1) {
    toBlacklist = true;
  }

  emarket.db.blacklists.insert(event.returnValues.who,
    { blacklisted: toBlacklist, blacklist: blacklistAddr },
    
    function(result) {

      callback({ result: 'ok', event: event });
      return;
    }
  );
}

module.exports = the