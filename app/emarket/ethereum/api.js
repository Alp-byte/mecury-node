var libs = {};
libs.web3 = require('web3');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.ethereum = {};
emarket.ethereum.web3 = require.main.require('./emarket/ethereum/web3');

emarket.ethereum.api = function () {}

var the = emarket.ethereum.api;
the.myname = 'emarket.ethereum.api';

// Ethereum gas price
the.gasPrice = emarket.defaults.gasPrice;

// Ethereum network IDs
the.MAIN_CHAIN_ID = 1;
the.ROPSTEN_CHAIN_ID = 3;

//Call a contract method. Use this call for client-side signed transactions for the contract.
the.ethcall = function (wallet, address, abi, method, params, payment, timeoutBlocks, callback) {

  var web3 = new libs.web3(libs.web3.givenProvider);
  var web3state = emarket.ethereum.web3.newState(the.myname + '.ethcall');

  if(!address || (address.length < 42)) {

    callback({ result: 'error', error: 'Invalid address: ' + address });
    return;
  }

  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3stateNew, asyncCallback) {

      var privkeyStr = '0x' + wallet.getPrivateKeyString();
      var gaslimit = 600000;

      var contract = new web3stateNew.web3.eth.Contract(abi, address);
      var encoded = contract.methods[method].apply(this, params).encodeABI();

      var tx = {
        chainId: the.MAIN_CHAIN_ID,
        value: web3.utils.toHex(web3.utils.toBN(payment)),
        gasPrice: web3.utils.toHex(web3.utils.toBN(the.gasPrice)),
        gasLimit: web3.utils.toHex(web3.utils.toBN('' + gaslimit)),
        to : address,
        data : encoded
      }

      ///HACK: explicitly set chainId to avoid excess network calls
      if(emarket.defaults.isTestnet) {
        tx.chainId = the.ROPSTEN_CHAIN_ID;
      }

      if(emarket.defaults.isTestnet && emarket.defaults.privateTestnet) {
        tx.chainId = emarket.defaults.privateTestnetId;
      }

      web3stateNew.web3.eth.accounts.signTransaction(tx, privkeyStr, function(error, result) {

        if(error) {

          asyncCallback(error, null);
          return;
        }

        var signedTx = result.rawTransaction;

        console.log('ETHcall');

        web3stateNew.web3.eth.sendSignedTransaction(signedTx)
        .on('error', function(err) {

          asyncCallback(err, null);
          return;
        })
        .once('receipt', function(receipt) {

          ///HACK: check for error thrown - should consume all gas and no logs available
          ///      only applicable to before Byzantium fork
          if(typeof receipt.status === 'undefined') {

            if((receipt.gasUsed >= gaslimit) && (receipt.logs.length == 0)) {

              var errorStr = 'Transaction thrown an error';
              console.log(errorStr);
              asyncCallback({ message: errorStr }, null);
              return;
            }

            asyncCallback(null, { result: 'ok', hash: receipt.transactionHash });
            return;
          }

          if(!receipt.status) {

            var errorStr = 'Transaction thrown an error';
            console.log(errorStr);
            asyncCallback({ message: errorStr }, null);
            return;
          }

          asyncCallback(null, { result: 'ok', hash: receipt.transactionHash });
          return;
        });
      });
    },

    //okCallback
    callback,

    //errorCallback
    callback
  );
}

the.ethdeploy = function (wallet, contractCode, abi, params, timeoutBlocks, callback) {

  var web3 = new libs.web3(libs.web3.givenProvider);
  var web3state = emarket.ethereum.web3.newState(the.myname + '.ethdeploy');

  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3stateNew, asyncCallback) {

      var privkeyStr = '0x' + wallet.getPrivateKeyString();
      var gaslimit = 3000000;

      var contract = new web3stateNew.web3.eth.Contract(abi);
      var encoded = contract.deploy({ data: contractCode, arguments: params }).encodeABI();

      var tx = {
        chainId: the.MAIN_CHAIN_ID,
        value: '0x00',
        gasPrice: web3.utils.toHex(web3.utils.toBN(the.gasPrice)),
        gasLimit: web3.utils.toHex(web3.utils.toBN('' + gaslimit)),
        data : '0x' + encoded
      }

      ///HACK: explicitly set chainId to avoid excess network calls
      if(emarket.defaults.isTestnet) {
        tx.chainId = the.ROPSTEN_CHAIN_ID;
      }

      if(emarket.defaults.isTestnet && emarket.defaults.privateTestnet) {
        tx.chainId = emarket.defaults.privateTestnetId;
      }

      web3stateNew.web3.eth.accounts.signTransaction(tx, privkeyStr, function(error, result) {

        if(error) {

          asyncCallback(error, null);
          return;
        }

        var signedTx = result.rawTransaction;
  
        console.log('ETHdeploy');

        web3stateNew.web3.eth.sendSignedTransaction(signedTx)
        .on('error', function(err) {

          asyncCallback(err, null);
          return;
        })
        .once('receipt', function(receipt) {

          var answer = {};

          console.log('Goods contract deployed at ' + receipt.contractAddress + '. Block = ' + receipt.blockNumber);

          var answer = {};
          answer.result = 'ok';
          answer.hash = receipt.transactionHash;
          answer.contractAddress = receipt.contractAddress;
          answer.blockNumber = receipt.blockNumber;
          asyncCallback(null, answer);
          return;
        });
      });
    },

    //okCallback
    callback,

    //errorCallback
    callback
  );
}

