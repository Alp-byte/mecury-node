var libs = {};
libs.async = require('async');
libs.web3 = require('web3');
libs.crypto = require('crypto');
libs.ethereumjsUtil = require('ethereumjs-util');
libs.lodash = require('lodash');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.default_contracts = require.main.require('./emarket/default_contracts');
emarket.testdata = require.main.require('./emarket/testdata');
emarket.sync = require.main.require('./emarket/sync');
emarket.goods = require.main.require('./emarket/goods');
emarket.escrows = require.main.require('./emarket/escrows');
emarket.utils = require.main.require('./emarket/utils');

emarket.wallets = {};
emarket.wallets.aes = require.main.require('./emarket/wallets/aes');
emarket.wallets.wallets = require.main.require('./emarket/wallets/wallets');

emarket.ethereum = {};
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.db = {};
emarket.db.events = require.main.require('./emarket/db/events');
emarket.db.listings = require.main.require('./emarket/db/listings');
emarket.db.contracts = require.main.require('./emarket/db/contracts');
emarket.db.feedbbt = require.main.require('./emarket/db/feedbbt');
emarket.db.orders = require.main.require('./emarket/db/orders');

emarket.token = {};
emarket.token.api = require.main.require('./emarket/token/api');

emarket.store = function () { }

var the = emarket.store;
the.myname = 'emarket.store';

the.sync = function (options, progressCallback, callback) {

  emarket.sync.syncHelper(
    options, the.myname + '.sync',
    emarket.default_contracts.storeContractAddress, emarket.default_contracts.storeContractAbi, 'LogStore',
    function (item) {
      // console.log('function item', item);
      var datatype = parseInt(item.returnValues.eventType);
      if (datatype != 1) return false;

      return true;
    },
    syncStoreBody,
    progressCallback, callback);
}

the.sell = function (goods, callback) {

  var answer = {};
  var account = emarket.wallets.wallets.currentWallet.getAddressString();
  console.log('sell() from account ' + account);

  //Fix possible invalid fields for the goods object
  if (!goods.tags) goods.tags = [];
  if (!goods.timespan) goods.timespan = 2419200;
  if (!goods.currency) goods.currency = 'ETH';
  if (!goods.escrow) goods.escrow = emarket.default_contracts.defaultEscrowContractAddress;

  goods.pubkey = emarket.wallets.wallets.currentWallet.getCurve25519PublicKeyString();
  console.log('goods ' + JSON.stringify(goods));

  if (emarket.defaults.isTesting) {

    answer.result = 'ok';
    answer.hash = emarket.testdata.sellItemHash;
    callback(answer);
    return;
  }

  emarket.ethereum.api.ethdeploy(
    emarket.wallets.wallets.currentWallet,
    emarket.default_contracts.PRODUCT_CONTRACT_BYTECODE,
    emarket.default_contracts.goodsContractAbi,
    [ goods.escrow, goods.saleCount, '' + goods.price ],
    emarket.defaults.ethTimeoutBlocks,

    function (result) {

      if(!result || !result.contractAddress) {

        callback(result);
        return;
      }

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      goods.address = result.contractAddress.toLowerCase();

      // now we add deployed Product to the store
      storeAdd(goods, function(result2) {

        if (result2.result != 'ok') {

          callback(result2);
          return;
        }

        result2.address = goods.address;
        callback(result2);
        return;
      });
      return;
    });
}

the.getListings = function (options, callback) {

  emarket.db.listings.select(function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    the.listingsFilterEscrow(result.items, options, false, callback);
    return;
  });
}

the.getStoreListings = function (options, callback) {

  emarket.db.listings.selectStoreName(function (result) {

    if (result.result != 'ok') {
      callback(result);
      return;
    }

    the.storenameFilterEscrow(result.items, options, false, callback);
    return;
  });
}

the.selectedStoresListings = function (options, callback) {

  emarket.db.listings.selectSelectedStore(options, function (result) {

    if (result.result != 'ok') {
      callback(result);
      return;
    }

    the.storelistingsFilterEscrow(result.items, options, false, callback);
    return;
    });
}

