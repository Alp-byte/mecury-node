var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.default_contracts = require.main.require('./emarket/default_contracts');
emarket.testdata = require.main.require('./emarket/testdata');

emarket.wallets = {};
emarket.wallets.aes = require.main.require('./emarket/wallets/aes');
emarket.wallets.wallets = require.main.require('./emarket/wallets/wallets');

emarket.ethereum = {};
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');

emarket.token = {};
emarket.token.api = require.main.require('./emarket/token/api');

emarket.dispute = function () {}

var the = emarket.dispute;
the.myname = 'emarket.dispute';

the.open = function (goods, sessionKey, tradeId, privateMessage, isIpfs, callback) {

  var answer = {};
  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  console.log('dispute.open() from account ' + account);
  
  var datainfo = {};
  var encPubkeyStr = emarket.wallets.wallets.currentWallet.getCurve25519PublicKeyString();
  var encMessage = emarket.wallets.aes.encryptForSession(privateMessage, sessionKey);

  //add sender pubkey
  encMessage.pubkey = encPubkeyStr;

  //remove key info - not needed
  delete encMessage.key;

  datainfo.private = encMessage;

  if(emarket.defaults.isTesting) {

    console.log('datainfo: ' + JSON.stringify(datainfo));
    answer.result = 'ok';
    answer.hash = emarket.testdata.openDisputeItemHash;
    answer.tradeId = tradeId;
    answer.key = sessionKey;
    callback(answer);
    return;
  }

  ///HACK: User should check EscrowService events log to know if his call is successful.
  ///      There is no way to get the result status of the call.

  var abi = emarket.default_contracts.escrowContractAbi;
  var args = [ emarket.defaults.marketVersion, tradeId, account, JSON.stringify(datainfo) ];

  if(isIpfs) {
    abi = emarket.default_contracts.escrowDirectContractAbi;
    args = [ emarket.defaults.marketVersion, tradeId, JSON.stringify(datainfo) ];
  }

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    goods.escrow,
    abi,
    'no',
    args,
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function(result) {

      result.tradeId = tradeId;
      result.key = sessionKey;
      callback(result);
    }
  );
}

the.close = function (goods, sessionKey, tradeId, privateMessage, isIpfs, callback) {

  var answer = {};
  var account = emarket.wallets.wallets.currentWallet.getAddressString();

  console.log('dispute.close() from account ' + account);
  
  var datainfo = {};
  var encPubkeyStr = emarket.wallets.wallets.currentWallet.getCurve25519PublicKeyString();
  var encMessage = emarket.wallets.aes.encryptForSession(privateMessage, sessionKey);

  //add sender pubkey
  encMessage.pubkey = encPubkeyStr;

  //remove key info - not needed
  delete encMessage.key;

  datainfo.private = encMessage;

  if(emarket.defaults.isTesting) {

    console.log('datainfo: ' + JSON.stringify(datainfo));
    answer.result = 'ok';
    answer.hash = emarket.testdata.closeDisputeItemHash;
    answer.tradeId = tradeId;
    answer.key = sessionKey;
    callback(answer);
    return;
  }

  var abi = emarket.default_contracts.escrowContractAbi;
  var args = [ emarket.defaults.marketVersion, tradeId, account, JSON.stringify(datainfo) ];

  if(isIpfs) {
    abi = emarket.default_contracts.escrowDirectContractAbi;
    args = [ emarket.defaults.marketVersion, tradeId, JSON.stringify(datainfo) ];
  }

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    goods.escrow,
    abi,
    'yes',
    args,
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function(result) {

      result.tradeId = tradeId;
      result.key = sessionKey;
      callback(result);
    }
  );
}

// a BBT fee will be taken from seller on this call
the.claim = function (goods, tradeId, isIpfs, callback) {

  var answer = {};
  var account = emarket.wallets.wallets.currentWallet.getAddressString();
  var datainfo = {};

  console.log('dispute.claim() from account ' + account);
  
  if(emarket.defaults.isTesting) {

    console.log('datainfo: ' + JSON.stringify(datainfo));
    answer.result = 'ok';
    answer.hash = emarket.testdata.claimDisputeItemHash;
    answer.tradeId = tradeId;
    callback(answer);
    return;
  }

  emarket.token.api.getBalance(account, function(result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    console.log('token balance from account ' + account + ' is ' + result.balance + ' BBT');

    // trying to approve the whole balance
    disputeApproveAndClaim(goods, tradeId, result.balance, isIpfs, callback);
    return;
  });
}

//set approval to the contract and add record to the store
function disputeApproveAndClaim(goods, tradeId, payment, isIpfs, callback) {

  var account = emarket.wallets.wallets.currentWallet.getAddressString();
  var datainfo = {};

  var abi = emarket.default_contracts.escrowContractAbi;

  if(isIpfs) {
    abi = emarket.default_contracts.escrowDirectContractAbi;
  }
  
  emarket.token.api.approve(emarket.wallets.wallets.currentWallet,
    '0', goods.escrow, function (result) {

    if (result.result != 'ok') {

      callback(result);
      return;
    }

    console.log('approved BBT set to 0 from account ' + account);

    emarket.token.api.approve(emarket.wallets.wallets.currentWallet,
      payment, goods.escrow, function (result2) {

      if (result2.result != 'ok') {

        callback(result2);
        return;
      }

      console.log('approved BBT set to ' + payment + ' from account ' + account);

      emarket.ethereum.api.ethcall(
        emarket.wallets.wallets.currentWallet,
        goods.escrow,
        abi,
        'getMoney',
        [ emarket.defaults.marketVersion, tradeId, JSON.stringify(datainfo) ],
        '0',
        emarket.defaults.ethTimeoutBlocks,
    
        function(result3) {

          result3.tradeId = tradeId;
          callback(result3);
          return;
        }
      );
    });
  });
}

module.exports = the