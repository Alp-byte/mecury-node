var libs = {};
libs.xss = require('xss');
libs.async = require('async');
libs.ethereumjsUtil = require('ethereumjs-util');
libs.lodash = require('lodash');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.default_contracts = require.main.require('./emarket/default_contracts');
emarket.sync = require.main.require('./emarket/sync');
emarket.testdata = require.main.require('./emarket/testdata');
emarket.utils = require.main.require('./emarket/utils');
emarket.escrows = require.main.require('./emarket/escrows');

emarket.wallets = {};
emarket.wallets.aes = require.main.require('./emarket/wallets/aes');
emarket.wallets.wallets = require.main.require('./emarket/wallets/wallets');

emarket.ethereum = {};
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.db = {};
emarket.db.events = require.main.require('./emarket/db/events');
emarket.db.orders = require.main.require('./emarket/db/orders');
emarket.db.listings = require.main.require('./emarket/db/listings');

var myxss = new libs.xss.FilterXSS({ whiteList: {} });

emarket.orders = function () { }

var the = emarket.orders;
the.myname = 'emarket.orders';

the.sync = function (address, options, progressCallback, callback) {

  emarket.sync.syncHelper(
    options, the.myname + '.sync',
    address, emarket.default_contracts.goodsContractAbi, 'LogEvent',
    function (item) {

      return true;
    },
    syncOrdersBody,
    progressCallback, callback);
}

the.syncOrdersList = function (addresses, options, progressCallback, callback) {

  if (!addresses || (addresses.length == 0)) {

    callback({ result: 'ok', okItems: [], errorItems: [] });
    return;
  }

  // prepare a callback to call after all items are processed
  var afterCallback = libs.lodash.after(addresses.length, callback);

  var state = { okItems: [], errorItems: [] };

  libs.lodash.forEach(addresses, function(address) {

    the.sync(address, options, progressCallback,

      function (result) {

        if (result.result != 'ok') {

          state.errorItems.push({ item: address, error: result.error });
          afterCallback({ result: 'ok', okItems: state.okItems, errorItems: state.errorItems });
          return;
        }

        state.okItems.push(address);
        afterCallback({ result: 'ok', okItems: state.okItems, errorItems: state.errorItems });
        return;
      }
    );
  });
}

// sync both normal and escrow orders for given addresses and escrows arrays
the.syncAllMyPurchases = function (addresses, escrows, options, progressCallback, callback) {

  var state = { syncOrders: {}, syncEscrows: {} };

  // prepare a callback to call after orders and escrows processed
  var afterCallback = libs.lodash.after(2, callback);

  // now sync all orders of our items and save result
  the.syncOrdersList(addresses, options, progressCallback, function(result2) {
    state.syncOrders = result2;
    afterCallback({ result: 'ok', syncOrders: state.syncOrders, syncEscrows: state.syncEscrows });
    return;
  });

  // and sync all escrows of our items and save result
  emarket.escrows.syncOrdersList(escrows, false, options, progressCallback, function(result2) {
    state.syncEscrows = result2;
    afterCallback({ result: 'ok', syncOrders: state.syncOrders, syncEscrows: state.syncEscrows });
    return;
  });

  return;
}

// sync both normal and escrow orders
the.syncAllMyOrders = function (options, progressCallback, callback) {

  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  ///TODO: add filter on escrow contract code

  emarket.db.listings.selectWithSender(account, function(result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    var escrowAddresses = {};
    var listingAddresses = [];

    // prepare a map of my escrows
    libs.lodash.forEach(result.items, function(item) {

      escrowAddresses[item.escrow] = true;
      listingAddresses.push(item.address);
    });

    var escrowAddressesArray = [];

    // convert map to array of keys
    libs.lodash.forEach(escrowAddresses, function(value, key) {

      escrowAddressesArray.push(key);
    });

    the.syncAllMyPurchases(listingAddresses, escrowAddressesArray, options, progressCallback, callback);
    return;
  });
}

the.syncInitialPurchases = function (options, progressCallback, callback) {

  ///TODO: add filter on escrow contract code

  emarket.db.listings.select(function(result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    var escrowAddresses = {};
    var listingAddresses = [];

    // prepare a map of my escrows
    libs.lodash.forEach(result.items, function(item) {

      // skip item if the listing has ended
      if(item.endTimestamp <= (Date.now() / 1000)) {
        return true;
      }

      escrowAddresses[item.escrow] = true;
      listingAddresses.push(item.address);
    });

    var escrowAddressesArray = [];

    // convert map to array of keys
    libs.lodash.forEach(escrowAddresses, function(value, key) {

      escrowAddressesArray.push(key);
    });

    the.syncAllMyPurchases(listingAddresses, escrowAddressesArray, options, progressCallback, callback);
    return;
  });
}

the.getOrders = function (goods, callback) {

  getOrdersList([ goods ], function(result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    if (result.items.length == 0) {

      callback({ result: 'ok', orders: [] });
      return;
    }

    var orders = [];
    libs.lodash.forEach(result.items[0].orders, function(value, key) {

      orders.push(value);
    });

    callback({ result: 'ok', orders: orders });
    return;
  });
}