the.getMyListings = function (callback) {

  console.log('listings get');
  var web3 = new libs.web3(libs.web3.givenProvider);
  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  ///TODO: filter escrow contract

  emarket.db.listings.selectWithSender(account, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    var items = [];
    libs.lodash.forEach(result.items, function(item) {

      var goodsItem = emarket.goods.fromDb(item);
      goodsItem.priceEth = web3.utils.fromWei(goodsItem.price, 'ether');
      items.push(goodsItem);
    });

    callback({ result: 'ok', items: items });
    return;
  });
}

the.buy = function (goods, count, payment, privateMessage, callback) {

  var answer = {};
  var web3 = new libs.web3(libs.web3.givenProvider);
  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  console.log('buy() from account ' + account);

  var rndbuf = libs.crypto.randomBytes(8);
  var tradeId =  web3.utils.toBN('0x' + rndbuf.toString('hex')).toString();

  var datainfo = {};
  var escrowDatainfo = {};
  //private key for encryption
  var encPrivkey = emarket.wallets.wallets.currentWallet.getCurve25519PrivateKey();
  var encPubkeyStr = emarket.wallets.wallets.currentWallet.getCurve25519PublicKeyString();
  var key = emarket.wallets.aes.createSessionKey(encPrivkey, libs.ethereumjsUtil.toBuffer(goods.pubkey));
  var encMessage = emarket.wallets.aes.encryptForSession(privateMessage, key);

  //add sender pubkey
  encMessage.pubkey = encPubkeyStr;

  //remove sensitive information
  delete encMessage.key.key;

  datainfo.private = encMessage;

  if (emarket.defaults.isTesting) {

    console.log('datainfo: ' + JSON.stringify(datainfo));
    answer.result = 'ok';
    answer.hash = emarket.testdata.buyItemHash;
    answer.tradeId = tradeId;
    answer.key = key;
    callback(answer);
    return;
  }

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    goods.address,
    emarket.default_contracts.goodsContractAbi,
    'buy',
    [ emarket.defaults.marketVersion, tradeId, JSON.stringify(datainfo), JSON.stringify(escrowDatainfo), count ],
    payment,
    emarket.defaults.ethTimeoutBlocks,

    function (result) {

      ///TODO: what is this temp order? Looks weird.
      /*let temp_order = {
        transactionHash: result.hash,
        address: goods.address,
        logIndex: 1,
        version: 1,
        sender: account,
        recipient: goods.sender,
        eventType: 1,
        blockNumber: '',
        tradeId: tradeId,
        payload: '{}',
        timestamp: Date.now() / 1000
      };

      emarket.db.orders.insert(temp_order, function(result2) {
      });*/

      result.tradeId = tradeId;
      result.key = key;
      callback(result);
      return;
    }
  );
}

the.fakeBuy = function (goods, sessionKey, buyer, tradeId, count, payment,
  buyerPrivateMessage, privateMessage, callback) {

  var answer = {};
  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  console.log('fakeBuy() from account ' + account);

  var datainfo = {};
  var encPubkeyStr = emarket.wallets.wallets.currentWallet.getCurve25519PublicKeyString();
  var encMessage = { msg: '' };

  if(sessionKey.key) {

    encMessage = emarket.wallets.aes.encryptForSession(privateMessage, sessionKey);
  }

  //add sender pubkey
  encMessage.pubkey = encPubkeyStr;

  //remove key info - not needed
  delete encMessage.key;

  datainfo.private = encMessage;

  if (emarket.defaults.isTesting) {

    console.log('datainfo: ' + JSON.stringify(datainfo));
    answer.result = 'ok';
    answer.hash = emarket.testdata.buyItemHash;
    answer.tradeId = tradeId;
    answer.key = key;
    callback(answer);
    return;
  }

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    goods.address,
    emarket.default_contracts.goodsContractAbi,
    'fakeBuy',
    [ emarket.defaults.marketVersion, tradeId, buyer,
      JSON.stringify(buyerPrivateMessage), JSON.stringify(datainfo), payment, count ],
    '0',
    emarket.defaults.ethTimeoutBlocks,
    callback
  );
}

