var libs = {};

libs.xss = require('xss');
libs.async = require('async');
libs.web3 = require('web3');
libs.ethereumjsUtil = require('ethereumjs-util');
libs.lodash = require('lodash');

var emarket = {}
emarket.defaults = require.main.require('./emarket/defaults');
emarket.sync = require.main.require('./emarket/sync');
emarket.utils = require.main.require('./emarket/utils');
emarket.escrows = require.main.require('./emarket/escrows');
emarket.store = require.main.require('./emarket/store');

emarket.wallets = {};
emarket.wallets.wallets = require.main.require('./emarket/wallets/wallets');
emarket.wallets.aes = require.main.require('./emarket/wallets/aes');

emarket.db = {};
emarket.db.events = require.main.require('./emarket/db/events');
emarket.db.orders = require.main.require('./emarket/db/orders');
emarket.db.ipfsListings = require.main.require('./emarket/db/ipfsListings');

emarket.ethereum = {};
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.ipfs = {};
emarket.ipfs.contract = require.main.require('./emarket/ipfs/contract');
emarket.ipfs.storage = require.main.require('./emarket/ipfs/storage');
emarket.ipfs.store = require.main.require('./emarket/ipfs/store');

var myxss = new libs.xss.FilterXSS({ whiteList: {} });

emarket.ipfs.orders = function () { }

var the = emarket.ipfs.orders;
the.myname = 'emarket.ipfs.orders';

the.syncAllEscrowOrders = function (options, progressCallback, callback) {

  ///HACK: we use direct DB access to have items without duplicates filtering.
  ///      We need all items to have all escrows available.

  emarket.db.ipfsListings.select(function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    emarket.store.listingsFilterEscrow(result.items, options, true, function(result2) {

      if (result2.result != 'ok') {

        callback(result2);
        return;
      }

      var ipfsListings = result2.items;

      var escrowAddresses = {};

      // prepare a map of all escrows
      libs.lodash.forEach(ipfsListings.items, function(item) {

        escrowAddresses[item.escrow] = true;
      });

      var escrowAddressesArray = [];

      // convert map to array of keys
      libs.lodash.forEach(escrowAddresses, function(value, key) {

        escrowAddressesArray.push(key);
      });

      emarket.escrows.syncOrdersList(escrowAddressesArray, true, options, progressCallback, callback);
      return;
    });
  });
}

the.syncAllMyPurchases = function (escrows, options, progressCallback, callback) {

  emarket.escrows.syncOrdersList(escrows, true, options, progressCallback, callback);
}

the.syncAllMyOrders = function (options, progressCallback, callback) {

  ///HACK: we use direct DB access to have items without duplicates filtering.
  ///      We need all items to have all escrows available.

  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  emarket.db.ipfsListings.selectWithSender(account, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    emarket.store.listingsFilterEscrow(result.items, options, true, function(result2) {

      if (result2.result != 'ok') {

        callback(result2);
        return;
      }

      var ipfsListings = result2.items;

      var escrowAddresses = {};

      // prepare a map of my escrows
      libs.lodash.forEach(ipfsListings, function(item) {

        escrowAddresses[item.escrow] = true;
      });

      var escrowAddressesArray = [];

      // convert map to array of keys
      libs.lodash.forEach(escrowAddresses, function(value, key) {

        escrowAddressesArray.push(key);
      });

      the.syncAllMyPurchases(escrowAddressesArray, options, progressCallback, callback);
      return;
    });
  });
}

the.getOrders = function (goods, callback) {

  getDeposits(goods, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    callback({ result: 'ok', orders: result.items });
    return;
  });
}

the.getMyOrders = function (options, callback) {

  ///HACK: we use direct DB access to have items without duplicates filtering.
  ///      We need all items to have all escrows available.

  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  emarket.db.ipfsListings.selectWithSender(account, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    emarket.store.listingsFilterEscrow(result.items, options, true, function(result2) {

      if (result2.result != 'ok') {

        callback(result2);
        return;
      }

      var ipfsListings = result2.items;

      if (!ipfsListings || (ipfsListings.length == 0)) {

        callback({ result: 'ok', okItems: [], errorItems: [] });
        return;
      }

      var state = { okItems: [], errorItems: [] };

      // prepare a callback to call after all items are processed
      var afterCallback = libs.lodash.after(ipfsListings.length, callback);

      libs.lodash.forEach(ipfsListings, function(item) {

        var itemCopy = libs.lodash.clone(item);
        itemCopy.orders = [];

        getDeposits(item, function (result) {

          if (result.result != 'ok') {
      
            state.errorItems.push({ item: itemCopy, error: result.error });
            afterCallback({ result: 'ok', okItems: state.okItems, errorItems: state.errorItems });
            return;
          }

          itemCopy.orders = result.items;
          state.okItems.push(itemCopy);
      
          afterCallback({ result: 'ok', okItems: state.okItems, errorItems: state.errorItems });
          return;
        });
      });
    });
  });
}

