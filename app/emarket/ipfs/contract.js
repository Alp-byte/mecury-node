var libs = {};
libs.async = require('async');

var emarket = {}
emarket.ethereum = {};
emarket.wallets = {};
emarket.db = {};
emarket.ipfs = {};

emarket.defaults = require.main.require('./emarket/defaults');
emarket.goods = require.main.require('./emarket/goods');
emarket.sync = require.main.require('./emarket/sync');
emarket.utils = require.main.require('./emarket/utils');
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');
emarket.ethereum.web3 = require.main.require('./emarket/ethereum/web3');
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');
emarket.wallets.wallets = require.main.require('./emarket/wallets/wallets');
emarket.db.events = require.main.require('./emarket/db/events');
emarket.db.ipfsHashes = require.main.require('./emarket/db/ipfsHashes');

emarket.ipfs.contract = function () {}

var the = emarket.ipfs.contract;
the.myname = 'emarket.ipfs.contract';

the.store2Abi = [{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_dataInfo","type":"string"}],"name":"add","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_dataInfo","type":"string"}],"name":"remove","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"contentCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"version","type":"uint256"},{"indexed":true,"name":"sender","type":"address"},{"indexed":true,"name":"timePage","type":"uint256"},{"indexed":false,"name":"eventType","type":"uint16"},{"indexed":false,"name":"dataInfo","type":"string"}],"name":"LogStore","type":"event"}];

the.store2Address = '0xe844b58ae5633f0d5096769f16ad181ada71ef71';
if(emarket.defaults.isTestnet) the.store2Address = '0xe844b58ae5633f0d5096769f16ad181ada71ef71';
if(emarket.defaults.isTestnet && emarket.defaults.privateTestnet) the.store2Address = '0x651f84de4d523a59d5763699d68e7e79422297ba';

the.sync = function (options, progressCallback, callback) {

  emarket.sync.syncHelper(
    options, the.myname + '.sync',
    the.store2Address, the.store2Abi, 'LogStore',
    function (item) {
      return true;
    },
    syncStoreBody,
    progressCallback, callback);
}

// add hash to the contract. One per user.
the.add = function (wallet, options, hashData, callback) {

  var dataInfo = { hash: hashData };

  emarket.ethereum.api.ethcall(
    wallet,
    the.store2Address,
    the.store2Abi,
    'add',
    [ emarket.defaults.marketVersion, JSON.stringify(dataInfo) ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function(result) {
  
      callback(result);
      return;
    }
  );
}

// remove hash from the contract. Will likely not be used.
the.remove = function (wallet, options, hashData, addressIpfs, callback) {

  var dataInfo = { hash: hashData, id: addressIpfs };

  emarket.ethereum.api.ethcall(
    wallet,
    the.store2Address,
    the.store2Abi,
    'remove',
    [ emarket.defaults.marketVersion, JSON.stringify(dataInfo) ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function(result) {
  
      callback(result);
      return;
    }
  );
}

// get the hashes for given user
the.hashesUser = function (options, account, callback) {

  emarket.db.ipfsHashes.selectWithSender(account, callback);
}

// get the hashes list from the contract. Contains the full list of the users with corresponding hashes.
the.hashes = function (options, callback) {

  emarket.db.ipfsHashes.select(callback);
}

// private functions

//callback fired when all items are synced either successfully or not
function syncStoreBody(address, event, options, progressCallback, callback) {

  var datainfo = event.payload;
  var dataobject = JSON.parse(datainfo);

  dataobject.height = parseInt(event.blockNumber);
  dataobject.blockNumber = parseInt(event.blockNumber);
  dataobject.version = parseInt(event.version);
  dataobject.timestamp = parseInt(event.timestamp);
  dataobject.sender = event.sender.toLowerCase();
  dataobject.eventType = event.eventType;

  ///TODO: add proper format checks

  var hashData = dataobject.hash;
  if (!hashData) {

    callback({ result: 'error', error: 'Listing parse error', type: 'permanent' });
    return;
  }

  dataobject.hashData = hashData;

  event.data = dataobject;

  var context = { contentCount: 0, height: 0, recentHeight: 0, processed: 0, event: event };

  libs.async.waterfall([
    libs.async.apply(checkExisting, context),
    libs.async.apply(emarket.utils.asyncFindTimestampForEvent, options),
    libs.async.apply(saveEventToDB)
  ],
    function (asyncError, asyncResult) {

      if (asyncError) {

        callback({ result: 'error', error: asyncError.error, type: asyncError.type });
        return;
      }

      callback({ result: 'ok', item: asyncResult });
      return;
    }
  );
}

//check event is already in DB
function checkExisting(context, asyncCallback) {

  var event = context.event;

  //look for existing record for this event
  emarket.db.ipfsHashes.selectWithHash(event.data.hashData, function (result) {

    if (result.result != 'ok') {

      asyncCallback({ error: result.error, type: 'temporary' }, null);
      return;
    }

    event.data.exists = false;

    if (result.items.length > 0) {

      event.data.exists = true;
    }

    asyncCallback(null, context);
  });
}

//store event into events DB
function saveEventToDB(context, asyncCallback) {

  var event = context.event;
  event.data.timestamp = event.timestamp;

  // insert item if eventType == ADD
  if((event.data.eventType == 1) && (!event.data.exists)) {

    emarket.db.ipfsHashes.insert(event.data, function (result) {

      asyncCallback(null, context);
      return;
    });

    return;
  }

  // remove item if eventType == REMOVE
  if(event.data.eventType == 2) {

    ///TODO: mark listing as deleted when this event occurs
    
    console.log('Deleted item ' + event.data.id + ' from IPFS file ' + event.data.hashData);

    asyncCallback(null, context);
    return;
  }

  asyncCallback(null, context);
  return;
}

module.exports = the