the.cancel = function (goods, callback) {

  var answer = {};
  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  console.log('cancel() from account ' + account);

  var datainfo = {};

  if (emarket.defaults.isTesting) {

    answer.result = 'ok';
    answer.hash = emarket.testdata.cancelItemHash;
    callback(answer);
    return;
  }

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    goods.address,
    emarket.default_contracts.goodsContractAbi,
    'cancel',
    [ emarket.defaults.marketVersion, JSON.stringify(datainfo) ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function (result) {

      if(result.result != 'ok') {

        callback(result);
        return;
      }

      console.log('Result', result.result);

      ///TODO: mark as deleted instead of deleting from DB

      emarket.db.listings.delete(goods,(obj)=>{
        console.log('Successfully Cancelled');
      });

      callback(result);
      return;
    }
  );
}

///HACK: requires decrypted sessionKey. This key can be found encrypted for the seller in Buy request. Requires
///      seller's private key for decryption. Use emarket.wallets.aes.readSessionKey() for convenience.
the.accept = function (goods, sessionKey, tradeId, privateMessage, callback) {

  var answer = {};
  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  console.log('accept() from account ' + account);

  var datainfo = {};
  var encPubkeyStr = emarket.wallets.wallets.currentWallet.getCurve25519PublicKeyString();
  var encMessage = emarket.wallets.aes.encryptForSession(privateMessage, sessionKey);

  //add sender pubkey
  encMessage.pubkey = encPubkeyStr;

  //remove key info - not needed
  delete encMessage.key;

  datainfo.private = encMessage;

  if (emarket.defaults.isTesting) {

    console.log('datainfo: ' + JSON.stringify(datainfo));
    answer.result = 'ok';
    answer.hash = emarket.testdata.acceptItemHash;
    answer.tradeId = tradeId;
    answer.key = sessionKey;
    callback(answer);
    return;
  }

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    goods.address,
    emarket.default_contracts.goodsContractAbi,
    'accept',
    [ emarket.defaults.marketVersion, tradeId, JSON.stringify(datainfo) ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function (result) {

      result.tradeId = tradeId;
      result.key = sessionKey;
      callback(result);
    }
  );
}

///HACK: requires decrypted sessionKey. This key can be found encrypted for the seller in Buy request. Requires
///      seller's private key for decryption. Use emarket.wallets.aes.readSessionKey() for convenience.
the.reject = function (goods, sessionKey, tradeId, privateMessage, callback) {

  var answer = {};
  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  console.log('reject() from account ' + account);

  var datainfo = {};
  var escrowDatainfo = {};
  var encPubkeyStr = emarket.wallets.wallets.currentWallet.getCurve25519PublicKeyString();
  var encMessage = emarket.wallets.aes.encryptForSession(privateMessage, sessionKey);

  //add sender pubkey
  encMessage.pubkey = encPubkeyStr;

  //remove key info - not needed
  delete encMessage.key;

  datainfo.private = encMessage;

  if (emarket.defaults.isTesting) {

    console.log('datainfo: ' + JSON.stringify(datainfo));
    answer.result = 'ok';
    answer.hash = emarket.testdata.rejectItemHash;
    answer.tradeId = tradeId;
    answer.key = sessionKey;
    callback(answer);
    return;
  }

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    goods.address,
    emarket.default_contracts.goodsContractAbi,
    'reject',
    [ emarket.defaults.marketVersion, tradeId, JSON.stringify(datainfo), JSON.stringify(escrowDatainfo) ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function (result) {

      result.tradeId = tradeId;
      result.key = sessionKey;
      callback(result);
    }
  );
}

