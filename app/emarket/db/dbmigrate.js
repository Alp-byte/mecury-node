var libs = {};
libs.sqlite3 = require('sqlite3');
libs.async = require('async');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.db = {};
emarket.db.db = require.main.require('./emarket/db/db');
emarket.db.events = require.main.require('./emarket/db/events');
emarket.db.contracts = require.main.require('./emarket/db/contracts');
emarket.db.anns = require.main.require('./emarket/db/anns');
emarket.db.listings = require.main.require('./emarket/db/listings');
emarket.db.orders = require.main.require('./emarket/db/orders');
emarket.db.transactionLog = require.main.require('./emarket/db/transactionLog');
emarket.db.blacklists = require.main.require('./emarket/db/blacklists');
emarket.db.feedbbt = require.main.require('./emarket/db/feedbbt');
emarket.db.escrows = require.main.require('./emarket/db/escrows');
emarket.db.transactions = require.main.require('./emarket/db/transactions');
emarket.db.ipfsHashes = require.main.require('./emarket/db/ipfsHashes');
emarket.db.ipfsListings = require.main.require('./emarket/db/ipfsListings');
emarket.db.stores = require.main.require('./emarket/db/stores');

emarket.db.migrate = function () {}

var the = emarket.db.migrate;
the.myname = 'emarket.db.migrate';

the.open = function(path, callback) {

  emarket.db.db.open(path);
  createTables(function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    if(emarket.defaults.isTesting) {

      var state = { total: emarket.testdata.allListings.length, processed: 0, skipped: 0 };

      //fill test data
      libs.async.filter(emarket.testdata.allListings,
        function(item, callback1) {

          console.log('item', item);
          item.version = emarket.defaults.marketVersion;
          item.blockNumber = item.height;

          emarket.db.listings.insert(item, function(result2) {

            state.processed++;
            callback1(null, true);
            return;
          });
        },
        function(err, result) {

          if(err) {

            callback(err);
            return;
          }

          callback({ result: 'ok', processed: state.processed });
          return;
        }
      );
      return;
    }

    callback(result);
    return;
  });
}

function createTables(callback) {

  console.log('create tables');
  var tables = [
    emarket.db.events.create,
    emarket.db.contracts.create,
    emarket.db.anns.create,
    emarket.db.listings.create,
    emarket.db.orders.create,
    emarket.db.transactionLog.create,
    emarket.db.blacklists.create,
    emarket.db.feedbbt.create,
    emarket.db.escrows.create,
    emarket.db.transactions.create,
    emarket.db.ipfsHashes.create,
    emarket.db.ipfsListings.create,
    emarket.db.stores.create
    ];
  var state = { total: tables.length, processed: 0, skipped: 0 };

  //create all tables in [tables]
  libs.async.filter(tables,
    function(item, callback1) {

      item(function(result) {

        state.processed++;
        callback1(null, true);
        return;
      });
    },
    function(err, result) {

      if(err) {

        callback(err);
        return;
      }

      callback({ result: 'ok', processed: state.processed });
      return;
    }
  );
}

module.exports = the