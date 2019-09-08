var libs = {};
libs.xss = require('xss');
libs.lodash = require('lodash');

var emarket = {};
emarket.defaults = require.main.require('./emarket/defaults');
emarket.default_contracts = require.main.require('./emarket/default_contracts');

emarket.ethereum = {};
emarket.ethereum.eth = require.main.require('./emarket/ethereum/eth');

/*

//Describes the shipping method.
class Shipping {
  //Shipping method name.
  method : string;

  //Shipping cost (in wei). Should contain BigInteger number.
  cost : string;
};

//Describes the item for sale.
class Goods {

  //Data stored on the Store contract as event content.

  //Item name.
  title : string;

  //When the item sale expires. In Linux time format.
  timespan : number;

  //The time when item sale started. In Linux time format.
  timestamp : number;

  //Item categories. Only 1 category is supported at the moment.
  cat : string[];

  //Item tags.
  tags : string[];

  //Description of the item.
  description : string;

  //Item images. Should contain valid URLs.
  img : string[];

  //Shipping methods for item.
  ship: Shipping[];

  //Public key of the seller. In HEX format.
  pubkey : string;

  //Address of the item contract on the Ethereum blockchain. Should contain Ethereum address.
  address : string;

  //The currency of the sale. Default is ETH.
  currency: string;

  //The source of the item sale. Default is empty.
  origin: string;

  //Contains the geographical region of the sale. Default is empty.
  region: string;

  //Data stored on the Product contract as fields.

  //EscrowService contract address. Should contain Ethereum address.
  escrow : string;

  //Single piece price (in wei). Should contain BigInteger number.
  price : string;

  //Current status of the item: Available, Canceled...
  status : number;

  //How many for sale.
  saleCount : number;

  //How many for sale left.
  availableCount : number;

  //How many reserved by buyers.
  pendingCount : number;
};
*/

/*
//Listing sample:

var goods = {};
goods.title = 'JSTest';
goods.saleCount = 1;
goods.price = '100';
goods.escrow = '0xeb5fa6cbf2aca03a0df228f2df67229e2d3bd01e';
goods.timespan = emarket.defaults.defaultExpireTime;
goods.timestamp = 0;

goods.cat = ['test'];
goods.tags = ['tag1'];
goods.description = 'hello';
goods.img = [];
goods.ship = [{'method':'DHL', 'cost':'500'}];
goods.pubkey = '0x00';
goods.address = '0x00';

goods.currency = 'ETH';
goods.origin = '';
goods.region = '';
goods.availableCount = 1;
goods.pendingCount = 0;
goods.status = 1;
*/

var myxss = new libs.xss.FilterXSS({ whiteList: {} });

emarket.goods = function () {}

var the = emarket.goods;
the.myname = 'emarket.goods';

//Convert Store contract event to the goods object.
//goods has Goods type. Contains initial goods info.
//eventData has JSON object type. Contains Store contract event data.
//returns Goods object
the.fromStoreData = function (goods, eventData) {

  var listing = goods;

  listing.cat = [];
  listing.tags = [];
  listing.ship = [];
  listing.img = [];

  //XSS protection for all data fields
  libs.lodash.forEach(eventData, function(value, key) {

    if((key == 'cat') || (key == 'tags') || (key == 'img') || (key == 'ship')) {

      listing[key] = [];
      if(!value) return true;

      libs.lodash.forEach(value, function(value2, key2) {

        if(key == 'ship') {

          var shippingObject = {};
          shippingObject.method = myxss.process(value2.method);
          shippingObject.cost = myxss.process('' + value2.cost);

          if(!shippingObject.cost || (shippingObject.cost.length == 0)) {

            shippingObject.cost = '0';
          }

          listing[key].push(shippingObject);
          return true;
        }

        var filteredProp2 = myxss.process(value2);
        listing[key].push(filteredProp2);
      });

      return true;
    }

    listing[key] = myxss.process(value);
  });

  //take timespan field or use default if timespan is not set
  if(eventData.timespan) listing.timespan = parseInt(eventData.timespan);

  if(!listing.timespan || (listing.timespan == 0) || isNaN(listing.timespan)) {
    listing.timespan = emarket.defaults.defaultExpireTime;
  }

  listing.timestamp = parseInt(eventData.timestamp);
  listing.version = parseInt(eventData.version);
  listing.blockNumber = parseInt(eventData.blockNumber);

  //if(eventData.address) {
    listing.address = myxss.process(eventData.address).toLowerCase();
  //}
  //if(eventData.sender) {
    listing.sender = myxss.process(eventData.sender).toLowerCase();
  //}

  ///HACK: currency not stored in the contract
  listing.currency = 'ETH';

  return listing;
}


