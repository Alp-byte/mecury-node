var libs = {};
libs.xss = require('xss');
libs.async = require('async');
libs.lodash = require('lodash');

var emarket = {}
emarket.wallets = {};
emarket.db = {};
emarket.ipfs = {};

emarket.defaults = require.main.require('./emarket/defaults');
emarket.goods = require.main.require('./emarket/goods');
emarket.wallets.wallets = require.main.require('./emarket/wallets/wallets');
emarket.db.ipfsHashes = require.main.require('./emarket/db/ipfsHashes');
emarket.db.ipfsListings = require.main.require('./emarket/db/ipfsListings');
emarket.ipfs.api = require.main.require('./emarket/ipfs/api');
emarket.ipfs.contract = require.main.require('./emarket/ipfs/contract');

emarket.ipfs.storage = function () {}

var the = emarket.ipfs.storage;
the.myname = 'emarket.ipfs.storage';

var myxss = new libs.xss.FilterXSS({ whiteList: {} });

the.sync = function (options, progressCallback, callback) {

  ///TODO: add progressCallback for proper loading progress UI

  var caller = the.myname + '.sync';

  // take all IPFS hashes and fetch data from IPFS

  emarket.ipfs.contract.hashes(options, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    filterExistingHashes(result.items, function(result2){

      if(result2.result != 'ok') {

        callback(result2);
        return;
      }

      // hashes contain only new hashes

      var hashes = result2.items;

      var state = { items: [], total: hashes.length, processed: 0, skipped: 0, i: 0 };

      libs.async.filterLimit(hashes, 100,

        function(item, callback1) {

          state.i++;

          ///TODO: may stuck here due to invalid hash. Timeout is here but DDOS is possible.

          emarket.ipfs.api.get(options, item.hashData, function(result3) {

            state.processed++;

            if(result3.result != 'ok') {

              state.skipped++;
              callback1(null, true);
              return;
            }

            result3.item.hashData = myxss.process(item.hashData);
            result3.item.version = parseInt(item.version);
            result3.item.blockNumber = parseInt(item.blockNumber);
            result3.item.timestamp = parseInt(item.timestamp);
            var parsedItems = parseIpfsData(result3.item);

            if(parsedItems.result != 'ok') {

              state.skipped++;
              callback1(null, true);
              return;
            }

            insertListings(parsedItems.items, function(result4) {

              if(result4.result != 'ok') {

                state.skipped++;
                callback1(null, true);
                return;
              }

              //progressCallback({ result: 'ok', function: caller, item: parsedItems, index: state.i });
              callback1(null, true);
              return;
            });
          });
        },
        function(err, result5) {

          if(err) {

            callback(err);
            return;
          }

          callback({ result: 'ok', items: state.items, processed: state.processed, skipped: state.skipped });
          return;
        }
      );
    });
  });
}

// add item into IPFS and make a record into contract. Use loaded user file with items to speed up adding.
the.add = function(options, file, callback) {

  var wallet = emarket.wallets.wallets.currentWallet;

  // store data into IPFS as a new file
  emarket.ipfs.api.add(options, file, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    // add IPFS file reference into contract
    var hashData = result.hash;
    emarket.ipfs.contract.add(wallet, options, hashData, function(result2) {

      if(result2.result != 'ok') {

        callback(result2);
        return;
      }

      // pass new file hash
      result2.hashIpfs = hashData;
      callback(result2);
      return;
    });
  });
}

// remove item from contract.
the.remove = function(options, item, callback) {

  var wallet = emarket.wallets.wallets.currentWallet;
  emarket.ipfs.contract.remove(wallet, options, item.hashData, item.addressIpfs, callback);
}

// get items for a given user from IPFS.
the.get = function(account, options, callback) {

  ///TODO: add conversion to Goods format
  emarket.db.ipfsListings.selectWithSender(account, callback);
}

///TODO: remove this code.
// get all items from IPFS.
the.getAll = function(options, callback) {

  emarket.db.ipfsListings.select(function (result) {

    var items = [];
    if(result.items && result.items.length) {

      for (var i = 0; i < result.items.length; i++) {

        var goodsItem = emarket.goods.fromDb(result.items[i]);
        goodsItem.availableCount = goodsItem.saleCount;
        items.push(goodsItem);
      }
    }

    callback({ result: 'ok', items: items });
    return;
  });
}

/// private functions

// keep only hashes not having records in ipfsListings table
function filterExistingHashes(hashes, callback) {

  var state = { items: [], total: hashes.length, processed: 0, skipped: 0, i: 0 };

  libs.async.filterLimit(hashes, 1,

    function(item, callback1) {

      state.i++;

      emarket.db.ipfsListings.selectWithHash(item.hashData, function(result) {

        state.processed++;

        if(result.result != 'ok') {

          state.skipped++;
          callback1(null, true);
          return;
        }

        if(result.items.length > 0) {

          callback1(null, true);
          return;
        }

        state.items.push(item);
        callback1(null, true);
        return;
      });
    },
    function(err, result2) {

      if(err) {

        callback(err);
        return;
      }

      callback({ result: 'ok', items: state.items, processed: state.processed, skipped: state.skipped });
      return;
    }
  );
}

// check IPFS data format
function parseIpfsData(data) {

  if(!data.items)
    return { result: 'error', error: 'parse error' };

  var state = { items: [], result: 'ok', error: '' };
  libs.lodash.forEach(data.items, function(item) {

    if(!item.addressIpfs) {

      state.result = 'error';
      state.error = 'parse error';
      return false;
    }

    item.sender = data.sender;
    item.timestamp = data.timestamp;
    item.blockNumber = data.blockNumber;
    item.version = data.version;
    item.hashData = data.hashData;

    var goodsItem = emarket.goods.fromStoreData({}, item);
    var goodsItemDB = emarket.goods.toDb(goodsItem);
    goodsItemDB.status = 1;

    ///HACK: remove unnecessary data
    var payload = JSON.parse(goodsItemDB.payload);
    delete payload.addressIpfs;
    delete payload.hashData;
    goodsItemDB.payload = JSON.stringify(payload);

    state.items.push(goodsItemDB);
  });

  if(state.result != 'ok') {

    return state.error;
  }

  return { result: 'ok', items: state.items };
}

// insert items into ipfsListings table
function insertListings(items, callback) {

  var state = { items: [], total: items, processed: 0, skipped: 0, i: 0 };

  libs.async.filterLimit(items, 1,

    function(item, callback1) {

      state.i++;
      state.processed++;

      // insert into listings DB

      item.hashIpfs = item.hashData;
      item.addressEth = '';

      state.items.push(item);
      emarket.db.ipfsListings.insert(item, function (result) {

        ///HACK: assume success
        callback1(null, true);
        return;
      });
    },
    function(err, result2) {

      if(err) {

        callback(err);
        return;
      }

      callback({ result: 'ok', items: state.items, processed: state.processed, skipped: state.skipped });
      return;
    }
  );
}

module.exports = the
