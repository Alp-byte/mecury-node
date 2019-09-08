var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.ethereum = {};
emarket.token = {};

emarket.defaults = require.main.require('./emarket/defaults');
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');
emarket.ethereum.web3 = require.main.require('./emarket/ethereum/web3');
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.token.api = function () {}

var the = emarket.token.api;
the.myname = 'emarket.token.api';

the.tokenAbi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"creationBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_newController","type":"address"}],"name":"changeController","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_blockNumber","type":"uint256"}],"name":"balanceOfAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_cloneTokenName","type":"string"},{"name":"_cloneDecimalUnits","type":"uint8"},{"name":"_cloneTokenSymbol","type":"string"},{"name":"_snapshotBlock","type":"uint256"},{"name":"_transfersEnabled","type":"bool"}],"name":"createCloneToken","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"parentToken","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"generateTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_blockNumber","type":"uint256"}],"name":"totalSupplyAt","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"transfersEnabled","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"parentSnapShotBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_amount","type":"uint256"},{"name":"_extraData","type":"bytes"}],"name":"approveAndCall","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"destroyTokens","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"tokenFactory","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_transfersEnabled","type":"bool"}],"name":"enableTransfers","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"controller","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"inputs":[{"name":"_tokenFactory","type":"address"},{"name":"_parentToken","type":"address"},{"name":"_parentSnapShotBlock","type":"uint256"},{"name":"_tokenName","type":"string"},{"name":"_decimalUnits","type":"uint8"},{"name":"_tokenSymbol","type":"string"},{"name":"_transfersEnabled","type":"bool"}],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_cloneToken","type":"address"},{"indexed":false,"name":"_snapshotBlock","type":"uint256"}],"name":"NewCloneToken","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"Approval","type":"event"}];

the.tokenAddress = '0x1500205f50bf3fd976466d0662905c9ff254fc9c';
if(emarket.defaults.isTestnet) the.tokenAddress = '0xb8033ccf98c151d7026ed291f5cc16dd85e79bd0';
if(emarket.defaults.isTestnet && emarket.defaults.privateTestnet) the.tokenAddress = '0x6960aF1255D605C5a5E09217101CF2294BB18eB7';

//token decimals
///HACK: hardcoded
the.decimals = 4;
if(emarket.defaults.isTestnet) the.decimals = 8;

the.send = function (wallet, payment, recipient, callback) {

  emarket.ethereum.api.ethcall(
    wallet,
    the.tokenAddress,
    the.tokenAbi,
    'transfer',
    [ recipient, '' + payment ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function(result) {

      callback(result);
      return;
    }
  );
}

the.getBalance = function (address, callback) {

  emarket.ethereum.api.ethget(
    the.tokenAddress, the.tokenAbi,
    'balanceOf',
    [ address ],
    emarket.defaults.ethTimeoutBlocks,
    function(result) {

      if(result.result != 'ok') {

        callback(result);
        return;
      }

      callback({ result: 'ok', balance: result.data });
      return;
    }
  );
}

the.getApproved = function (owner, address, callback) {

  emarket.ethereum.api.ethget(
    the.tokenAddress, the.tokenAbi,
    'allowance',
    [ owner, address ],
    emarket.defaults.ethTimeoutBlocks,
    function(result) {

      if(result.result != 'ok') {

        callback(result);
        return;
      }

      callback({ result: 'ok', approved: result.data });
      return;
    }
  );
}

//allow the recipient to spend tokens of the owner
the.approve = function (wallet, payment, recipient, callback) {

  emarket.ethereum.api.ethcall(
    wallet,
    the.tokenAddress,
    the.tokenAbi,
    'approve',
    [ recipient, '' + payment ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function(result) {

      callback(result);
      return;
    }
  );
}

//send allowed tokens
the.sendFrom = function (wallet, payment, sender, recipient, callback) {

  emarket.ethereum.api.ethcall(
    wallet,
    the.tokenAddress,
    the.tokenAbi,
    'transferFrom',
    [ sender, recipient, '' + payment ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function(result) {

      callback(result);
      return;
    }
  );
}

the.getDecimals = function (callback) {

  callback({ result: 'ok', decimals: the.decimals });
  return;
}

module.exports = the