the.getMyOrders = function (options, callback) {

  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  ///TODO: add filter on escrow contract code

  emarket.db.listings.selectWithSender(account, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    getOrdersList(result.items, callback);
  });
}

the.getMyPurchases = function (options, callback) {

  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  ///TODO: add filter on escrow contract code

  emarket.db.listings.selectWithMyPurchases(account, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    getOrdersListWithSender(result.items, account, callback);
  });
}

//private functions

function syncOrdersBody(address, event, options, progressCallback, callback) {

  if (event.synced) {

    callback({ result: 'ok', event: event });
    return;
  }

  progressCallback({ source: the.myname + 'syncOrdersBody', type: 'processing', item: event });

  var datainfo = event.payload;
  var dataobject = JSON.parse(datainfo);

  if (!dataobject) {

    progressCallback({ source: the.myname + 'syncOrdersBody', type: 'error', item: event, error: 'Event parse error' });
    callback({ result: 'error', error: 'Event parse error', type: 'permanent' });
    return;
  }

  var orderItem = {};
  orderItem.height = parseInt(event.blockNumber);
  orderItem.dataInfo = dataobject;
  if (orderItem.dataInfo.private) {
    orderItem.dataInfo.pubkey = myxss.process(orderItem.dataInfo.private.pubkey);
  }

  orderItem.tradeId = myxss.process(dataobject.tradeId);
  orderItem.eventType = parseInt(event.eventType);
  orderItem.count = parseInt(dataobject.count);
  orderItem.payment = myxss.process(event.payment);
  orderItem.sender = myxss.process(event.sender).toLowerCase();
  orderItem.address = address;
  orderItem.version = parseInt(event.version);
  orderItem.blockNumber = parseInt(event.blockNumber);
  orderItem.transactionHash = event.transactionHash;
  orderItem.logIndex = event.logIndex;

  event.order = orderItem;
  var context = { contentCount: 0, height: 0, recentHeight: 0, processed: 0, event: event };

  libs.async.waterfall(
    [
      libs.async.apply(emarket.utils.asyncFindTimestampForEvent, options, context),
      libs.async.apply(saveEventToDB)
    ],

    function (asyncError, asyncResult) {

      if (asyncError) {

        progressCallback({ source: the.myname + 'syncOrdersBody', type: 'error', item: event, error: asyncError.error });
        callback({ result: 'error', error: asyncError.error, type: asyncError.type });
        return;
      }

      progressCallback({ source: the.myname + 'syncOrdersBody', type: 'done', item: asyncResult });
      callback({ result: 'ok', item: asyncResult });
      return;
    }
  );
}

//store event into events DB
function saveEventToDB(context, asyncCallback) {

  var event = context.event;

  //store event status so we do not make unnecessary calls
  emarket.db.events.insert(event, function (result) {

    var payloadData = JSON.parse(event.payload);
    delete payloadData.address;
    delete payloadData.version;
    delete payloadData.sender;
    delete payloadData.eventType;
    delete payloadData.blockNumber;
    delete payloadData.timestamp;
    delete payloadData.tradeId;
    delete payloadData.payload;

    //add payment info into payload
    payloadData.payment = event.payment;

    context.event.order.timestamp = event.timestamp;
    context.event.order.payload = JSON.stringify(payloadData);

    emarket.db.orders.insert(context.event.order, function (result2) {

      asyncCallback(null, context);
      return;
    });

    return;
  });
}

function getBuyingsMap(goods, callback) {

  console.log('getcurve 331', emarket.wallets.wallets.currentWallet);

  var account = emarket.wallets.wallets.currentWallet.getAddressString().toLowerCase();
  var privateKey = emarket.wallets.wallets.currentWallet.getCurve25519PrivateKey();

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

  var state = { buyings: {}, processed: 0, skipped: 0, total: 0 };

  // prepare a callback to call after orders and escrows processed
  var afterCallback = libs.lodash.after(2, callback);

  //search all orders of type = 1 (buy orders)
  emarket.db.orders.selectWithAddressAndEventType(goods.address, 1, function (result) {

    constructOrdersForBuyEvents(result.items, account, privateKey, goods, function(result2) {

      state.buyings = Object.assign(state.buyings, result2.buyings);
      state.processed += result2.processed;
      state.skipped += result2.skipped;
      state.total += result2.total;
      afterCallback({ result: 'ok', buyings: state.buyings,
        processed: state.processed, skipped: state.skipped, total: state.total });
      return;
    });
  });

  //search all orders of type = 5 (fake buy orders)
  emarket.db.orders.selectWithAddressAndEventType(goods.address, 5, function (result) {

    constructOrdersForBuyEvents(result.items, account, privateKey, goods, function(result2) {

      state.buyings = Object.assign(state.buyings, result2.buyings);
      state.processed += result2.processed;
      state.skipped += result2.skipped;
      state.total += result2.total;
      afterCallback({ result: 'ok', buyings: state.buyings,
        processed: state.processed, skipped: state.skipped, total: state.total });
      return;
    });
  });
}

