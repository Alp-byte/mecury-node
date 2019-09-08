var libs = {};
libs.async = require('async');
libs.web3 = require('web3');
libs.bignumber = require('bignumber.js');
libs.lodash = require('lodash');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');

emarket.ethereum = {};
emarket.ethereum.api = require.main.require('./emarket/ethereum/api');
emarket.ethereum.web3 = require.main.require('./emarket/ethereum/web3');
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

emarket.gas = {};

emarket.gas.priceestimate = function () {}

var the = emarket.gas.priceestimate;
the.myname = 'emarket.gas.priceestimate';

// what hashpower we accept as safe low
the.safeLowPercentage = 30.0;

the.estimate = function (options, callback) {

  readBlocks(options.sampleBlocks, options, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    var blocksParsed = parseTransactions(result.blocks);
    var groupData = groupBlocksByPrice(blocksParsed);
    var gasPrice = computeGasPrice(groupData.prices, groupData.blocksCount, the.safeLowPercentage);

    callback({ result: 'ok', price: gasPrice });
    return;
  });
}

function readBlocks(count, options, callback) {

  if(count <= 0) {

    callback({ result: 'ok', processed: 0, skipped: 0, blocks: [] });
    return;
  }

  options.fullTransactions = true;
  emarket.ethereum.eth.getBlock('latest', options, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    count--;

    var lastBlock = result.block;
    var lastNumber = lastBlock.number;

    if(count > lastNumber) {

      count = lastNumber;
    }

    var state = { total: count, currentNumber: lastNumber, processed: 1, skipped: 0, blocks: [ lastBlock ] };

    libs.async.timesLimit(count, 1,

      function(index, callback1) {

        state.processed++;
        state.currentNumber--;

        emarket.ethereum.eth.getBlock(state.currentNumber, options, function(result2) {

          // in case of error skip this block
          if(result2.result != 'ok') {

            state.skipped++;
            callback1(null, true);
            return;
          }

          state.blocks.push(result2.block);
          callback1(null, true);
          return;
        });
      },

      function(err, result) {

        if(err) {

          callback(err);
          return;
        }

        callback({ result: 'ok', processed: state.processed, skipped: state.skipped, blocks: state.blocks });
        return;
      }
    );
  });
}

function parseTransactions(blocks) {

  var web3 = new libs.web3(libs.web3.givenProvider);
  var rawData = [];

  libs.lodash.forEach(blocks, function(block) {

    if(block.transactions.length == 0) return true;

    var minGasPrice = new libs.bignumber.BigNumber(block.transactions[0].gasPrice);

    libs.lodash.forEach(block.transactions, function(tx) {

      if(new libs.bignumber.BigNumber(tx.gasPrice).lt(minGasPrice)) {

        minGasPrice = new libs.bignumber.BigNumber(tx.gasPrice);
      }
    });

    var gasPriceGwei = new libs.bignumber.BigNumber(web3.utils.fromWei(minGasPrice.toString(), 'gwei'));
    var gasPriceGweiRounded = gasPriceGwei.integerValue(libs.bignumber.BigNumber.ROUND_FLOOR);

    rawData.push({ miner: block.miner, blockHash: block.hash, gasPrice: minGasPrice.toString(),
      gasPrice10Gwei: gasPriceGweiRounded.toString() });
  });

  return rawData;
}

function comparePrice(a, b) {

  var aPrice = new libs.bignumber.BigNumber(a.gasPrice10Gwei);
  var bPrice = new libs.bignumber.BigNumber(b.gasPrice10Gwei);

  if (aPrice.eq(bPrice)) return 0;
  if (aPrice.gt(bPrice)) return 1;

  return -1;
}

function groupBlocksByPrice(rawData) {

  var prices = {};
  var cumsum = 0;

  var sortedData = rawData.sort(comparePrice);

  libs.lodash.forEach(sortedData, function(blockData) {

    cumsum++;

    if((typeof prices[blockData.gasPrice10Gwei] == 'undefined') || !prices[blockData.gasPrice10Gwei].exists) {

      prices[blockData.gasPrice10Gwei] = {};
      prices[blockData.gasPrice10Gwei].exists = true;
    }

    prices[blockData.gasPrice10Gwei].cumsum = cumsum;
  });

  return { prices: prices, blocksCount: cumsum };
}

function computeGasPrice(prices, blocksCount, percentage) {

  var web3 = new libs.web3(libs.web3.givenProvider);
  var gasPriceWei = new libs.bignumber.BigNumber('0');

  libs.lodash.forEach(prices, function(value, key) {

    var myPercentage = (value.cumsum * 100.0) / blocksCount;
    if(percentage >= myPercentage) return true;

    //convert gwei to wei for better compatibility
    gasPriceWei = new libs.bignumber.BigNumber(web3.utils.toWei(key, 'gwei'));
    return false;
  });

  return gasPriceWei.toString();
}

module.exports = the