the.getItem = function (address, options, progressCallback, callback) {

  if (emarket.defaults.isTesting) {

    var matchIndex = libs.lodash.findIndex(emarket.testdata.allListings,

      function(item) { return item.address == address; }
    );

    if(matchIndex < 0) {

      callback({ result: 'ok', item: {} });
      return;
    }

    var item = emarket.testdata.allListings[matchIndex];
    callback({ result: 'ok', item: item });
    return;
  }

  //update status for the item when it is requested
  var goods = { address: address };
  updateListing(goods, options, progressCallback,

    function (result) {

      if (result.result != 'ok') {
        callback(result);
        return;
      }

      var goodsItem = emarket.goods.fromDb(result.item);
      callback({ result: 'ok', item: goodsItem });
      return;
    }
  );
}

the.listingsFilterEscrow = function(listings, options, isIpfs, callback) {

  var web3 = new libs.web3(libs.web3.givenProvider);

  if (!listings || (listings.length == 0)) {

    callback({ result: 'ok', items: [], processed: 0, skipped: 0 });
    return;
  }

  var state = { items: [], total: listings.length, processed: 0, skipped: 0, i: 0 };

  libs.async.filterLimit(listings, 1,

    function(item, callback1) {

      state.i++;
      state.processed++;

      var goodsItem = emarket.goods.fromDb(item);

      if(goodsItem.escrow.length == 0) {

        state.skipped++;
        callback1(null, true);
        return;
      }

      emarket.escrows.findContractVersion(goodsItem.escrow, isIpfs, options, function(result2) {

        if(result2.result != 'ok') {

          state.skipped++;
          callback1(null, true);
          return;
        }

        if(result2.version != 1) {

          state.skipped++;
          callback1(null, true);
          return;
        }

        goodsItem.priceEth = web3.utils.fromWei(goodsItem.price, 'ether');
        state.items.push(goodsItem);
        callback1(null, true);
        return;
      });
    },

    function(err, result3) {

      if(err) {

        callback(err);
        return;
      }

      callback({ result: 'ok', items: state.items, processed: state.processed, skipped: state.skipped });
      return;
    }
  );
}

//private functions

//callback fired when all items are synced either successfully or not
function syncStoreBody(address, event, options, progressCallback, callback) {

  if (event.synced) {

    callback({ result: 'ok', event: event });
    return;
  }

  var datainfo = event.payload;
  var dataobject = JSON.parse(datainfo);

  dataobject.height = parseInt(event.blockNumber);
  dataobject.blockNumber = parseInt(event.blockNumber);
  dataobject.version = parseInt(event.version);
  dataobject.timestamp = parseInt(event.timestamp);
  dataobject.sender = event.sender.toLowerCase();

  var goodsItem = emarket.goods.fromStoreData({}, dataobject);
  if (!goodsItem) {

    callback({ result: 'error', error: 'Listing parse error', type: 'permanent' });
    return;
  }

  if (!goodsItem.address || goodsItem.address == '') {

    callback({ result: 'error', error: 'Address parse error', type: 'permanent' });
    return;
  }

  if (goodsItem.address.length != 42) {

    console.log('Wrong goods address: ' + goodsItem.address);
  }

  event.goods = goodsItem;

  var context = { contentCount: 0, height: 0, recentHeight: 0, processed: 0, event: event };

  libs.async.waterfall([

    libs.async.apply(checkContractVersion, context),
    libs.async.apply(findContractVersionForListing, options),
    libs.async.apply(checkCorrectVersion, options),
    libs.async.apply(emarket.utils.asyncFindTimestampForEvent, options),
    libs.async.apply(saveEventToDB),
    libs.async.apply(syncLoadedEvents, options, progressCallback)
  ],
    function (asyncError, asyncResult) {

      if (asyncError) {

        callback({ result: 'error', error: asyncError.error, type: asyncError.type });
        return;
      }

      callback({ result: 'ok', item: asyncResult });
    }
  );
}