//Cleans up the goods object to only store permanent data in Store contract.
//goods has Goods type.
//returns the goods of Goods type.
the.toStoreData = function (goods) {

  var listing = {};

  if(goods.title && (goods.title.length > 0)) listing.title = goods.title;
  if(goods.storename) listing.storename = goods.storename;
  if(goods.cat) listing.cat = goods.cat;
  if(goods.tags && (goods.tags.length > 0)) listing.tags = goods.tags;
  if(goods.description && (goods.description.length > 0)) listing.description = goods.description;
  if(goods.img && (goods.img.length > 0)) listing.img = goods.img;
  if(goods.ship && (goods.ship.length > 0)) listing.ship = goods.ship;
  if(goods.region && (goods.region.length > 0)) listing.region = goods.region;
  if(goods.origin && (goods.origin.length > 0)) listing.origin = goods.origin;
  if(goods.currency && (goods.currency.length > 0)) listing.currency = goods.currency;
  if(goods.pubkey && (goods.pubkey.length > 0)) listing.pubkey = goods.pubkey;
  if(goods.address && (goods.address.length > 0)) listing.address = goods.address;

  if(goods.hashIpfs && (goods.hashIpfs.length > 0)) {

    listing.hashIpfs = goods.hashIpfs;
    listing.addressIpfs = goods.addressIpfs;
  }

  return listing;
}

//Convert Product contract fields to the goods fields
//goods has Goods type. Contains initial goods info.
//options may change caching settings for the call.
//returns Goods object in the callback.
the.fromProductFields = function (goods, options, callback) {

  var fields = [
    'escrow',
    'status',
    'price',
    'saleCount',
    'availableCount',
    'pendingCount'
  ];

  emarket.ethereum.eth.getFields(goods.address, emarket.default_contracts.goodsContractAbi, fields, options, function(result) {

    if(result.result != 'ok') {

      callback(result);
      return;
    }

    var item = result.item;
    var listing = goods;

    listing.escrow = myxss.process(item.escrow).toLowerCase();
    listing.status = parseInt(item.status);
    listing.price = myxss.process(item.price);
    listing.saleCount = parseInt(item.saleCount);
    listing.availableCount = parseInt(item.availableCount);
    listing.pendingCount = parseInt(item.pendingCount);

    callback({ result: 'ok', item: listing });
    return;
  });
}

//Converts the data stored in DB listings table to the Goods object.
//returns goods of Goods type.
the.fromDb = function(dbListingData) {

  if(emarket.defaults.isTesting)
    return dbListingData;

  //Decode payload DB data (listings table) to restore Goods structure
  var goods = the.fromStoreData({}, JSON.parse(dbListingData.payload));

  //And copy all DB fields to the Goods struct
  libs.lodash.forEach(dbListingData, function(value, key) {

    goods[key] = value;
  });

  //Restore tags and cat arrays from DB.
  goods.tags = [];
  if(dbListingData.tag1 && dbListingData.tag1.length > 0) goods.tags.push(dbListingData.tag1);
  if(dbListingData.tag2 && dbListingData.tag2.length > 0) goods.tags.push(dbListingData.tag2);
  if(dbListingData.tag3 && dbListingData.tag3.length > 0) goods.tags.push(dbListingData.tag3);

  goods.cat = [];
  if(dbListingData.category && dbListingData.category.length > 0) {
    goods.cat.push(dbListingData.category);
  }

  delete goods.payload;

  // set default availableCount for IPFS items
  if(typeof goods.availableCount == 'undefined') {

    goods.availableCount = goods.saleCount;
  }

  // set default pendingCount for IPFS items
  if(typeof goods.pendingCount == 'undefined') {

    goods.pendingCount = 0;
  }

  return goods;
}

