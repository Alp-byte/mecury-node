var libs = {};
libs.web3 = require('web3');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.wallets = {};
emarket.wallets.wallets = require.main.require('./emarket/wallets/wallets');

emarket.ethereum = {};
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');
emarket.ethereum.web3 = require.main.require('./emarket/ethereum/web3');

/*
Alias module. Uses Ethereum Global Registrar service for alias management.
*/

var globalRegistrarAddr = '0x33990122638b9132ca29c723bdf037f1a891a70c';
var globalRegistrarAbi = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"name","outputs":[{"name":"o_name","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"owner","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"content","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"addr","outputs":[{"name":"","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"reserve","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"subRegistrar","outputs":[{"name":"o_subRegistrar","type":"address"}],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_newOwner","type":"address"}],"name":"transfer","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_registrar","type":"address"}],"name":"setSubRegistrar","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"Registrar","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_a","type":"address"},{"name":"_primary","type":"bool"}],"name":"setAddress","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"},{"name":"_content","type":"bytes32"}],"name":"setContent","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"bytes32"}],"name":"disown","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_name","type":"bytes32"}],"name":"register","outputs":[{"name":"","type":"address"}],"type":"function"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"}],"name":"Changed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"name","type":"bytes32"},{"indexed":true,"name":"addr","type":"address"}],"name":"PrimaryChanged","type":"event"}];

emarket.alias = function () {}

var the = emarket.alias;
the.myname = 'emarket.alias';

the.getAddress = function(_name, callback) {

  emarket.ethereum.api.ethget(
    globalRegistrarAddr, globalRegistrarAbi,
    'addr',
    [ _name ],
    emarket.defaults.ethTimeoutBlocks,
    function(result) {

      if(result.result != 'ok') {

        callback(result);
        return;
      }

      callback({ result: 'ok', address: result.data });
      return;
    }
  );
}

the.getName = function(address, callback) {

  var web3 = new libs.web3(libs.web3.givenProvider);

  emarket.ethereum.api.ethget(
    globalRegistrarAddr, globalRegistrarAbi,
    'name',
    [ address ],
    emarket.defaults.ethTimeoutBlocks,
    function(result) {

      if(result.result != 'ok') {

        callback(result);
        return;
      }

      callback({ result: 'ok', name: web3.utils.hexToUtf8(result.data) });
      return;
    }
  );
}

the.reserve = function(_name, callback) {

  emarket.ethereum.api.ethcall(
    emarket.wallets.wallets.currentWallet,
    globalRegistrarAddr,
    globalRegistrarAbi,
    'reserve',
    [ _name ],
    '0',
    emarket.defaults.ethTimeoutBlocks,

    function(result) {

      callback(result);
      return;
    }
  );
}

module.exports = the