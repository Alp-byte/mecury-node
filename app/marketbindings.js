var libs = {};
libs.ethereumjsUtil = require('ethereumjs-util');
libs.lodash = require('lodash');
libs.events = require('events');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.state = require.main.require('./emarket/state');
emarket.sync = require.main.require('./emarket/sync');
emarket.alias = require.main.require('./emarket/alias');
emarket.blacklist = require.main.require('./emarket/blacklist');
emarket.store = require.main.require('./emarket/store');
emarket.storeblacklisted = require.main.require('./emarket/storeblacklisted');
emarket.orders = require.main.require('./emarket/orders');
emarket.dispute = require.main.require('./emarket/dispute');
emarket.feedbbt = require.main.require('./emarket/feedbbt');
emarket.escrows = require.main.require('./emarket/escrows');

emarket.wallets = {};
emarket.wallets.aes = require.main.require('./emarket/wallets/aes');
emarket.wallets.wallets = require.main.require('./emarket/wallets/wallets');
emarket.wallets.myetherwallet = require.main.require('./emarket/wallets/myetherwallet');

emarket.token = {};
emarket.token.api = require.main.require('./emarket/token/api');

emarket.db = {};
emarket.db.transactions = require.main.require('./emarket/db/transactions');
emarket.db.stores = require.main.require('./emarket/db/stores');

emarket.gas = {};
emarket.gas.priceestimate = require.main.require('./emarket/gas/priceestimate');

emarket.ethereum = {};
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');

emarket.ipfs = {};
emarket.ipfs.api = require.main.require('./emarket/ipfs/api');
emarket.ipfs.contract = require.main.require('./emarket/ipfs/contract');
emarket.ipfs.storage = require.main.require('./emarket/ipfs/storage');
emarket.ipfs.store = require.main.require('./emarket/ipfs/store');
emarket.ipfs.orders = require.main.require('./emarket/ipfs/orders');

marketbindings = function () { }

var the = marketbindings;
the.name = 'marketbindings';

the.keyStorePath = './keystore';
the.eventEmitter = new libs.events();

//store API

the.emarketSyncStore = function (request, callback, progressCallback = null) {

  console.log('SyncStore started')
  emarket.store.sync(request.options,

    // progress callback
    function (result) {
      if (progressCallback) progressCallback(result);
      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback
  );
}

the.emarketAllListings = function (request, callback) {

  //first sync
  emarket.store.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      //and get synced listings
      emarket.store.getListings(request.options, function (listings) {

        callback(listings);
        return;
      });
    }
  );
}

the.emarketMyListings = function (request, callback) {
  console.log('myListings CALL');

  //first sync
  emarket.store.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      //and get synced listings
      emarket.store.getMyListings(function (listings) {

        callback(listings);
        return;
      });
    }
  );
}

the.emarketGetAllStoreName = function (request, callback) {
  //first sync
  emarket.store.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      //and get synced listings
      emarket.store.getStoreListings(request.options, function (listings) {

        callback(listings);
        return;
      });
    }
  );
}

the.emarketGetAllIPFSStoreName = function (request, callback) {

  //first sync
  emarket.ipfs.store.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      //and get synced listings
      emarket.ipfs.store.getIPFSStoreListings(request.options, function (listings) {

        callback(listings);
        return;
      });
    }
  );
}

the.emarketGetSelectedStoreItem = function (request, callback) {

  var store = request.storename;

  //first sync
  emarket.store.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      //and get synced listings
      emarket.store.selectedStoresListings(store, function (listings) {

        callback(listings);
        return;
      });
    }
  );
}

the.emarketgetIPFSSelectedStoreItem = function (request, callback) {

  //first sync
  emarket.ipfs.store.sync(request.storename,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      //and get synced listings
      emarket.ipfs.store.selectedIPFSStoresListings(request.storename, function (listings) {

        callback(listings);
        return;
      });
    }
  );
}


