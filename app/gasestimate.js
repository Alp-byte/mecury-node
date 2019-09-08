var goodsContractDeploymentCost = 2203030;
var goodsListingCost = 43682;
var goodsBuyCost = 50000; ///TODO: take real value
var goodsAcceptCost = 50000; ///TODO: take real value
var goodsRejectCost = 50000; ///TODO: take real value
var eventByteCost = 8;
var gasPriceWei = 20;

/*
How to use:

When selling an item call estimateGoodsDeployment() to get a gas usage for goods contract deployment without any info.
Call estimateGoodsListing() to know a gas usage for adding goods info to market.
Call estimateGoodsSellBasicLength() to estimate the length of the sell event. Multiply it to eventByteCost to estimate gas usage.
Add eventByteCost * user provided text (eg title or description) length and add it to the gas usage.
If region, origin or currency is set by user add eventByteCost * estimateGoodsSellAddRegionLength(),
  eventByteCost * estimateGoodsSellAddOriginLength(), eventByteCost * estimateGoodsSellAddCurrencyLength() and add
  to the gas usage. Add eventByteCost * user provided text for origin, region or currency length.

When buying an item call estimateGoodsBuy() to know a gas usage for buy call.
Call estimateGoodsBuyBasicLength to estimate the length of the buy event. Multiply it to eventByteCost to estimate gas usage.
If shipping info is set add eventByteCost * estimateGoodsBuyAddShippingLength(). Add eventByteCost * user provided text
  for shipping method and address.
If private message is added add eventByteCost * estimateGoodsBuyAddMessageLength(). Add eventByteCost * user provided text.
*/

function estimateGoodsDeployment() {

  return goodsContractDeploymentCost;
}

function estimateGoodsListing() {

  return goodsListingCost;
}

function estimateGoodsBuy() {

  return goodsBuyCost;
}

function estimateGoodsSellBasicLength() {

  var emptyItem = {'title':'','cat':[],'tags':[],'description':'','img':[],
    'pubkey':'0x0000000000000000000000000000000000000000000000000000000000000000',
    'address':'0x0000000000000000000000000000000000000000','ship':[]};
  return JSON.stringify(emptyItem).length;
}

function estimateGoodsSellAddRegionLength() {

  var item = ',\'region\':\'\'';
  return item.length;
}

function estimateGoodsSellAddOriginLength() {

  var item = ',\'origin\':\'\'';
  return item.length;
}

function estimateGoodsSellAddCurrencyLength() {

  var item = ',\'currency\':\'\'';
  return item.length;
}

function estimateGoodsBuyBasicLength() {

  var emptyItem = 
    {'private':{'msg':'{}','iv':'0x00000000000000000000000000000000','cipher':'aes-256-cbc',
    'key':{'enc':
      {'msg':'000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'iv':'0x00000000000000000000000000000000','cipher':'aes-256-cbc',
      'nonce':'0x0000000000000000000000000000000000000000000000000000000000000000'}},
      'pubkey':'0x0000000000000000000000000000000000000000000000000000000000000000'}};
  return JSON.stringify(emptyItem).length;
}

function estimateGoodsBuyAddShippingLength() {

  var item = {'ship':{'method':'','to':''}};
  return JSON.stringify(item).length - 2;
}

function estimateGoodsBuyAddMessageLength() {

  var item = ',\'msg\':\'\'';
  return item.length;
}

function estimateGasPrice(gas) {

  return gas * gasPriceWei;
}