//check contract version in db
function checkContractVersion(context, asyncCallback) {

  var event = context.event;

  if (typeof event.productContractVersion !== 'undefined') {

    asyncCallback(null, context);
    return;
  }

  //productContractVersion not available - check contract code
  //look for existing record for this contract
  emarket.db.contracts.select(event.goods.address, function (result) {

    if (result.result != 'ok') {

      asyncCallback({ error: result.error, type: 'temporary' }, null);
      return;
    }

    context.event.productContract = result.item;
    asyncCallback(null, context);
    return;
  });
}

//find contract version for the listing
function findContractVersionForListing(options, context, asyncCallback) {

  var event = context.event;
  if (typeof event.productContractVersion !== 'undefined') {

    asyncCallback(null, context);
    return;
  }

  // remove bytecode metadata
  var expectedBytecode = emarket.default_contracts.PRODUCT_CONTRACT_RUNTIME_BYTECODE;
  expectedBytecode = expectedBytecode.slice(0, -86);

  if (event.productContract.contractCode && (event.productContract.contractCode.length > 0)) {

    var productContractVersion = 0;

    var gotBytecode = event.productContract.contractCode;
    gotBytecode = gotBytecode.slice(0, -86);

    if (gotBytecode.endsWith(expectedBytecode)) {
      productContractVersion = 1;
    }

    context.event.productContractVersion = productContractVersion;
    asyncCallback(null, context);
    return;
  }

  //no contract code available in local DB - fetch it from outside
  emarket.ethereum.eth.getCode(event.goods.address, options, function (result) {

    if (result.result != 'ok') {

      asyncCallback({ error: result.error, type: 'temporary' }, null);
      return;
    }

    var code = result.code;
    //check goods contract
    if (!code || code == '') {

      asyncCallback({ error: result.error, type: 'temporary' }, null);
      return;
    }

    var productContractVersion = 0;

    var gotBytecode = code;
    gotBytecode = gotBytecode.slice(0, -86);

    if (gotBytecode.endsWith(expectedBytecode)) {
      productContractVersion = 1;
    }

    context.event.productContractVersion = productContractVersion;
    context.event.productContract = { contractCode: code };
    emarket.db.contracts.insert(event.goods.address, context.event.productContract, function (result2) {

      asyncCallback(null, context);
      return;
    });

    return;
  });
}

// check correct product version
function checkCorrectVersion(options, context, asyncCallback) {

  var event = context.event;

  if(event.productContractVersion == 1) {

    asyncCallback(null, context);
    return;
  }

  asyncCallback({ error: 'Wrong Product contract', type: 'permanent' }, null);
}

//store event into events DB
function saveEventToDB(context, asyncCallback) {

  var event = context.event;

  if(event.productContractVersion != 1) {

    asyncCallback({ error: 'Wrong Product contract version', type: 'permanent' }, null);
    return;
  }

  //store event status so we do not make unnecessary calls
  emarket.db.events.insert(event, function (result) {

    context.event.goods.timestamp = event.timestamp;

    //look for existing record for this event
    emarket.db.listings.selectWithAddress(event.goods.address, function (result2) {

      if (result2.result != 'ok') {

        asyncCallback({ error: result2.error, type: 'temporary' }, null);
        return;
      }

      // skip if DB record exists
      if (result2.items.length > 0) {

        asyncCallback(null, context);
        return;
      }

      //no item found - we can create new record
      var goodsItem = libs.lodash.clone(context.event.goods);
      var goodsDB = emarket.goods.toDb(goodsItem);

      emarket.db.listings.insert(goodsDB, function (result3) {

        context.event.goods = goodsDB;
        asyncCallback(null, context);
        return;
      });
    });
  });
}

//events loaded - sync them
function syncLoadedEvents(options, progressCallback, context, asyncCallback) {

  //for the new item or not yet synced event - update goods status
  updateListing(context.event.goods, options, progressCallback,

    function (result) {

      if (result.result != 'ok') {

        asyncCallback({ error: result.error, type: 'temporary', context: context }, null);
        return;
      }

      asyncCallback(null, context);
      return;
    }
  );
}