//Converts the Goods object to the data stored in DB listings table.
//returns JSON object in listings table format.
the.toDb = function(goods) {

  var goodsDB = {};
  var goodsPayload = {};

  //Create a copy of the Goods object - will store DB object data.
  libs.lodash.forEach(goods, function(value, key) {

    goodsDB[key] = value;
  });

  //Create a copy of the Goods object - will store DB object payload field
  libs.lodash.forEach(goods, function(value, key) {

    goodsPayload[key] = value;
  });

  //Convert Goods arrays to DB fields
  var category = '';
  if(goodsDB.cat) category = goodsDB.cat[0];

  var tag1 = '';
  if(goodsDB.tags) tag1 = goodsDB.tags[0];
  if(typeof tag1 === 'undefined') tag1 = '';
  var tag2 = '';
  if(goodsDB.tags) tag2 = goodsDB.tags[1];
  if(typeof tag2 === 'undefined') tag2 = '';
  var tag3 = '';
  if(goodsDB.tags) tag3 = goodsDB.tags[2];
  if(typeof tag3 === 'undefined') tag3 = '';

  var title = goodsDB.title;
  if(typeof title === 'undefined') title = '';

  var currency = goodsDB.currency;
  if(typeof currency === 'undefined') currency = '';

  var region = goodsDB.region;
  if(typeof region === 'undefined') region = '';

  var origin = goodsDB.origin;
  if(typeof origin === 'undefined') origin = '';

  goodsDB.tag1 = tag1;
  goodsDB.tag2 = tag2;
  goodsDB.tag3 = tag3;
  goodsDB.category = category;

  if(typeof goodsDB.title === 'undefined') goodsDB.title = '';
  if(typeof goodsDB.currency === 'undefined') goodsDB.currency = '';
  if(typeof goodsDB.region === 'undefined') goodsDB.region = '';
  if(typeof goodsDB.origin === 'undefined') goodsDB.origin = '';
  if(typeof goodsDB.address === 'undefined') goodsDB.address = '';
  if(typeof goodsDB.sender === 'undefined') goodsDB.sender = '';
  if(typeof goodsDB.escrow === 'undefined') goodsDB.escrow = '';
  if(typeof goodsDB.status === 'undefined') goodsDB.status = 0;
  if(typeof goodsDB.price === 'undefined') goodsDB.price = '0';
  if(typeof goodsDB.saleCount === 'undefined') goodsDB.saleCount = 0;
  if(typeof goodsDB.availableCount === 'undefined') goodsDB.availableCount = 0;
  if(typeof goodsDB.pendingCount === 'undefined') goodsDB.pendingCount = 0;

  //Add endTimestamp for DB indexed access
  goodsDB.endTimestamp = goodsDB.timestamp + goodsDB.timespan;

  //remove all fields stored in DB
  delete goodsPayload.address;
  delete goodsPayload.escrow;
  delete goodsPayload.title;
  delete goodsPayload.sender;
  delete goodsPayload.price;
  delete goodsPayload.version;
  delete goodsPayload.blockNumber;
  delete goodsPayload.timestamp;
  delete goodsPayload.timespan;
  delete goodsPayload.endTimestamp; //duplicate to timestamp + timespan
  delete goodsPayload.cat;
  delete goodsPayload.category; //duplicate to cat
  delete goodsPayload.tags;
  delete goodsPayload.tag1; //duplicate to tags
  delete goodsPayload.tag2;
  delete goodsPayload.tag3;
  delete goodsPayload.currency;
  delete goodsPayload.region;
  delete goodsPayload.origin;
  delete goodsPayload.status;
  delete goodsPayload.saleCount;
  delete goodsPayload.availableCount;
  delete goodsPayload.pendingCount;
  delete goodsPayload.hashIpfs;
  delete goodsPayload.addressIpfs;
  delete goodsPayload.addressEth;
  delete goodsPayload.payload;

  //Store everything left to a JSON string
  goodsDB.payload = JSON.stringify(goodsPayload);

  return goodsDB;
}

module.exports = the