the.emarketBlacklistAllListings = function (request, callback) {

  //first sync
  emarket.store.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      //and get synced listings with blacklisting applied
      emarket.storeblacklisted.getListings(function (listings) {

        callback(listings);
        return;
      });
    }
  );
}

the.emarketGetItem = function (request, callback) {

  emarket.store.getItem(request.address, request.options,

    //progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    //get item callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      var item = result.item;
      if (!item.address) {

        callback({ result: 'error', error: 'Listing ' + request.address + ' not found' });
        return;
      }

      emarket.orders.sync(request.address, request.options,

        // orders progress callback
        function (result2) {

          the.eventEmitter.emit('sync', result2);
          return;
        },

        // orders sync callback
        function (result2) {

          if (result2.result != 'ok') {

            callback(result2);
            return;
          }

          emarket.orders.getOrders(item, function (result3) {

            if (result3.result != 'ok') {

              callback(result3);
              return;
            }

            callback({ result: 'ok', item: item, orders: result3.orders });
            return;
          });
        }
      );
    }
  );
}

the.emarketListItem = function (request, callback) {

  emarket.store.sell(request.goods, function (answer) {

    console.log(JSON.stringify(answer));
    callback(answer);
  });
}

the.emarketBuyItem = function (request, callback) {

  emarket.store.buy(request.goods, request.count, request.payment,
    request.privateMessage, function (answer) {

      console.log(JSON.stringify(answer));
      callback(answer);
    });
}

the.emarketCancelItem = function (request, callback) {

  emarket.store.cancel(request.goods, function (answer) {

    console.log(JSON.stringify(answer));
    callback(answer);
  });
}

//request.senderKey - public key of the buyer
//request.key - encrypted session key (created by the buyer)
//request.goods - should contain goods contract address
//request.tradeId - escrow trade id (created by the buyer)
//request.count - how many to accept
//request.privateMessage - private message to the buyer
the.emarketAcceptBuy = function (request, callback) {

  //shows error utils not defined
  var senderKey = libs.ethereumjsUtil.toBuffer(request.senderKey);
  var recipientKey = emarket.wallets.wallets.currentWallet.getCurve25519PrivateKey();

  ///TODO: use decrypted session key if available
  
  emarket.wallets.aes.readSessionKey(senderKey, recipientKey, request.key);
  emarket.store.accept(request.goods, request.key, request.tradeId,
    request.privateMessage, function (answer) {

      console.log(JSON.stringify(answer));
      callback(answer);
    });
}

//request.senderKey - public key of the buyer
//request.key - encrypted session key (created by the buyer)
//request.goods - should contain goods contract address
//request.tradeId - escrow trade id (created by the buyer)
//request.sender - buyer account
//request.count - how many to reject
//request.payment - how many ETH to return
//request.privateMessage - private message to the buyer
the.emarketRejectBuy = function (request, callback) {

  //shows error utils not defined
  var senderKey = libs.ethereumjsUtil.toBuffer(request.senderKey);
  var recipientKey = emarket.wallets.wallets.currentWallet.getCurve25519PrivateKey();

  emarket.wallets.aes.readSessionKey(senderKey, recipientKey, request.key);
  emarket.store.reject(request.goods, request.key, request.tradeId,
    request.privateMessage, function (answer) {

      console.log(JSON.stringify(answer));
      callback(answer);
    });
}

//wallets API

//create new wallet and use as default
the.emarketCreateWallet = function (request, callback) {

  emarket.wallets.wallets.createWallet(the.keyStorePath, request.index, request.password, callback);
}

//use an existing wallet
the.emarketUseWallet = function (request, callback) {

  emarket.wallets.wallets.useWallet(the.keyStorePath, request.index, request.password, callback);
}

//get a list of existing wallets
the.emarketListWallets = function (request, callback) {

  emarket.wallets.wallets.listWallets(the.keyStorePath, callback);
}

