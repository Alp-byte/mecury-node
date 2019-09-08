var libs = {};
libs.async = require('async');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.store = require.main.require('./emarket/store');
emarket.blacklist = require.main.require('./emarket/blacklist');

emarket.storeblacklisted = function () {}

var the = emarket.storeblacklisted;
the.myname = 'emarket.storeblacklisted';

the.blacklists = { };
the.blacklists[emarket.blacklist.blacklistAddress] = true;

the.attachBlacklist = function (blacklist) {

  the.blacklists[blacklist] = true;
}

the.detachBlacklist = function (blacklist) {

  the.blacklists[blacklist] = false;
}

///TODO: maybe check if attached blacklists are fully synced. Otherwise we can show undesired listings
///      till it fully syncs.

the.getListings = function (callback) {

  emarket.store.getListings(function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    var allItems = [];
    var state = {total: result.items.length, processed: 0, skipped: 0};

    libs.async.filter(result.items,
      function(item, callback1) {

        emarket.blacklist.isBlacklisted(item.address, function(result2) {

          if(result2.result != 'ok') {

            state.skipped++;
            state.processed++;
            callback1(null, false);
            return;
          }

          if(!result2.blacklisted) {

            //not blacklisted
            allItems.push(item);
            state.processed++;
            callback1(null, true);
            return;
          }

          if(the.blacklists[result2.blacklist]) {

            //blacklisted
            state.processed++;
            callback1(null, true);
            return;
          }

          //blacklisted but in not attached blacklist
          allItems.push(item);
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

        callback({ result: 'ok', items: allItems, processed: state.processed });
        return;
      }
    );
  });
}

module.exports = the