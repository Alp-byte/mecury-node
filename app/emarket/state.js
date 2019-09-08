var libs = {};
libs.xss = require('xss');
libs.web3 = require('web3');
libs.lodash = require('lodash');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.anns = require.main.require('./emarket/anns');

emarket.db = {};
emarket.db.anns = require.main.require('./emarket/db/anns');

var state = {};
var myxss = new libs.xss.FilterXSS({ whiteList: {} });

emarket.state = function () {}

var the = emarket.state;
the.myname = 'emarket.state';

the.getState = function (height, callback) {
  
  var web3 = new libs.web3(libs.web3.givenProvider);

  emarket.db.anns.select(function(result) {

    var answer = {};
    var newState = {};

    var escrowProviders = {};
    newState.storeAddress = '';
    newState.defaultFee = web3.utils.toWei(emarket.defaults.defaultFeeEther, 'ether');
    newState.doubleFee = web3.utils.toWei(emarket.defaults.doubleFeeEther, 'ether');
    newState.escrowProviders = [];
    newState.news = [];

    if(result.result != 'ok') {

      answer.result = 'error';
      answer.error = result.error;
      answer.state = state;

      callback(answer);
      return;
    }

    libs.lodash.forEach(result.items, function(item) {

      var itemHeight = item.blockNumber;

      if((height != 'latest') && (itemHeight > height)) return false;

      var datainfo = item.payload;
      var data = JSON.parse(datainfo);

      if(data.store) newState.storeAddress = myxss.process(data.store);
      if(data.defaultFee) newState.defaultFee = data.defaultFee;
      if(data.doubleFee) newState.doubleFee = data.doubleFee;

      var _openEscrows = data.openEscrows;
      if(_openEscrows && isArray(_openEscrows)) {

        for (k = 0; k < _openEscrows.length; k++) {
          escrowProviders[_openEscrows[k]] = true;
        }
      }

      var _closeEscrows = data.closeEscrows;
      if(_closeEscrows && isArray(_closeEscrows)) {

        for (k = 0; k < _closeEscrows.length; k++) {
          escrowProviders[_closeEscrows[k]] = false;
        }
      }

      var _news = data.newsList;
      if(_news && isArray(_news)) {

        for (k = 0; k < _news.length; k++) {
          newState.news.push(myxss.process(_news[k]));
        }
      }
    });

    libs.lodash.forEach(escrowProviders, function(value, key) {

      newState.escrowProviders.push(myxss.process(key));
    });

    answer.result = 'ok';
    answer.state = newState;

    callback(answer);
  });
}

the.updateState = function (callback) {
    
  the.getState('latest', callback);
}

function isArray(what) {
  return Object.prototype.toString.call(what) === '[object Array]';
}

module.exports = the