var emarket = {};

emarket.testdata = function () {}

var the = emarket.testdata;
the.myname = 'emarket.testdata';

the.allListings = [
  {'title':'Test Kitten #99','cat':['PET'],'tags':['test'],
  'description':'Just a test kitten.',
  'img':[''],'pubkey':'0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730',
  'address':'0xa820f527c6cdcf56e0dd53f047ddf50841f1b449','timestamp':'1473619795','height':'2241315',
  'timespan':1209600,'endTimestamp':1474829395,
  'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29',
  'escrow':'0xcb5b318d3392366a9dfb075e3b27fe3a7a228c59',
  'status':1,'saleCount':3,'price':'9.9999e+22','availableCount':3,'pendingCount':0,'currency':'ETH','priceEth':'99999'},

  {'title':'Test Kitten #42','cat':['COLLECT'],'tags':['test', 'tag2'],
  'description':'Test of kitten listing with no escrow provider indicated.',
  'img':[''],'pubkey':'0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730',
  'address':'0xd054c5a6645d7a854b7357449b971dd264f216f3','timestamp':'1473620667','height':'2241374',
  'timespan':1209600,'endTimestamp':1474830267,
  'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29',
  'escrow':'0xcb5b318d3392366a9dfb075e3b27fe3a7a228c59',
  'status':1,'saleCount':1,'price':'555000000000000000000','availableCount':1,'pendingCount':0,'currency':'ETH','priceEth':'555'},

  {'title':'Robot Cat','cat':['COLLECT'],'tags':['test'],
  'description':'Robotic kitten',
  'img':['http://r.ddmcdn.com/w_609/s_f/o_1/cx_0/cy_15/cw_609/ch_406/APL/uploads/2014/06/02-kitten-cuteness-1.jpg'],
  'pubkey':'0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730',
  'address':'0x7a2bac051a167e7850207951f1ae0e1045a50340','timestamp':'1473672098','height':'2244937',
  'timespan':1209600,'endTimestamp':1474881698,
  'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29',
  'escrow':'0xcb5b318d3392366a9dfb075e3b27fe3a7a228c59',
  'status':1,'saleCount':3,'price':'3.333e+21','availableCount':3,'pendingCount':0,'currency':'ETH','priceEth':'3333'},

  {'title':'Cute Kitten','cat':['ENTERTAIN'],'tags':['test'],
  'description':'One small kitten.',
  'img':['http://r.ddmcdn.com/w_606/s_f/o_1/cx_0/cy_15/cw_606/ch_404/APL/uploads/2014/06/01-kitten-cuteness-1.jpg'],
  'pubkey':'0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730',
  'address':'0x45ae91b4e1135b4183728864511ac5aff937b8fb','timestamp':'1473672366','height':'2244961',
  'timespan':1209600,'endTimestamp':1474881966,
  'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29',
  'escrow':'0xcb5b318d3392366a9dfb075e3b27fe3a7a228c59',
  'status':1,'saleCount':1,'price':'2.2222e+22','availableCount':1,'pendingCount':0,'currency':'ETH','priceEth':'22222'},

  {'title':'Murder Kitten','cat':['BUSINESS'],'tags':['test', 'tag2'],
  'description':'This kitten thinks about nothing but murder all day.',
  'img':['http://r.ddmcdn.com/w_603/s_f/o_1/cx_0/cy_15/cw_603/ch_402/APL/uploads/2014/06/05-kitten-cuteness-1.jpg'],
  'pubkey':'0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730',
  'address':'0xb4430250e5355c6f9011458fca1a0570b0c925ad','timestamp':'1473672551','height':'2244973',
  'timespan':1209600,'endTimestamp':1474882151,
  'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29',
  'escrow':'0xcb5b318d3392366a9dfb075e3b27fe3a7a228c59',
  'status':1,'saleCount':1,'price':'1.111e+21','availableCount':1,'pendingCount':0,'currency':'ETH','priceEth':'1111'},

  {'title':'Beach Kitten','cat':['COLLECT'],'tags':['test'],
  'description':'Surfin’ kitty.',
  'img':['http://r.ddmcdn.com/w_624/s_f/o_1/cx_0/cy_17/cw_624/ch_416/APL/uploads/2014/06/ep220-01-625x450.jpg'],
  'pubkey':'0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730',
  'address':'0x398859eeea449dc60a21ffd30e0cb8f5cbf67591','timestamp':'1473673465','height':'2245034',
  'timespan':1209600,'endTimestamp':1474883065,
  'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29',
  'escrow':'0xcb5b318d3392366a9dfb075e3b27fe3a7a228c59',
  'status':1,'saleCount':1,'price':'1.2345e+22','availableCount':1,'pendingCount':0,'currency':'ETH','priceEth':'12345'},

  {'title':'Holiday Kitty','cat':['ELECTRON'],'tags':['test'],
  'description':'Christmas Cat',
  'img':['http://r.ddmcdn.com/w_621/s_f/o_1/cx_0/cy_16/cw_621/ch_414/APL/uploads/2014/06/too-cute-3-622.png'],
  'pubkey':'0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730',
  'address':'0x973ec555e2a501ea2190e0a7e9e9f47e5ad7336c','timestamp':'1473674430','height':'2245104',
  'timespan':1209600,'endTimestamp':1474884030,
  'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29',
  'escrow':'0xcb5b318d3392366a9dfb075e3b27fe3a7a228c59',
  'status':1,'saleCount':1,'price':'88000000000000000000','availableCount':1,'pendingCount':0,'currency':'ETH','priceEth':'88'}
];

