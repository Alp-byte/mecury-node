var libs = {};
libs.async = require('async');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.ethereum = {};
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.db = {};
emarket.db.events = require.main.require('./emarket/db/events');
emarket.db.contracts = require.main.require('./emarket/db/contracts');

/*
Sync module. Provides helpers for syncing remote objects with local database.
*/

emarket.sync = function () {}

var the = emarket.sync;
the.myname = 'emarket.sync';

var currentlySyncing = {};

//trying to synchronize DB with blockchain events
the.syncHelper = function(options, caller, address, abi, method, filterMethod,
  bodyCallback, progressCallback, callback) {
  if(address)
    address = address.toLowerCase();
  var context = { contentCount: 0, height: 0, recentHeight: 0, processed: 0 };
  libs.async.waterfall([
    libs.async.apply(getEventsCount, address, abi, options, context),
    libs.async.apply(getLastBlock, address),
    libs.async.apply(findNewestBlock),
    libs.async.apply(loadEventsIntoDB, options, caller, address, abi, method, filterMethod, progressCallback),
    libs.async.apply(syncLoadedEvents, options, caller, address, bodyCallback, progressCallback)
    ],

    function(asyncError, asyncResult) {

      currentlySyncing = {};

      if(asyncError) {

        callback({ result: 'error', error: asyncError });
        return;
      }

      var result = { result: 'ok', processed: asyncResult.processed };
      callback(result);
      return;
    });
}

// Library private functions start here

//find how many events to get from the contract
function getEventsCount(address, abi, options, context, asyncCallback) {

  var fields = ['contentCount'];
  emarket.ethereum.eth.getFields(address, abi, fields, options, function(result) {

    if(result.result != 'ok') {

      asyncCallback(result.error, null);
      return;
    }

    context.contentCount = parseInt(result.item.contentCount);
    asyncCallback(null, context);
    return;
  });
}

//find last processed block for the contract
function getLastBlock(address, context, asyncCallback) {

  emarket.db.contracts.select(address, function(result) {

    context.height = emarket.defaults.startBlock;

    if(result.result == 'ok' && result.item) context.height = result.item.height;
    asyncCallback(null, context);
    return;
  });
}

///TODO: make this call optional when caching is enabled
//find newest block in blockchain
function findNewestBlock(context, asyncCallback) {

  emarket.ethereum.api.getHeight(function(result) {

    if(result.result != 'ok') {

      asyncCallback(result.error, null);
      return;
    }

    context.recentHeight = result.height;
    asyncCallback(null, context);
    return;
  });
}

//load events and store into events DB
function loadEventsIntoDB(options, caller, address, abi, method, filterMethod,
  progressCallback, context, asyncCallback) {

  var loadEventsOptions = { startBlock: context.height, endBlock: context.recentHeight, noCaching: options.noCaching };

  progressCallback({ source: caller, type: 'loadEventsStart', item: address });
  
  loadEvents(loadEventsOptions, caller, address, abi, method, filterMethod, progressCallback, function(result) {

    if(result.result != 'ok') {

      progressCallback({ source: caller, type: 'loadEventsError', item: address, error: result.error });
      asyncCallback(result.error, null);
      return;
    }

    if(typeof result.lastBlock !== 'undefined')
      context.height = result.lastBlock;

    //update last processed block in the DB
    emarket.db.contracts.insert(address, context, function(result2) {

      progressCallback({ source: caller, type: 'loadEventsDone', item: address });
      asyncCallback(null, context);
      return;
    });

    return;
  });
}

//events loaded - sync them
function syncLoadedEvents(options, caller, address, bodyCallback, progressCallback, context, asyncCallback) {

  progressCallback({ source: caller, type: 'syncEventsStart', item: address });

  syncEvents({ noCaching: options.noCaching }, caller, address,
    bodyCallback, progressCallback, function(result) {

    if(result.result != 'ok') {

      progressCallback({ source: caller, type: 'syncEventsError', item: address, error: result.error });
      asyncCallback(result.error, null);
      return;
    }

    context.processed = result.processed;
    progressCallback({ source: caller, type: 'syncEventsDone', item: address });

    asyncCallback(null, context);
    return;
  });
}

/////////////////////////////////////////////////////////////////////////

// private utility functions

