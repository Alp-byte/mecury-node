var emarket = {};

emarket.db = {};
emarket.db.transactionLog = require.main.require('./emarket/db/transactionLog');

var USER_ACTIONS = [
  'listItem',
  'relistItem',
  'acceptBuy',
  'openDispute',
  'claimDispute',
  'closeDispute',
  'rejectBuy',
  'buyItem',
  'cancelItem',
  'ipfsStoreSell',
  'ipfsStoreBuy',
  'ipfsStoreAccept',
  'ipfsStoreReject'
];

var emarket_electron = {}

emarket_electron.transactions = function () { }

var the = emarket_electron.transactions;
the.myname = 'emarket_electron.transactions';

the.addTransaction = function (data, actionId) {

  if (USER_ACTIONS.indexOf(data.requestType) != -1) {

    console.log('addTransaction', data, actionId);
    var item;
    if (data && data.goods)
      item = data.goods.title;

    let title = data.requestType;
    if (data.isDispute) title = 'REFUNDED';
    if (data.requestType === 'openDispute' && data.seller) {
      title = 'ContinueDispute'
    }
    
    var transaction = { title: title, status: 'TRANSACTION_INITIATED', item: item, hash: '-', timestamp: Date.now(), id: actionId };
    console.log('create transaction', transaction);
    emarket.db.transactionLog.insert(transaction, (res) => {
      console.log('transaction created', res);
    });
  }
}

the.updateTransaction = function (data, request, actionId) {
  if (USER_ACTIONS.indexOf(request.requestType) != -1) {
   console.log('updateTransaction', data, request, actionId);
    if (request && request.goods)
      item = request.goods.title;
    if (data.result == 'ok') {
      if (request.isDispute) request.requestType = 'REFUNDED';
      if (request.seller) request.requestType = 'ContinueDispute';
      var transaction = { title: request.requestType, status: 'TRANSACTION_SUCCESS', item: item, hash: data.hash, timestamp: Date.now(), id: actionId };
      console.log('create transaction', transaction);
      emarket.db.transactionLog.insert(transaction, (res) => {
        console.log('transaction created', res);
      });
    } else {
      if (request.isDispute) request.requestType = 'REFUNDED';
      let hash = data.error;
      if(data.error instanceof Error) hash = data.error.message
      var transaction = { title: request.requestType, status: 'TRANSACTION_ERROR', item: item, hash: hash, timestamp: Date.now(), id: actionId };
      console.log('create transaction', transaction);
      emarket.db.transactionLog.insert(transaction, (res) => {
        console.log('transaction created', res);
      });
    }
    console.log('updateTransaction', data, transaction);
  }
}

the.getTransactions = function (callback) {
  console.log('getTransactions called 2');
  emarket.db.transactionLog.getAll((res) => {
    console.log('getTransactions response 1', res);
    callback(res);
  });
}

the.clearTransaction = function (callback) {
  console.log('clearTransaction called 2');
  emarket.db.transactionLog.clearAll((res) => {
    console.log('clearTransaction response 1', res);
    callback(res);
  });
}

module.exports = the