the.sellItemHash = '0xdd0e543654c6309409af8a2a718ddbc0a3f941838c037ef4538d5a9dc80e7e8c';
the.buyItemHash = '0xdd0e543654c6309409af8a2a718ddbc0a3f941838c037ef4538d5a9dc80e7e8c';
the.cancelItemHash = '0xdd0e543654c6309409af8a2a718ddbc0a3f941838c037ef4538d5a9dc80e7e8c';
the.acceptItemHash = '0xdd0e543654c6309409af8a2a718ddbc0a3f941838c037ef4538d5a9dc80e7e8c';
the.rejectItemHash = '0xdd0e543654c6309409af8a2a718ddbc0a3f941838c037ef4538d5a9dc80e7e8c';
the.openDisputeItemHash = '0xdd0e543654c6309409af8a2a718ddbc0a3f941838c037ef4538d5a9dc80e7e8c';
the.closeDisputeItemHash = '0xdd0e543654c6309409af8a2a718ddbc0a3f941838c037ef4538d5a9dc80e7e8c';
the.claimDisputeItemHash = '0xdd0e543654c6309409af8a2a718ddbc0a3f941838c037ef4538d5a9dc80e7e8c';

the.itemOrders = {
  '0xa820f527c6cdcf56e0dd53f047ddf50841f1b449':[
    {'tradeId':'7720153675935269715', 'eventType':1, 'count':2, 'payment':'9.9999e+22', 'dataInfo':{"private":{"msg":"DiiZ11ihnZzon8+hfEuWlkZKPhQ1ohxV8VNVMWyLoyo=","iv":"0x95cba97f5c9013daaa20e1a5ad1d43da","cipher":"aes-256-cbc","key":{"enc":{"msg":"lPuK2WFIozQZMek3tvApQHdjTmsbbsooGk5+ch8oAPrDPpu/d+cS9izI0CBYqoF994Wr7ytWgi2+0OzpqhL2QYacYTxLNtS+vtiuQZ2aXhc=","iv":"0x4f2977ae2c00552b4074e499ecf01292","cipher":"aes-256-cbc","nonce":"0xb6826234e3efe1d9912e397e9d2f71f0ff72d29fe10733516ea713ea32a61e0d"}},"pubkey":"0x0b16c2009704a8047d99639fe2cbb099936216f48312f2d8226c4a2a96da0974"}}, 'timestamp':'1473619795','height':'2241315', 'sender':'0x44791e6990ce47fe7a906b0338d27650d55122f8'},
    {'tradeId':'7720153675935269715', 'eventType':2, 'count':2, 'payment':'9.0000e+22', 'dataInfo':{"private":{"msg":"eUzV4mUEjv6iMh3frcIDCg33nqtYUHfZLoygbTcKS9U=","iv":"0x47a4a24d919e87dd994ba1bd31d86879","cipher":"aes-256-cbc","pubkey":"0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730"}}, 'timestamp':'1473619895','height':'2241317', 'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29'}
  ],
  '0xd054c5a6645d7a854b7357449b971dd264f216f3':[
    {'tradeId':'12790250850146722829', 'eventType':1, 'count':1, 'payment':'555000000000000000000', 'dataInfo':{"private":{"msg":"pvtIxInyie4ikbiftdFZikc5EYcDGA5C/dRRwfqQLYiAa22ZqEvAm/A07x9jl7103HTM55ZUNGoNDoQ7ZC83rA==","iv":"0x63b050bc7b64c9c7ac6347aea018848d","cipher":"aes-256-cbc","key":{"enc":{"msg":"Oa5T2SmQYiJSiHJ75u7K9P2xWsMNQqSBYjyHjxr2VUtrDdWHi559DoOlDl228Cphv8MWTakVJ8OhH5+c9yS6wpYKQulVMqK4ITxpTq5HNB4=","iv":"0xa5c4c18263d8b991d265fc6f4e2d9a45","cipher":"aes-256-cbc","nonce":"0xef045fbf44eadc8f4188b16251f8fd1bb9b2787078d32e63dcb9a7b2abc310de"}},"pubkey":"0x0b16c2009704a8047d99639fe2cbb099936216f48312f2d8226c4a2a96da0974"}}, 'timestamp':'1473619795','height':'2241315', 'sender':'0x44791e6990ce47fe7a906b0338d27650d55122f8'},
    {'tradeId':'12790250850146722829', 'eventType':2, 'count':1, 'payment':'550000000000000000000', 'dataInfo':{"private":{"msg":"Zj23D3B1zC4ZPZrkcj4xwlQQOvrwZWQX7AqQyP93agI=","iv":"0xf3bc67e966d2c39aea2291fa03157f3f","cipher":"aes-256-cbc","pubkey":"0xaf5763d89a71439677399808886886363b84180eca126240d2014e4246be6730"}}, 'timestamp':'1473619995','height':'2241318', 'sender':'0x4460f4c8edbca96f9db17ef95aaf329eddaeac29'}
  ]
};

module.exports = the