var libs = {};
libs.xss = require('xss');
libs.async = require('async');
libs.lodash = require('lodash');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.default_contracts = require.main.require('./emarket/default_contracts');
emarket.sync = require.main.require('./emarket/sync');
emarket.utils = require.main.require('./emarket/utils');

emarket.ethereum = {};
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.db = {};
emarket.db.escrows = require.main.require('./emarket/db/escrows');
emarket.db.events = require.main.require('./emarket/db/events');
emarket.db.orders = require.main.require('./emarket/db/orders');
emarket.db.contracts = require.main.require('./emarket/db/contracts');

var myxss = new libs.xss.FilterXSS({ whiteList: {} });

emarket.escrows = function () {}

var the = emarket.escrows;
the.myname = 'emarket.escrows';

the.sync = function(address, isIpfs, options, progressCallback, callback) {

  fromContractFields(address, isIpfs, options, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    result.item.height = 0;
    emarket.db.escrows.insert(address, result.item, callback);
  });
}

the.syncOrders = function(address, isIpfs, options, progressCallback, callback) {

  var abi = emarket.default_contracts.escrowContractAbi;

  if(isIpfs) abi = emarket.default_contracts.escrowDirectContractAbi;

  emarket.sync.syncHelper(
    options, the.myname + '.sync',
    address, abi, 'LogEvent',
    function (item) {

      return true;
    },
    syncOrdersBody,
    progressCallback, callback);
}

// sync a list of addresses
the.syncOrdersList = function(addresses, isIpfs, options, progressCallback, callback) {

  if (!addresses || (addresses.length == 0)) {

    callback({ result: 'ok', okItems: [], errorItems: [] });
    return;
  }

  var state = { okItems: [], errorItems: [] };

  // prepare a callback to call after all items are processed
  var afterCallback = libs.lodash.after(addresses.length, callback);

  libs.lodash.forEach(addresses, function(address) {

    the.syncOrders(address, isIpfs, options,
      progressCallback,
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

the.getEscrow = function (address, callback) {

  emarket.db.escrows.select(address, callback);
}

///HACK: we do not have an API to get full list of all orders for all trades. There is no UI
///      to show such information. For arbiter's dashboard we might want to have it.

//Take a list of orders for a given escrow contract address and trade identifier.
the.getEscrowTradeOrders = function (address, tradeId, callback) {

  ///HACK: no encrypted communication service supported for escrow service contract. Hence
  ///      no code to decrypt buyer/seller communication.

  emarket.db.orders.selectWithAddressAndTradeId(address, tradeId, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    var items = [];
    libs.lodash.forEach(result.items, function(order) {

      var payloadData = JSON.parse(order.payload);

      libs.lodash.forEach(payloadData, function(value, key) {

        order[key] = value;
      });

      items.push(order);
    });

    callback({ result: 'ok', items: items });
    return;
  });
}

//find contract version for the escrow contract
the.findContractVersion = function(address, isIpfs, options, callback) {

  var expectedBytecode = emarket.default_contracts.ESCROW_CONTRACT_RUNTIME_BYTECODE;

  if(isIpfs) expectedBytecode = emarket.default_contracts.ESCROW_DIRECT_CONTRACT_RUNTIME_BYTECODE;

  // remove bytecode metadata
  expectedBytecode = expectedBytecode.slice(0, -86);

  emarket.db.contracts.select(address, function (result) {

    // take the contract code from the local DB
    if ((result.result == 'ok') &&
        result.item && result.item.contractCode && (result.item.contractCode.length > 0)) {

      var gotBytecode = result.item.contractCode;
      gotBytecode = gotBytecode.slice(0, -86);

      // found correct contract code in local DB
      if(gotBytecode.endsWith(expectedBytecode)) {

        callback({ result: 'ok', version: 1 });
        return;
      }

      // found wrong contract code in local DB
      callback({ result: 'ok', version: 0 });
      return;
    }

    //no contract code available in local DB - fetch it from outside

    emarket.ethereum.eth.getCode(address, options, function (result2) {

      if (result2.result != 'ok') {

        callback(result2);
        return;
      }

      var code = result2.code;

      //check goods contract
      if (!code || code == '') {

        callback({ result: 'error', error: 'Code not available' });
        return;
      }

      var productContractVersion = 0;

      var gotBytecode = code;
      gotBytecode = gotBytecode.slice(0, -86);

      if (gotBytecode.endsWith(expectedBytecode)) {
        productContractVersion = 1;
      }

      var productContract = { contractCode: code };
      emarket.db.contracts.insert(address, productContract, function (result3) {

        callback({ result: 'ok', version: productContractVersion });
        return;
      });
    });
  });
}

//private functions

//Convert EscrowService contract fields to the escrow fields
function fromContractFields(address, isIpfs, options, callback) {

  var fields = [
    'arbiter',
    'freezePeriod',
    'feePromille',
    'rewardPromille'
  ];

  var abi = emarket.default_contracts.escrowContractAbi;

  if(isIpfs) abi = emarket.default_contracts.escrowDirectContractAbi;

  emarket.ethereum.eth.getFields(address, abi, fields, options, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    var item = result.item;
    var escrowInfo = {};

    escrowInfo.arbiter = myxss.process(item.arbiter).toLowerCase();
    escrowInfo.freezePeriod = parseInt(item.freezePeriod);
    escrowInfo.feePromille = parseInt(item.feePromille);
    escrowInfo.rewardPromille = parseInt(item.rewardPromille);

    callback({ result: 'ok', item: escrowInfo });
    return;
  });
}

function syncOrdersBody(address, event, options, progressCallback, callback) {

  if (event.synced) {

    callback({ result: 'ok', event: event });
    return;
  }

  var datainfo = event.payload;
  var dataobject = JSON.parse(datainfo);

  if (!dataobject) {

    callback({ result: 'error', error: 'Event parse error', type: 'permanent' });
    return;
  }

  var orderItem = {};
  orderItem.height = parseInt(event.blockNumber);
  orderItem.dataInfo = dataobject;
  orderItem.tradeId = myxss.process(dataobject.tradeId);
  orderItem.eventType = parseInt(event.eventType);
  orderItem.payment = myxss.process(event.payment);
  orderItem.sender = myxss.process(event.sender).toLowerCase();

  if(dataobject.recipient) {
    orderItem.recipient = myxss.process(dataobject.recipient).toLowerCase();
  }

  if(event.recipient) {
    orderItem.recipient = myxss.process(event.recipient).toLowerCase();
  }
  
  orderItem.address = address;
  orderItem.version = parseInt(event.version);
  orderItem.blockNumber = parseInt(event.blockNumber);
  orderItem.transactionHash = event.transactionHash;
  orderItem.logIndex = event.logIndex;

  event.order = orderItem;
  var context = { contentCount: 0, height: 0, recentHeight: 0, processed: 0, event: event };

  libs.async.waterfall([
    libs.async.apply(emarket.utils.asyncFindTimestampForEvent, options, context),
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

//store event into events DB
function saveEventToDB(context, asyncCallback) {

  var event = context.event;

  //store event status so we do not make unnecessary calls
  emarket.db.events.insert(event, function (result) {

    var payloadData = JSON.parse(event.payload);
    delete payloadData.address;
    delete payloadData.version;
    delete payloadData.sender;
    delete payloadData.recipient;
    delete payloadData.eventType;
    delete payloadData.blockNumber;
    delete payloadData.timestamp;
    delete payloadData.tradeId;
    delete payloadData.payload;

    // add payment info to payload.
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

module.exports = the