//update goods status from the contract
function updateListing(goods, options, progressCallback, callback) {

  emarket.db.listings.selectWithAddress(goods.address, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    if (result.items.length == 0) {

      callback({ result: 'error', error: 'No item found' });
      return;
    }

    var item = result.items[0];

    (function (item) {

      console.log('Updating the item ' + item.address);
      progressCallback({ source: the.myname + 'updateListing', type: 'processing', item: item.address });

      emarket.goods.fromProductFields(item, options, function (result2) {

        if (result2.result != 'ok') {

          console.log('result is not OK', result2);
          progressCallback({ source: the.myname + 'updateListing', type: 'error', error: result2.error });
          callback(result2);
          return;
        }

        emarket.db.listings.insert(result2.item, function (result3) {

          console.log('Updating the item ' + item.address + ' done');
          progressCallback({ source: the.myname + 'updateListing', type: 'done', item: item.address });

          callback({ result: 'ok', item: result2.item });
          return;
        });

        return;
      });
    })(item);
  });
}

the.storenameFilterEscrow = function(listings, options, isIpfs, callback) {

  var web3 = new libs.web3(libs.web3.givenProvider);

  if (!listings || (listings.length == 0)) {

    callback({ result: 'ok', items: [], processed: 0, skipped: 0 });
    return;
  }

  var state = { items: [], total: listings.length, processed: 0, skipped: 0, i: 0 };

  libs.async.filterLimit(listings, 1,

    function(item, callback1) {

      state.i++;
      state.processed++;

      if(item.escrow.length == 0) {

        state.skipped++;
        callback1(null, true);
        return;
      }

      emarket.escrows.findContractVersion(item.escrow, isIpfs, options, function(result2) {

        if(result2.result != 'ok') {

          state.skipped++;
          callback1(null, true);
          return;
        }

        if(result2.version != 1) {

          state.skipped++;
          callback1(null, true);
          return;
        }

        state.items.push(item);
        callback1(null, true);
        return;
      });
    },
    function(err, result3) {

      if(err) {

        callback(err);
        return;
      }
      callback({ result: 'ok', items: state.items, processed: state.processed, skipped: state.skipped });
      return;
    }
  );
}

the.storelistingsFilterEscrow = function(listings, options, isIpfs, callback) {

  var web3 = new libs.web3(libs.web3.givenProvider);

  if (!listings || (listings.length == 0)) {

    callback({ result: 'ok', items: [], processed: 0, skipped: 0 });
    return;
  }

  var state = { items: [], total: listings.length, processed: 0, skipped: 0, i: 0 };

  libs.async.filterLimit(listings, 1,

    function(item, callback1) {

      state.i++;
      state.processed++;

      var goodsItem = emarket.goods.fromDb(item);

      if(goodsItem.escrow.length == 0) {

        state.skipped++;
        callback1(null, true);
        return;
      }

      emarket.escrows.findContractVersion(goodsItem.escrow, isIpfs, options, function(result2) {

        if(result2.result != 'ok') {

          state.skipped++;
          callback1(null, true);
          return;
        }

        if(result2.version != 1) {

          state.skipped++;
          callback1(null, true);
          return;
        }

        goodsItem.priceEth = web3.utils.fromWei(goodsItem.price, 'ether');
        state.items.push(goodsItem);
        callback1(null, true);
        return;
      });
    },
    function(err, result3) {

      if(err) {

        callback(err);
        return;
      }
      callback({ result: 'ok', items: state.items, processed: state.processed, skipped: state.skipped });
      return;
    }
  );
}


function storeAdd(goods, callback) {

  if (goods.timespan > emarket.defaults.defaultExpireTime) {
    goods.timespan = emarket.defaults.defaultExpireTime;
  }

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    emarket.default_contracts.storeContractAddress,
    emarket.default_contracts.storeContractAbi,
    'add',
    [ emarket.defaults.marketVersion, 1, goods.timespan, JSON.stringify(emarket.goods.toStoreData(goods)) ],
    '0',
    emarket.defaults.ethTimeoutBlocks,
    callback
  );
}

module.exports = the