// get orders for listings array
function getOrdersList(listings, callback) {

  if (!listings || (listings.length == 0)) {

    callback({ result: 'ok', items: [] });
    return;
  }

  // prepare a callback to call after all items are processed
  var afterCallback = libs.lodash.after(listings.length, callback);

  var state = { items: [] };

  libs.lodash.forEach(listings, function(item) {

    getBuyingsMap(item, function(result) {

      var itemCopy = libs.lodash.clone(item);
      itemCopy.orders = [];

      libs.lodash.forEach(result.buyings, function(value, key) {
        itemCopy.orders.push(value);
      });

      state.items.push(itemCopy);

      afterCallback({ result: 'ok', items: state.items });
      return;
    });
  });
}

// get orders for listings array filtered by sender
function getOrdersListWithSender(listings, sender, callback) {

  if (!listings || (listings.length == 0)) {

    callback({ result: 'ok', items: [] });
    return;
  }

  // prepare a callback to call after all items are processed
  var afterCallback = libs.lodash.after(listings.length, callback);

  var state = { items: [] };

  libs.lodash.forEach(listings, function(item) {

    getBuyingsMap(item, function(result) {

      var itemCopy = libs.lodash.clone(item);
      itemCopy.orders = [];

      libs.lodash.forEach(result.buyings, function(value, key) {

        if(value.sender.toLowerCase() == sender) {
          itemCopy.orders.push(value);
        }
      });

      state.items.push(itemCopy);

      afterCallback({ result: 'ok', items: state.items });
      return;
    });
  });
}

// use an array of buy events to construct the decrypted history of the trade
function constructOrdersForBuyEvents(buyEvents, account, privateKey, goods, callback) {

  var state = { total: buyEvents && buyEvents.length, processed: 0, skipped: 0, buyings: {} };

  libs.async.filter(buyEvents,
      
    function (buyOrder, callback1) {

      try {

        var buyId = buyOrder.tradeId;
        var payloadData = JSON.parse(buyOrder.payload);

        var dataObject = payloadData.private;

        if (dataObject) {
          buyOrder.pubkey = dataObject.pubkey;
          buyOrder.key = dataObject.key;
        }

        state.buyings[buyId] = buyOrder;
        state.buyings[buyId].orders = [];

        try {

          if ((account.length > 0) && (buyOrder.sender.toLowerCase() == account)) {

            var decKey = emarket.wallets.aes.readSessionKey(libs.ethereumjsUtil.toBuffer(goods.pubkey),
              privateKey, buyOrder.key);

            state.buyings[buyId].key = decKey;
          }

          if ((account.length > 0) && (goods.sender.toLowerCase() == account)) {

            var decKey = emarket.wallets.aes.readSessionKey(libs.ethereumjsUtil.toBuffer(buyOrder.pubkey),
              privateKey, buyOrder.key);

            state.buyings[buyId].key = decKey;
          }
        } catch (err) {

          //skip decryption error
        }

        emarket.db.orders.selectWithTradeId(buyOrder.tradeId, function (result) {

          state.processed++;

          if (result.result != 'ok') {

            state.skipped++;
            callback1(null, false);
            return;
          }

          libs.lodash.forEach(result.items, function (item) {

            // skip escrow deposit event
            if (item.eventType == 14) {
              return true;
            }

            var payloadData = JSON.parse(item.payload);

            var privateMessage = payloadData.private;

            if (!privateMessage) {
              privateMessage = { msg: "" };
            }

            privateMessage.decrypted = false;

            try {

              // TODO : Decryption is not working for getAllPurchases Call. There is some bug. Use console.log in the following catch block to check error
              if ((account.length > 0) && (buyOrder.sender.toLowerCase() == account) ||
                (goods.sender.toLowerCase() == account)) {

                var message = emarket.wallets.aes.decryptForSession(privateMessage, state.buyings[buyOrder.tradeId].key);
                privateMessage.msg = myxss.process(message.msg);
                privateMessage.decrypted = true;
              }
            } catch (err) {

              //skip decryption error
            }

            item.private = privateMessage;

            //decode some fields encoded into payload

            item.payment = payloadData.payment;
            item.count = payloadData.count;

            state.buyings[buyOrder.tradeId].orders.push(item);
          });

          callback1(null, true);
          return;
        });

      } catch (err2) {

        console.log("Error processing order for " + goods.address + " item. " + err2);
        
        //skip order parsing error
        state.skipped++;
        callback1(null, false);
        return;
      }
    },
    function (err, result) {

      if (err) {

        callback(err);
        return;
      }

      callback({ result: 'ok', buyings: state.buyings,
        processed: state.processed, skipped: state.skipped, total: state.total });
      return;
    }
  );
}

module.exports = the