the.getMyPurchases = function (hashArray, options, callback) {

  // var account = emarket.wallets.wallets.currentWallet.getAddressString();

  // emarket.db.ipfsListings.selectWithMyPurchases(account, function (result) {
    emarket.db.ipfsListings.selectWithHashes(hashArray, function (result) {
    console.log('selectWithHashes', result);
    if (result.result != 'ok') {

      callback(result);
      return;
    }

    emarket.store.listingsFilterEscrow(result.items, options, true, function(result2) {

      if (result2.result != 'ok') {

        callback(result2);
        return;
      }

      var ipfsListings = result2.items;

      if (!ipfsListings || (ipfsListings.length == 0)) {

        callback({ result: 'ok', okItems: [], errorItems: [] });
        return;
      }

      var state = { okItems: [], errorItems: [] };

      // prepare a callback to call after all items are processed
      var afterCallback = libs.lodash.after(ipfsListings.length, callback);

      libs.lodash.forEach(ipfsListings, function(item) {

        var itemCopy = libs.lodash.clone(item);
        itemCopy.orders = [];

        getDeposits(item, function (result) {

          if (result.result != 'ok') {
      
            state.errorItems.push({ item: itemCopy, error: result.error });
            afterCallback({ result: 'ok', okItems: state.okItems, errorItems: state.errorItems });
            return;
          }

          itemCopy.orders = result.items;
          state.okItems.push(itemCopy);
      
          afterCallback({ result: 'ok', okItems: state.okItems, errorItems: state.errorItems });
          return;
        });
      });
    });
  });
}

/// private functions

// find all escrow deposits for desired goods.
// Escrow orders should be synced with local DB.
function getDeposits(goods, callback) {

  var account = emarket.wallets.wallets.currentWallet.getAddressString().toLowerCase();
  var encPrivkey = emarket.wallets.wallets.currentWallet.getCurve25519PrivateKey();

  if (!goods.pubkey) {

    if (goods.payload) {

      var parsedPayload = {};

      try {
        parsedPayload = JSON.parse(goods.payload);
      } catch (err) {

      }

      if (parsedPayload && parsedPayload.pubkey) goods.pubkey = parsedPayload.pubkey;
    }
  }

  //search all orders of type = 14 (deposit)
  emarket.db.orders.selectWithAddressAndEventType(goods.escrow, 14, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    var state = { total: result.items.length, items: [], processed: 0, skipped: 0 };

    libs.async.filter(result.items,
      function (depositEvent, callback1) {

        state.processed++;

        try {

          var payloadData = JSON.parse(depositEvent.payload);

          // we check the deposit is for desired seller
          if (depositEvent.recipient != goods.sender) {

            state.skipped++;
            callback1(null, true);
            return;
          }

          // we check the deposit is for desired goods hash
          if (payloadData.hash != goods.hashIpfs) {

            state.skipped++;
            callback1(null, true);
            return;
          }

          // we check the deposit is for desired goods address
          if (payloadData.id != goods.addressIpfs) {

            state.skipped++;
            callback1(null, true);
            return;
          }

          //decode some fields encoded into payload

          depositEvent.payment = payloadData.payment;
          depositEvent.count = payloadData.count;

          if (payloadData.private) {

            depositEvent.pubkey = payloadData.private.pubkey;
            depositEvent.key = payloadData.private.key;
          }

          depositEvent.hashIpfs = payloadData.hash;
          depositEvent.addressIpfs = payloadData.id;

          try {

            if ((account.length > 0) && (depositEvent.sender.toLowerCase() == account)) {

              var decKey = emarket.wallets.aes.readSessionKey(libs.ethereumjsUtil.toBuffer(goods.pubkey),
                encPrivkey, depositEvent.key);

              depositEvent.key = decKey;
            }

            if ((account.length > 0) && (goods.sender.toLowerCase() == account)) {

              var decKey = emarket.wallets.aes.readSessionKey(libs.ethereumjsUtil.toBuffer(depositEvent.pubkey),
                encPrivkey, depositEvent.key);

              depositEvent.key = decKey;
            }

            var privateMessage = payloadData.private;

            if (!privateMessage) {
              privateMessage = { msg: "" };
            }

            privateMessage.decrypted = false;

            if ((account.length > 0) && (depositEvent.sender.toLowerCase() == account) ||
              (goods.sender.toLowerCase() == account)) {

              var message = emarket.wallets.aes.decryptForSession(privateMessage, depositEvent.key);
              privateMessage.msg = myxss.process(message.msg);
              privateMessage.decrypted = true;
            }

            depositEvent.private = privateMessage;
          } catch (err) {

            //skip decryption error
            console.log('Decryption error: ' + err);
          }

          state.items.push(depositEvent);

          callback1(null, true);
          return;

        } catch (err) {

          // catch JSON parse errors

          state.skipped++;
          console.log("Error processing order for " + goods.hashIpfs + " item. " + err);
          callback1(null, false);
          return;
        }
      },
      function (err2, result) {

        if (err2) {

          callback(err2);
          return;
        }

        callback({ result: 'ok', items: state.items, processed: state.processed, skipped: state.skipped });
        return;
      }
    );
  });
}

module.exports = the