the.ethsend = function (wallet, payment, recipient, timeoutBlocks, callback) {

  var web3 = new libs.web3(libs.web3.givenProvider);
  var web3state = emarket.ethereum.web3.newState(the.myname + '.ethsend');

  if(!recipient || (recipient.length < 42)) {

    callback({ result: 'error', error: 'Invalid address: ' + recipient });
    return;
  }

  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3stateNew, asyncCallback) {

      var privkeyStr = '0x' + wallet.getPrivateKeyString();
      var gaslimit = 300000;

      var tx = {
        chainId: the.MAIN_CHAIN_ID,
        value: web3.utils.toHex(web3.utils.toBN(payment)),
        gasPrice: web3.utils.toHex(web3.utils.toBN(the.gasPrice)),
        gasLimit: web3.utils.toHex(web3.utils.toBN('' + gaslimit)),
        to : recipient
      }

      ///HACK: explicitly set chainId to avoid excess network calls
      if(emarket.defaults.isTestnet) {
        tx.chainId = the.ROPSTEN_CHAIN_ID;
      }

      if(emarket.defaults.isTestnet && emarket.defaults.privateTestnet) {
        tx.chainId = emarket.defaults.privateTestnetId;
      }

      web3stateNew.web3.eth.accounts.signTransaction(tx, privkeyStr, function(error, result) {

        if(error) {

          asyncCallback(error, null);
          return;
        }

        var signedTx = result.rawTransaction;

        console.log('ETHsend');

        web3stateNew.web3.eth.sendSignedTransaction(signedTx)
        .on('error', function(err) {

          asyncCallback(err, null);
          return;
        })
        .once('receipt', function(receipt) {

          ///HACK: check for error thrown - should consume all gas and no logs available
          ///      only applicable to before Byzantium fork
          if(typeof receipt.status === 'undefined') {

            if((receipt.gasUsed >= gaslimit) && (receipt.logs.length == 0)) {

              var errorStr = 'Transaction thrown an error';
              console.log(errorStr);
              asyncCallback({ message: errorStr }, null);
              return;
            }

            asyncCallback(null, { result: 'ok', hash: receipt.transactionHash });
            return;
          }

          if(!receipt.status) {

            var errorStr = 'Transaction thrown an error';
            console.log(errorStr);
            asyncCallback({ message: errorStr }, null);
            return;
          }

          asyncCallback(null, { result: 'ok', hash: receipt.transactionHash });
          return;
        });
      });
    },

    //okCallback
    callback,

    //errorCallback
    callback
  );
}

//Get data from Ethereum contract. Does not spend gas.
the.ethget = function (address, abi, method, params, timeoutBlocks, callback) {

  var web3state = emarket.ethereum.web3.newState(the.myname + '.ethget');

  if(!address || (address.length < 42)) {

    callback({ result: 'error', error: 'Invalid address: ' + address });
    return;
  }

  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3stateNew, asyncCallback) {

      var contract = new web3stateNew.web3.eth.Contract(abi, address);
      contract.methods[method].apply(this, params).call({}, asyncCallback);
      return;
    },

    //okCallback
    function(result) {

      callback({ result: 'ok', data: result });
      return;
    },

    //errorCallback
    callback
  );
}

the.getbalance = function (address, callback) {

  var web3state = emarket.ethereum.web3.newState(the.myname + '.getbalance');
  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3stateNew, asyncCallback) {

      web3stateNew.web3.eth.getBalance(address, web3stateNew.web3.eth.defaultBlock, asyncCallback);
      return;
    },

    //okCallback
    function(result) {

      callback({ result: 'ok', balance: result });
      return;
    },

    //errorCallback
    callback
  );
}

the.getHeight = function (callback) {

  var web3state = emarket.ethereum.web3.newState(the.myname + '.getHeight');
  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3stateNew, asyncCallback) {

      web3stateNew.web3.eth.getBlockNumber(asyncCallback);
      return;
    },

    //okCallback
    function(result) {

      callback({ result: 'ok', height: result });
      return;
    },

    //errorCallback
    callback
  );
}

the.getBlockByNumber = function (number, fullTransactions, callback) {

  var web3state = emarket.ethereum.web3.newState(the.myname + '.getBlockByNumber');
  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3stateNew, asyncCallback) {

      web3stateNew.web3.eth.getBlock(number, fullTransactions, asyncCallback);
      return;
    },

    //okCallback
    function(result) {

      if(result == null) {

        callback({ result: 'error', error: 'Empty response' });
        return;
      }

      callback({ result: 'ok', block: result });
      return;
    },

    //errorCallback
    callback
  );
}

the.getContractCode = function (address, callback) {

  var web3state = emarket.ethereum.web3.newState(the.myname + '.getContractCode');
  emarket.ethereum.web3.web3Retry(web3state,

    //bodyCallback
    function(web3stateNew, asyncCallback) {

      web3stateNew.web3.eth.getCode(address, web3stateNew.web3.eth.defaultBlock, asyncCallback);
      return;
    },

    //okCallback
    function(result) {

      callback({ result: 'ok', code: result });
      return;
    },

    //errorCallback
    callback
  );
}

// set the gas price to use with Ethereum calls
the.setGasPrice = function(price) {

  the.gasPrice = price;
}

module.exports = the