function loadEvents(options, caller, address, abi, method, filterMethod, progressCallback, callback) {

  var startBlock = 0;
  if(options.startBlock) startBlock = options.startBlock;

  var endBlock = 'latest';
  if(options.endBlock) endBlock = options.endBlock;

  ///HACK: 'latest' endBlock not supported

  var eventsOptions = { startBlock: startBlock, endBlock: endBlock, filterVersion: options.filterVersion,
    noCaching: options.noCaching };

  emarket.ethereum.eth.getEvents(address, abi, method, eventsOptions, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    //lastBlock is only provided by caching service. Use blockchain value for direct access events.
    if(!result.lastBlock) {

      result.lastBlock = endBlock;
    }

    //error fix
    if(!result.items) result.items = [];
    var state = { total: result.items.length, processed: 0, skipped: 0 };

    libs.async.filter(result.items,
      function(item, callback1) {

        if(!filterMethod(item)) {

          state.skipped++;
          state.processed++;
          callback1(null, false);
          return;
        }

        progressCallback({ source: caller, type: 'loadEventsStepProcessing', item: item });

        var version = parseInt(item.returnValues.version.toString());
        if(version > emarket.defaults.marketVersion) {

          state.skipped++;
          state.processed++;
          progressCallback({ source: caller, type: 'loadEventsStepSkipped', item: item });
          callback1(null, false);
          return;
        }

        //check for known hash
        emarket.db.events.selectWithHashAndContractAddress(item.transactionHash,
          address.toLowerCase(), item.logIndex, function(result2) {

          if((result2.result == 'ok') && (result2.items.length > 0)) {

            state.skipped++;
            state.processed++;
            progressCallback({ source: caller, type: 'loadEventsStepSkipped', item: item });
            callback1(null, false);
            return;
          }

          state.processed++;
          item.address = address.toLowerCase();

          ///HACK: DB format conversion
          item.payload = item.returnValues.dataInfo;

          if(typeof item.returnValues.sender !== 'undefined')
            item.sender = item.returnValues.sender.toLowerCase();

          item.version = parseInt(item.returnValues.version.toString());
          item.eventType = 0;
          if(typeof item.returnValues.eventType !== 'undefined')
            item.eventType = parseInt(item.returnValues.eventType.toString());

          ///HACK: it seems timestamp can absent for certain geth version
          if(typeof item.returnValues.timestamp !== 'undefined') item.timestamp =
            parseInt(item.returnValues.timestamp.toString());

          ///HACK: order specific events
          var parsedPayload = {};

          if(item.payload && item.payload.length > 0) {

            parsedPayload = JSON.parse(item.payload);
          }

          delete parsedPayload.tradeId;
          delete parsedPayload.recipient;

          item.payment = '0';
          if(item.returnValues.payment) item.payment = item.returnValues.payment.toString();
          if(typeof item.returnValues.count !== 'undefined') parsedPayload.count =
            parseInt(item.returnValues.count.toString());
          if(typeof item.returnValues.tradeId !== 'undefined') parsedPayload.tradeId =
            item.returnValues.tradeId.toString();
          if(typeof item.returnValues.timeSpan !== 'undefined') parsedPayload.timespan =
            parseInt(item.returnValues.timeSpan.toString());
          if(typeof item.returnValues.timePage !== 'undefined') parsedPayload.timepage =
            parseInt(item.returnValues.timePage.toString());
          if(typeof item.returnValues.recipient !== 'undefined') parsedPayload.recipient =
            item.returnValues.recipient.toLowerCase();
            
          item.payload = JSON.stringify(parsedPayload);

          if(typeof item.blockNumber === 'undefined') item.blockNumber = item.returnValues.blockNumber.toString();

          emarket.db.events.insert(item, function(result3) {

            // let the app know we have an event being processed
            progressCallback({ source: caller, type: 'loadEventsStep', item: item });
            callback1(null, true);
            return;
          });
          return;
        });
      },
      function(err, result) {

        if(err) {

          callback(err);
          return;
        }

        callback({ result: 'ok', processed: state.processed, lastBlock: result.lastBlock });
        return;
      }
    );
  });
}

///TODO: generate failed events list

function syncEvents(options, caller, address, bodyCallback, progressCallback, callback) {

  emarket.db.events.selectWithAddressAndSynced(address, false, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    var events = result.items;
    var state = { total: events.length, processed: 0, skipped: 0, i: 0 };

    libs.async.filterLimit(events, 1,

      function(event, callback1) {

        state.i++;
        progressCallback({ source: caller, type: 'syncEventsStepProcessing', item: event });

        if(event.synced || event.transactionHash in currentlySyncing) {

          state.processed++;
          progressCallback({ source: caller, type: 'syncEventsStepSkipped', item: event });
          callback1(null, true);
          return;
        }

        currentlySyncing[event.transactionHash] = null;

        event.skipped = false;
        ///HACK: conversion from DB format
        event.address = event.contractAddress.toLowerCase();

        bodyCallback(address, event, options, progressCallback,
          
          function(result2) {

            if(result2.result != 'ok') {

              state.skipped++;
              state.processed++;

              progressCallback({ source: caller, type: 'syncEventsStepSkipped', item: event });

              if(result2.type == 'permanent') {

                event.synced = true;
                emarket.db.events.insert(event, function(result3) {

                  callback1(null, true);
                  return;
                });

                return;
              }

              callback1(null, true);
              return;
            }

            state.processed++;
            event.synced = true;
            emarket.db.events.insert(event, function(result3) {

              progressCallback({ source: caller, type: 'syncEventsStep', item: event });
              callback1(null, true);
              return;
            });

            return;
          }
        );
      },
      function(err, result) {

        if(err) {

          callback(err);
          return;
        }

        callback({ result: 'ok', processed: state.processed });
        return;
      }
    );
  });
}

module.exports = the