//get current wallet
the.emarketCurrentWallet = function (request, callback) {

  callback({ result: 'ok', wallet: emarket.wallets.wallets.currentWallet });
}

the.emarketCheckWallet = function (request, callback) {

  emarket.wallets.wallets.checkWallet(the.keyStorePath, callback);
}

//orders API

the.emarketSyncOrders = function (request, callback) {

  emarket.orders.sync(request.address, request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback
  );
}

the.emarketSyncAllMyOrders = function (request, callback) {

  emarket.orders.syncAllMyOrders(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

the.emarketSyncAllMyPurchases = function(request, callback) {

  emarket.orders.syncAllMyPurchases(request.addresses, request.escrows, request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

the.emarketSyncInitialPurchases = function (request, callback) {

  emarket.orders.syncInitialPurchases(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

the.emarketGetOrders = function (request, callback) {

  emarket.orders.sync(request.goods.address, request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      emarket.orders.getOrders(request.goods, callback);
      return;
    }
  );
}

the.emarketGetMyOrders = function (request, callback) {
  emarket.orders.getMyOrders(request.options, callback);
}

the.emarketGetMyPurchases = function (request, callback) {
  emarket.orders.getMyPurchases(request.options, callback);
}

//alias API

the.emarketAliasGetName = function (request, callback) {

  var address = request.address;
  emarket.alias.getName(address, callback);
}

the.emarketAliasGetAddress = function (request, callback) {

  var name = request.name;
  emarket.alias.getAddress(name, callback);
}

the.emarketAliasCreate = function (request, callback) {

  var name = request.name;
  emarket.alias.reserve(name, callback);
}

//blacklist API

the.emarketSyncBlacklist = function (request, callback) {

  emarket.blacklist.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback
  );
}

the.emarketIsBlacklisted = function (request, callback) {

  var address = request.address;

  emarket.blacklist.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      emarket.blacklist.isBlacklisted(address, callback);
      return;
    }
  );
}

the.emarketAttachBlacklist = function (request, callback) {

  var address = request.address;
  emarket.storeblacklisted.attachBlacklist(address);
  callback({ result: 'ok' });
  return;
}

the.emarketDetachBlacklist = function (request, callback) {

  var address = request.address;
  emarket.storeblacklisted.detachBlacklist(address);
  callback({ result: 'ok' });
  return;
}

//dispute API

the.emarketOpenDispute = function (request, callback) {

  var senderKey = libs.ethereumjsUtil.toBuffer(request.senderKey);
  var recipientKey = emarket.wallets.wallets.currentWallet.getCurve25519PrivateKey();

  if (typeof request.isIpfs == 'undefined') request.isIpfs = false;

  emarket.wallets.aes.readSessionKey(senderKey, recipientKey, request.key);
  emarket.dispute.open(request.goods, request.key, request.tradeId,
    request.privateMessage, request.isIpfs, function (answer) {

      console.log(JSON.stringify(answer));
      callback(answer);
    });
}

the.emarketCloseDispute = function (request, callback) {

  var senderKey = libs.ethereumjsUtil.toBuffer(request.senderKey);
  var recipientKey = emarket.wallets.wallets.currentWallet.getCurve25519PrivateKey();

  if (typeof request.isIpfs == 'undefined') request.isIpfs = false;

  emarket.wallets.aes.readSessionKey(senderKey, recipientKey, request.key);
  emarket.dispute.close(request.goods, request.key, request.tradeId,
    request.privateMessage, request.isIpfs, function (answer) {

      console.log(JSON.stringify(answer));
      callback(answer);
    });
}

the.emarketClaimDispute = function (request, callback) {

  emarket.dispute.claim(request.goods, request.tradeId, request.isIpfs, function (answer) {

    console.log(JSON.stringify(answer));
    callback(answer);
  });
}

//ethereum API

//get balance of the address
the.emarketGetBalance = function (request, callback) {

  var address = request.address;
  emarket.ethereum.api.getbalance(address, callback);
}

//send money to desired address
the.emarketSendMoney = function (request, callback) {

  var recipient = request.address;
  var amount = request.amount;
  var wallet = emarket.wallets.wallets.currentWallet;
  var a = JSON.stringify(wallet);
  var b = JSON.parse(a);
  var c = b.address;
  var newamount = amount + " " + 'ETH';

  var item = [
    recipient, newamount, c
  ];
  emarket.ethereum.api.ethsend(wallet, amount, recipient, emarket.defaults.ethTimeoutBlocks, callback);
  emarket.db.transactions.insert(item, function (result2, err) {
    if (err) {
      console.log("Error");
    }
    else {
      console.log(JSON.stringify(wallet), "Success");
    }
  }, callback);
};

//token API

//get balance of the address
the.emarketGetBalanceBBT = function (request, callback) {

  var address = request.address;
  emarket.token.api.getBalance(address, callback);
}

//send money to desired address
the.emarketSendMoneyBBT = function (request, callback) {

  var recipient = request.address;
  var amount = request.amount;
  var wallet = emarket.wallets.wallets.currentWallet;
  var a = JSON.stringify(wallet);
  var b = JSON.parse(a);
  var c = b.address;
  var newamount = amount + " " + 'BBT';

  var item = [
    recipient, newamount, c
  ];

  emarket.token.api.send(wallet, amount, recipient, callback);
  emarket.db.transactions.insert(item, function (result2, err) {
    if (err) {
      console.log("Error");
    }
    else {
      console.log(JSON.stringify(wallet), "Success");
    }
  }, callback);

}

//get decimals of the token
the.emarketGetDecimalsBBT = function (request, callback) {

  emarket.token.api.getDecimals(callback);
}

//BBT feed API

the.emarketSyncFeedBBT = function (request, callback) {

  emarket.feedbbt.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback
  );
}

the.emarketGetFeedsBBT = function (request, callback) {

  //var limitHeight = request.limitHeight;
  emarket.feedbbt.getFeeds(callback);
}

//escrows API

the.emarketSyncEscrow = function (request, callback) {

  emarket.escrows.sync(request.address, false, request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

the.emarketGetEscrow = function (request, callback) {

  emarket.escrows.getEscrow(request.address, callback);
}

the.emarketSyncEscrowOrders = function (request, callback) {

  emarket.escrows.syncOrders(request.address, false, request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

the.emarketGetEscrowTradeOrders = function (request, callback) {

  emarket.escrows.getEscrowTradeOrders(request.address, request.tradeId, callback);
}

// gas API

the.emarketGasPriceEstimateWithBlocks = function (request, callback) {

  if (!request.options.sampleBlocks) request.options.sampleBlocks = 100;

  emarket.gas.priceestimate.estimate(request.options, callback);
}

the.emarketSetGas = function (request, callback) {

  emarket.ethereum.api.setGasPrice(request.gas);
  callback({ result: 'ok' });
}

// IPFS API

// check if IPFS daemon is running
the.emarketIpfsIsDaemonActive = function (request, callback) {

  emarket.ipfs.api.isDaemonActive(callback);
}

// sync with the contract and fetches file hashes added to the contract.
// Might contain removals of some items.
the.emarketIpfsContractSync = function (request, callback) {

  emarket.ipfs.contract.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

// get all locally stored file hashes.
the.emarketIpfsGetHashes = function(request, callback) {
  emarket.ipfs.contract.hashes(request.options, callback);
}

the.emarketIpfsStorageSync = function (request, callback) {

  emarket.ipfs.storage.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

// add file to the storage. Contract is populated with new file hash.
the.emarketIpfsStorageAdd = function (request, callback) {

  var file = request.file;
  if ((typeof request.file) == 'undefined') {

    var wallet = emarket.wallets.wallets.currentWallet;

    file = { items: [request.goods], sender: wallet.getAddressString() };
    emarket.ipfs.storage.add(request.options, file, callback);
    return;
  }

  emarket.ipfs.storage.add(request.options, file, callback);
}

// get locally stored file hashes for given user and fetch associated IPFS data.
the.emarketIpfsStorageGet = function(request, callback) {
  emarket.ipfs.storage.get(request.account, request.options, callback);
}

// get all locally stored file hashes and fetch associated IPFS data.
the.emarketIpfsStorageGetAll = function(request, callback) {
  emarket.ipfs.storage.getAll(request.options, callback);
}

// sync IPFS listings
the.emarketIpfsStoreSync = function (request, callback) {

  if (!request.options) request.options = {};

  emarket.ipfs.store.sync(request.options,

    // progress callback
    function (result) {

      // console.log('ipfsStoreSync progress', result);
      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

// list an item using IPFS storage.
the.emarketIpfsStoreSell = function(request, callback) {
  emarket.ipfs.store.sell(request.options, request.goods, callback);
}

// get all listings from IPFS
the.emarketIpfsStoreAllListings = function (request, callback) {

  //first sync
  emarket.ipfs.store.sync(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      //and get synced listings
      emarket.ipfs.store.getListings(request.options, function (listings) {

        callback(listings);
        return;
      });
    }
  );
}

the.emarketIpfsStoreMyListings = function (request, callback) {

  var options = {};

  if (request.options && request.options.noCaching) options.noCaching = true;


  emarket.ipfs.store.getMyListings(options, function (listings) {

    callback(listings);
    return;
  });
}

the.emarketIpfsStoreGetItem = function (request, callback) {

  var options = {};

  if (request.options && request.options.noCaching) options.noCaching = true;

  emarket.ipfs.store.getItem(options, request.hashIpfs, request.addressIpfs, callback);
}

// buy an item from IPFS storage.
the.emarketIpfsStoreBuy = function (request, callback) {

  emarket.ipfs.store.buy(request.options, request.goods, request.count, request.payment,

    request.privateMessage, function (result) {

      console.log(JSON.stringify(result));
      callback(result);
    });
}

// accept a buy request for IPFS item.
the.emarketIpfsStoreAccept = function (request, callback) {

  ///HOWTO: Use ipfsStoreAccept API

  //use ipfsStoreSync to sync IPFS listings
  //use ipfsStoreAllListings to get IPFS listings
  //choose one listings and set request.goods from it
  //choose an escrow provider and set request.newEscrow to it
  //use ipfsOrdersGet to sync IPFS listing orders and get all buy requests
  //choose one buy request and set request.buyOrder from it
  //request.buyOrder should contain buyer, tradeId, count, payment and privateMessage
  //buy request contains 'key' object. Set request.sessionKey to it

  emarket.ipfs.store.accept(request.options, request.goods, request.newEscrow, request.buyOrder,

    request.sessionKey, request.privateMessage, function (result) {

      console.log(JSON.stringify(result));
      callback(result);
    });
}

// reject a buy request for IPFS item.
the.emarketIpfsStoreReject = function(request, callback) {

  ///HOWTO: Use ipfsStoreReject API

  //use ipfsStoreSync to sync IPFS listings
  //use ipfsStoreAllListings to get IPFS listings
  //choose one listings and set request.goods from it
  //use ipfsOrdersGet to sync IPFS listing orders and get all buy requests
  //choose one buy request and set request.tradeId from it
  //buy request contains 'key' object. Set request.sessionKey to it

  emarket.ipfs.store.reject(request.options, request.goods, request.sessionKey, request.tradeId,

    request.privateMessage, function (result) {

      console.log(JSON.stringify(result));
      callback(result);
    });
}

// sync IPFS orders
the.emarketIpfsOrdersSync = function (request, callback) {

  if (!request.options) request.options = {};

  emarket.escrows.syncOrders(request.goods.escrow, true, request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

// sync IPFS orders
the.emarketIpfsAllEscrowOrdersSync = function(request, callback) {

  emarket.ipfs.orders.syncAllEscrowOrders(request.options,

    // progress callback
    function(result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

the.emarketIpfsOrdersSyncMyOrders = function (request, callback) {

  emarket.ipfs.orders.syncAllMyOrders(request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

the.emarketIpfsOrdersSyncMyPurchases = function (request, callback) {

  emarket.ipfs.orders.syncAllMyPurchases(request.escrows, request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    callback);
}

the.emarketIpfsOrdersGet = function (request, callback) {

  emarket.escrows.syncOrders(request.goods.escrow, true, request.options,

    // progress callback
    function (result) {

      the.eventEmitter.emit('sync', result);
      return;
    },

    // sync callback
    function (result) {

      if (result.result != 'ok') {

        callback(result);
        return;
      }

      emarket.ipfs.orders.getOrders(request.goods, callback);
    }
  );
}

the.emarketIpfsOrdersGetMyOrders = function (request, callback) {
  emarket.ipfs.orders.getMyOrders(request.options, callback);
}

the.emarketIpfsOrdersGetMyPurchases = function (request, callback) {
  emarket.ipfs.orders.getMyPurchases(request.hashes, request.options, callback);
}

// transactions API

the.emarketMyTransactions = function (address, callback) {

  emarket.db.transactions.select(address, function (result) {

    console.log(result);

    if (!result.items.length) {

      callback({ result: 'error', error: 'Not found' });
      return;
    }

    var items = [];
    libs.lodash.forEach(result.items, function (order) {

      items.push(order);
    });

    callback({ result: 'ok', items: items });
    return;
  });
  callback
}

// storefront API

the.clearStoreFront = function (request, callback) {
  emarket.db.stores.delete((res) => {
    console.log('clearStores response', res);
    callback(res);
  });
}

the.setStore = function (request, callback) {
  var item = request;

  emarket.db.stores.insert(item, function(result) {

    callback(result);

  });
};

the.getOwnStoreName = function (request, callback) {
  var wallet = request.wallet;

  emarket.db.stores.select(wallet, function(result) {

    callback(result);

  });
};

the.api = {
  //store API
  'syncStore': the.emarketSyncStore,
  'allListings': the.emarketAllListings,

  'myListings': the.emarketMyListings,
  'getAllStoreName': the.emarketGetAllStoreName,
  'getSelectedItemStore': the.emarketGetSelectedStoreItem,

  'blacklistAllListings': the.emarketBlacklistAllListings,
  'getItem': the.emarketGetItem,
  'listItem': the.emarketListItem,
  'buyItem': the.emarketBuyItem,
  'cancelItem': the.emarketCancelItem,
  'acceptBuy': the.emarketAcceptBuy,
  'rejectBuy': the.emarketRejectBuy,

  //wallets API
  'checkWallet': the.emarketCheckWallet,
  'createWallet': the.emarketCreateWallet,
  'useWallet': the.emarketUseWallet,
  'listWallets': the.emarketListWallets,
  'currentWallet': the.emarketCurrentWallet,

  //orders API
  'syncOrders': the.emarketSyncOrders,
  'syncAllMyOrders': the.emarketSyncAllMyOrders,
  'syncAllMyPurchases': the.emarketSyncAllMyPurchases,
  'syncInitialPurchases': the.emarketSyncInitialPurchases,
  'getOrders': the.emarketGetOrders,
  'getMyOrders': the.emarketGetMyOrders,
  'getMyPurchases': the.emarketGetMyPurchases,
  'getOrdersDetail': the.emarketGetOrdersDetail,

  //alias API
  'aliasGetName': the.emarketAliasGetName,
  'aliasGetAddress': the.emarketAliasGetAddress,
  'aliasCreate': the.emarketAliasCreate,

  //blacklist API
  'syncBlacklist': the.emarketSyncBlacklist,
  'isBlacklisted': the.emarketIsBlacklisted,
  'attachBlacklist': the.emarketAttachBlacklist,
  'detachBlacklist': the.emarketDetachBlacklist,

  //dispute API
  'openDispute': the.emarketOpenDispute,
  'closeDispute': the.emarketCloseDispute,
  'claimDispute': the.emarketClaimDispute,

  //ethereum API
  'getBalance': the.emarketGetBalance,
  'sendMoney': the.emarketSendMoney,

  //token API
  'getBalanceBBT': the.emarketGetBalanceBBT,
  'sendMoneyBBT': the.emarketSendMoneyBBT,
  'getDecimalsBBT': the.emarketGetDecimalsBBT,

  //BBT feed API
  'syncFeedBBT': the.emarketSyncFeedBBT,
  'getFeedsBBT': the.emarketGetFeedsBBT,

  //escrows API
  'syncEscrow': the.emarketSyncEscrow,
  'getEscrow': the.emarketGetEscrow,
  'syncEscrowOrders': the.emarketSyncEscrowOrders,
  'getEscrowTradeOrders': the.emarketGetEscrowTradeOrders,

  //gas API
  'setGas': the.emarketSetGas,
  'gasPriceEstimateWithBlocks': the.emarketGasPriceEstimateWithBlocks,

  //IPFS API
  'ipfsIsDaemonActive': the.emarketIpfsIsDaemonActive,

  //IPFS Contract API
  'ipfsContractSync': the.emarketIpfsContractSync,
  'ipfsGetHashes': the.emarketIpfsGetHashes,

  //IPFS Storage API
  'ipfsStorageSync': the.emarketIpfsStorageSync,
  'ipfsStorageAdd': the.emarketIpfsStorageAdd,
  'ipfsStorageRemove': the.emarketIpfsStorageRemove,
  'ipfsStorageGet': the.emarketIpfsStorageGet,
  'ipfsStorageGetAll': the.emarketIpfsStorageGetAll,

  //IPFS Store API
  'ipfsStoreSync': the.emarketIpfsStoreSync,
  'ipfsStoreAllListings': the.emarketIpfsStoreAllListings,
  'ipfsStoreMyListings': the.emarketIpfsStoreMyListings,
  'ipfsStoreGetItem': the.emarketIpfsStoreGetItem,
  'ipfsStoreSell': the.emarketIpfsStoreSell,
  'ipfsStoreBuy': the.emarketIpfsStoreBuy,
  'ipfsStoreAccept': the.emarketIpfsStoreAccept,
  'ipfsStoreReject': the.emarketIpfsStoreReject,

  //IPFS Orders API
  'ipfsOrdersSync': the.emarketIpfsOrdersSync,
  'ipfsOrdersListSync': the.emarketIpfsAllEscrowOrdersSync,
  'ipfsOrdersSyncMyOrders': the.emarketIpfsOrdersSyncMyOrders,
  'ipfsOrdersSyncMyPurchases': the.emarketIpfsOrdersSyncMyPurchases,
  'ipfsOrdersGet': the.emarketIpfsOrdersGet,
  'ipfsOrdersGetMyOrders': the.emarketIpfsOrdersGetMyOrders,
  'ipfsOrdersGetMyPurchases': the.emarketIpfsOrdersGetMyPurchases,

  //transactions API
  'getMyTransactions': the.emarketMyTransactions,

  // storefront API
  'setStore': the.setStore,
  'getOwnStoreName': the.getOwnStoreName,
  'clearStoreFront': the.clearStoreFront,

  //IPFS Storename API
  'getAllIPFSStoreName': the.emarketGetAllIPFSStoreName,
  'getIPFSSelectedItemStore': the.emarketgetIPFSSelectedStoreItem
}

module.exports = the
