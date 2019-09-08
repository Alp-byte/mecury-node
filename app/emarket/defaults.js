var emarket = {};

emarket.defaults = function () {}

var the = emarket.defaults;

the.version = '1.0.0';
the.isTesting = false;
the.isTestnet = true;
the.privateTestnet = false;
the.privateTestnetId = 15;
the.marketVersion = 1;

the.nonceDuplicateRetries = 5; 
the.nonceDuplicateInterval = 1000;

//safelow is 3 gwei
the.gasPrice = '3000000000';
if(the.isTestnet) the.gasPrice = '5000000000';

///HACK: first block in announcements
the.startBlock = 5850262;
if(the.isTestnet) the.startBlock = 4200000;
if(the.isTestnet && the.privateTestnet) the.startBlock = 0;

//91.235.72.49 - blackyblack
//79.8.124.99 - Samuele
//46.101.204.158 - Digital Ocean geth4

the.ethRpcHosts = ['https://api.myetherapi.com/eth', 'https://mainnet.infura.io/mew'];
if(the.isTestnet) the.ethRpcHosts = ['https://ropsten.infura.io/mew', 'https://api.myetherapi.com/rop'];
if(the.isTestnet && the.privateTestnet) the.ethRpcHosts = ['http://46.101.204.158:8546'];

the.hostsProxies = [];
if(the.isTestnet) the.hostsProxies = ['http://142.44.243.63:3128'];

the.ethRpcRetries = 5;
the.ethTimeoutBlocks = 50;

the.cachingServers = ['http://79.8.124.99:18545/api', 'http://91.235.72.49:18545/api'];
if(the.isTestnet) the.cachingServers = [];

the.cachingAllow = false;
the.cachingRetries = 3;

the.proxyAllow = false;

//listing fees 
the.defaultFeeEther = '0.01';

the.defaultExpireTime = (60 * 60 * 24 * 7 * 4);
the.doubleExpireTime = (60 * 60 * 24 * 7 * 8);

//escrow related
the.defaultFreezeTime = (60 * 60 * 24 * 30);
the.defaultEscrowFeePromille = 0;
the.defaultEscrowRewardPromille = 10;
the.defaultLockTimeoutBlocks = 60000;

module.exports = the
