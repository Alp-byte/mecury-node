var emarket_electron = {};
emarket_electron.utils = require.main.require('./emarket_electron/utils');
emarket_electron.transactionsLog = require.main.require('./emarket_electron/transactions');
emarket_electron.fe_config = require.main.require('./emarket_electron/fe_config');

appbindings = function () { }

var the = appbindings;
the.name = 'appbindings';

//save settings
the.saveSettings = function (request, callback) {
  console.log('saveSettings', request);
  emarket_electron.utils.saveSettings(request['settings']).then(val => {
    console.log('answer', val);
    callback({ result: "ok" });
  });
}

//get settings
the.getSettings = function (request, callback) {
  console.log('getSettings', request);
  emarket_electron.utils.getSettings(request['key']).then(val => {
    console.log('answer', val);
    callback({ result: "ok", value: val });
  });
}

//reset settings
the.resetSettings = function (request, callback) {
  console.log('resetSettings', request);
  emarket_electron.utils.resetSettings().then(() => {
    callback({ result: "ok" });
  });
}

//transactions log API

the.getTransactions = function(request, callback) {
  emarket_electron.transactionsLog.getTransactions(callback);
}

the.clearTransaction = function(request, callback) {
  emarket_electron.transactionsLog.clearTransaction(callback);
}

//FE config API

the.getConfig = function(request, callback) {
  console.log('getConfig called');
  emarket_electron.fe_config.getConfig(callback);
}

the.api = {
  //settings API
  "saveSettings": the.saveSettings,
  "getSettings": the.getSettings,
  "resetSettings": the.resetSettings,

  //transactions log API
  'getTransactions': the.getTransactions,
  'clearTransaction': the.clearTransaction,

  //FE config API
  'getConfig': the.getConfig
}

module.exports = the