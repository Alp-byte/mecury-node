// solhint-disable max-line-length, code-complexity, function-max-lines
// @title A contract to provide escrow protection to the trade

/* Deployment:
Owner: arbiter
Owner basic provider: 0x33a7ae7536d39032e16b0475aef6692a09727fe2
Owner Ropsten testnet: 0x4460f4c8edbca96f9db17ef95aaf329eddaeac29
Owner private testnet: 0x4460f4c8edbca96f9db17ef95aaf329eddaeac29
Address: dynamic
Address basic provider: 0x1577d47bc7e36405c9130700985a92d0a63f7ecc
Address Ropsten testnet: 0xd4efeae28d58004c7076a628408706931472665f 
Address private testnet: 0xbf79da05369dae17931482e15565670e99119115
ABI: [{"constant":true,"inputs":[],"name":"freezePeriod","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"trades","outputs":[{"name":"ownerContract","type":"address"},{"name":"seller","type":"address"},{"name":"buyer","type":"address"},{"name":"funds","type":"uint256"},{"name":"frozenTime","type":"uint256"},{"name":"buyerNo","type":"bool"},{"name":"sellerNo","type":"bool"},{"name":"resolved","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"rewardPromille","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_who","type":"address"},{"name":"_dataInfo","type":"string"}],"name":"no","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feeFunds","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"activeTrades","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_dataInfo","type":"string"}],"name":"getMoney","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"SETTINGS_ADDRESS","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_seller","type":"address"},{"name":"_buyer","type":"address"},{"name":"_dataInfo","type":"string"}],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_who","type":"address"},{"name":"_arbRewardPromille","type":"uint256"},{"name":"_dataInfo","type":"string"}],"name":"arbYes","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"contentCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"getFees","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"feePromille","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_who","type":"address"},{"name":"_dataInfo","type":"string"}],"name":"yes","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"arbiter","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_freezePeriod","type":"uint256"},{"name":"_feePromille","type":"uint256"},{"name":"_rewardPromille","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"version","type":"uint256"},{"indexed":false,"name":"eventType","type":"uint8"},{"indexed":true,"name":"sender","type":"address"},{"indexed":true,"name":"recipient","type":"address"},{"indexed":false,"name":"tradeId","type":"uint256"},{"indexed":false,"name":"dataInfo","type":"string"},{"indexed":false,"name":"payment","type":"uint256"}],"name":"LogEvent","type":"event"}]
Optimized: yes
Solidity version: v0.4.24
*/

// solhint-enable max-line-length

pragma solidity 0.4.24;


contract MiniMeToken {

    /// @notice Send `_amount` tokens to `_to` from `msg.sender`
    /// @param _to The address of the recipient
    /// @param _amount The amount of tokens to be transferred
    /// @return Whether the transfer was successful or not
    function transfer(address _to, uint256 _amount) public returns (bool success);

    /// @notice Send `_amount` tokens to `_to` from `_from` on the condition it
    ///  is approved by `_from`
    /// @param _from The address holding the tokens being transferred
    /// @param _to The address of the recipient
    /// @param _amount The amount of tokens to be transferred
    /// @return True if the transfer was successful
    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success);

    /// @param _owner The address that's balance is being requested
    /// @return The balance of `_owner` at the current block
    function balanceOf(address _owner) public constant returns (uint256 balance);

    /// @notice `msg.sender` approves `_spender` to spend `_amount` tokens on
    ///  its behalf. This is a modified version of the ERC20 approve function
    ///  to be a little bit safer
    /// @param _spender The address of the account able to transfer the tokens
    /// @param _amount The amount of tokens to be approved for transfer
    /// @return True if the approval was successful
    function approve(address _spender, uint256 _amount) public returns (bool success);
}


contract FeedBbt {

    uint public fee;
}


contract Settings {

    // our settings
    mapping (uint => uint) public settings;
}


contract EscrowService {

    // @noticeInformation for each escrow deposit
    // @dev
    //   'ownerContract' the source of the funds, might be a trusted contract to manage funds (address)
    //   'seller' seller of the product (address)
    //   'buyer' buyer of the product (address) (also used to check if the struct exists)
    //   'funds' total funds in trade
    //   'buyerNo' buyer No decision (default false)
    //   'sellerNo' seller No decision
    //   'resolved' arbiter decision who won (ResolvedTypes)
    struct EscrowInfo {
        address ownerContract;
        address seller;
        address buyer;
        uint funds;
        uint frozenTime;
        bool buyerNo;
        bool sellerNo;
        uint resolved;
    }
    
    // HACK: this is Ropsten testnet settings address
    address public constant SETTINGS_ADDRESS = 0x46c0F19e3b7f2DbCC7787D0a854E363C42C29338;  

    // HACK: this is private testnet settings address
    //address public constant SETTINGS_ADDRESS = 0x52fC489A53c42d29eF1286aF62048F60C39B912e;

    //mainnet
    //address public constant SETTINGS_ADDRESS = 0x8b41d19D801C517997d26C98CfB587Ac3c8b1958;

    //enum EventTypes
    uint8 constant internal UNLOCK = 11;
    uint8 constant internal FREEZE = 12;
    uint8 constant internal RESOLVED = 13;
    uint8 constant internal DEPOSIT = 14;
    uint8 constant internal TIMEDOUT = 15;
    uint8 constant internal DECIDED = 16;

    //enum ResolvedTypes
    uint8 constant internal RESOLVED_NONE = 0;
    uint8 constant internal RESOLVED_BUYER = 1;
    uint8 constant internal RESOLVED_SELLER = 2;

    //enum SettingTypes
    uint constant internal SETTING_DEPOSIT_TOKEN_ADDRESS = 10;
    uint constant internal SETTING_DEPOSIT_TOKEN_RECIPIENT = 11;
    uint constant internal SETTING_DEPOSIT_TOKEN_PRICE_FEED_ADDRESS = 12;
    uint constant internal SETTING_DEPOSIT_TOKEN_FEE_MILLIONTH = 13;
    uint constant internal SETTING_ARBITRATION_PERIOD = 20;

    // data
    uint constant internal SAFE_GAS = 50000;

    // event counters
    uint public contentCount = 0;

    // owner address
    address public arbiter;

    // how many time do we have for dispute resolution
    uint public freezePeriod;

    // each lock fee in promilles.
    uint public feePromille;

    // reward in promilles. promille = percent * 10, eg 1,5% reward = 15 rewardPromille
    uint public rewardPromille;

    // how many fees are collected for the arbiter
    uint public feeFunds;

    // escrow struct mapped by tradeId reference Id
    mapping (uint => EscrowInfo) public trades;

    // a number of not finished trades
    uint public activeTrades;

    // a config contract
    Settings config;

    bool private atomicLock;

    // @dev see eventHelper function
    event LogEvent(uint indexed version, uint8 eventType, address indexed sender, address indexed recipient,
        uint tradeId, string dataInfo, uint payment);

    // allow only arbiter
    modifier onlyArbiter {
        require(msg.sender == arbiter);
        _;
    }

    // @notice constructor, set initial variables and check if
    // some conditions are met
    // @param _freezePeriod default freeze period in seconds
    // @param _feePromille a single trade fee percentile expressed in decimal * 10
    // @param _rewardPromille arbiter reward percentile expressed in decimal * 10
    constructor(uint _freezePeriod, uint _feePromille, uint _rewardPromille) public {   
        // set the arbiter as the creator of the contract
        arbiter = msg.sender;

        // promilles cannot be above 1000
        require(_feePromille <= 1000);
        require(_rewardPromille <= 1000);
        require((_feePromille + _rewardPromille) <= 1000);

        freezePeriod = _freezePeriod;
        feePromille = _feePromille;
        rewardPromille = _rewardPromille;

        config = Settings(SETTINGS_ADDRESS);
    }

    // @notice fallback function, don't allow call to it
    function () public {
        revert();
    }

    // @notice selfdestruct contract when called by the arbiter
    function kill() public onlyArbiter {

        // do not allow killing contract with active trades
        require(activeTrades == 0);

        // selfdestruct contract if the above conditions are not met
        selfdestruct(msg.sender);
    }

    // @notice deposit funds to the contract
    // @param _version dataInfo message version
    // @param _tradeId trade reference ID
    // @param _seller seller side of the escrow
    // @param _buyer buyer side of the escrow
    // @param _dataInfo arbitrary data message
    function deposit(uint _version, uint _tradeId, address _seller, address _buyer, string _dataInfo) public payable
    {
        //only allow non zero deposits
        require(msg.value > 0);

        EscrowInfo storage tradeInfo = trades[_tradeId];

        // check if trade already exists
        require(tradeInfo.funds == 0);

        // calculate fee based on the global feePromille
        uint fee = (msg.value * feePromille) / 1000; // WARNING: use safemath for the change

        // limit fees
        require(fee <= msg.value);

        uint funds = (msg.value - fee); // WARNING: use safemath
        // update the global fee
        feeFunds += fee;
        activeTrades += 1;

        // update struct
        tradeInfo.ownerContract = msg.sender;
        tradeInfo.buyer = _buyer;
        tradeInfo.seller = _seller;
        tradeInfo.funds = funds;
        tradeInfo.resolved = RESOLVED_NONE;

        eventHelper(_version, DEPOSIT, _buyer, _seller, _tradeId, _dataInfo, msg.value);
    }
    
    // @notice vote YES - immediately sends funds to the peer
    // @param _version dataInfo message version
    // @param _tradeId trade reference ID
    // @param _who the YES voter when function is called by a relay contract
    // @param _dataInfo arbitrary data message
    function yes(uint _version, uint _tradeId, address _who, string _dataInfo) public {

        EscrowInfo storage tradeInfo = trades[_tradeId];

        //check for tradeId existence
        require(tradeInfo.funds != 0);

        //check for duplicate resolve
        require(tradeInfo.resolved == RESOLVED_NONE);
        
        // filter invalid senders
        require((msg.sender == tradeInfo.buyer) || (msg.sender == tradeInfo.seller) ||
            (msg.sender == tradeInfo.ownerContract));

        uint payment = tradeInfo.funds;

        // HACK: should not get here - funds cannot be unlocked in this case
        require(payment <= address(this).balance);

        if (msg.sender != tradeInfo.ownerContract) {
            _who = msg.sender;
        }

        // filter invalid recipients
        require((_who == tradeInfo.buyer) || (_who == tradeInfo.seller));

        if (_who == tradeInfo.seller) {
            tradeInfo.resolved = RESOLVED_BUYER;

            // reset locked funds
            tradeInfo.funds = 0;

            // send funds to recipient
            safeSend(tradeInfo.buyer, payment);

           // remove record from trades
            if (activeTrades > 0)
                activeTrades -= 1; // WARNING: use safemath

            eventHelper(_version, UNLOCK, tradeInfo.seller, tradeInfo.buyer, _tradeId, _dataInfo, payment);
            return;
        }

        tradeInfo.resolved = RESOLVED_SELLER;
        eventHelper(_version, UNLOCK, tradeInfo.buyer, tradeInfo.seller, _tradeId, _dataInfo, payment);
    }

    // @notice request arbitration on this trade
    // @dev register the arbitration request by updating
    // the '<buyer/seller>No' struct variable 
    // @param _version dataInfo message version
    // @param _tradeId trade reference ID
    // @param _who the NO voter when function is called by a relay contract
    // @param _dataInfo arbitrary data message
    function no(uint _version, uint _tradeId, address _who, string _dataInfo) public {

        EscrowInfo storage tradeInfo = trades[_tradeId];

        //check for tradeId existence
        require(tradeInfo.funds != 0);

        //check for duplicate resolve
        require(tradeInfo.resolved == RESOLVED_NONE);
        
        // filter invalid senders
        require((msg.sender == tradeInfo.buyer) || (msg.sender == tradeInfo.seller) ||
            (msg.sender == tradeInfo.ownerContract));

        // freeze funds, only allow one time freeze (frozenTime's default value is 0)
        if (tradeInfo.frozenTime == 0) {
            tradeInfo.frozenTime = now;
        }

        if (msg.sender != tradeInfo.ownerContract) {
            _who = msg.sender;
        }

        // filter invalid recipients
        require((_who == tradeInfo.buyer) || (_who == tradeInfo.seller));

        address recipient = tradeInfo.seller;

        if (_who == tradeInfo.seller) {
            tradeInfo.sellerNo = true;
            recipient = tradeInfo.buyer;
        } else if (_who == tradeInfo.buyer) {
            tradeInfo.buyerNo = true;
        } 

        eventHelper(_version, FREEZE, _who, recipient, _tradeId, _dataInfo, tradeInfo.funds);
    }

    // @notice arbiter's decision on the case, it
    // can only decide when both buyer and seller
    // voted NO, arbiter decides on his own reward
    // but not bigger than announced percentage (rewardPromille)
    // @param _version dataInfo message version
    // @param _tradeId trade reference id
    // @param _who address of the "yes" decision (buyer or seller)
    // @param _arbRewardPromille arbiter reward percentage * 10 (only if
    // the arbiter wants a lower reward, otherwise default one will be used)
    // @param _dataInfo arbitrary data message
    function arbYes (
        uint _version,
        uint _tradeId,
        address _who,
        uint _arbRewardPromille,
        string _dataInfo
    ) public onlyArbiter {
        EscrowInfo storage tradeInfo = trades[_tradeId];

        //check for tradeId existence
        require(tradeInfo.funds != 0);

        //check for duplicate resolve
        require(tradeInfo.resolved == RESOLVED_NONE);

        // filter invalid recipients
        require((_who == tradeInfo.buyer) || (_who == tradeInfo.seller));

        // requires both NO for arbitration
        require(tradeInfo.buyerNo && tradeInfo.sellerNo);

        // filter invalid reward
        require(_arbRewardPromille <= rewardPromille);

        // WARNING: use safemath or take care of the change
        uint arbReward = (tradeInfo.funds * _arbRewardPromille) / 1000;

        uint _payment = tradeInfo.funds - arbReward;

        // filter wrong payments
        require(_payment <= tradeInfo.funds);
        require(arbReward <= (tradeInfo.funds - _payment));
        require(_payment <= address(this).balance);

        if (_who == tradeInfo.buyer) {

            tradeInfo.resolved = RESOLVED_BUYER;

            // reset locked funds
            tradeInfo.funds = 0;

            // send funds to recipient
            safeSend(tradeInfo.buyer, _payment);

            // remove record from trades
            if (activeTrades > 0)
                activeTrades -= 1; // WARNING: use safemath

            // update fee funds and add the arbiter reward
            feeFunds += arbReward;

            eventHelper(_version, RESOLVED, arbiter, _who, _tradeId, _dataInfo, _payment);
            return;
        }
 
        tradeInfo.resolved = RESOLVED_SELLER;
        
        // cut down funds to pay the deposit minus arbiter reward
        tradeInfo.funds = _payment;

        // update fee funds and add the arbiter reward
        feeFunds += arbReward;

        eventHelper(_version, DECIDED, arbiter, _who, _tradeId, _dataInfo, _payment);
    }

    // @notice allow arbiter to get his collected fees
    function getFees() public onlyArbiter {

        // check for overpayment
        require(feeFunds <= address(this).balance);

        // reset variable before sending
        uint feeToSend = feeFunds;
        feeFunds = 0;
        safeSend(arbiter, feeToSend);
    }

    // @notice: allow buyer or seller to take timeouted funds.
    // buyer can get funds if seller is silent and seller can get funds if buyer is silent (after freezePeriod)
    // buyer can get back funds under arbitration if arbiter is silent (after arbitrationPeriod)
    // @param _version dataInfo message version
    // @param _tradeId trade reference id
    // @param _dataInfo arbitrary data message
    function getMoney (uint _version, uint _tradeId, string _dataInfo) public {

        EscrowInfo storage tradeInfo = trades[_tradeId];

        //check for tradeId existence
        require(tradeInfo.funds != 0);
        
        uint payment = tradeInfo.funds;

        // decide on the fee based on the funds collected and token price
        uint feeRequired = getDepositTokenFee(tradeInfo.funds);

        MiniMeToken depositToken = MiniMeToken(config.settings(SETTING_DEPOSIT_TOKEN_ADDRESS));
        address depositTokenRecipient = address(config.settings(SETTING_DEPOSIT_TOKEN_RECIPIENT));

        // if the trade is resolved, seller can pay the fee and take his funds
        if(tradeInfo.resolved == RESOLVED_SELLER) {

            // token transfer should be approved by the seller
            if(!depositToken.transferFrom(tradeInfo.seller, depositTokenRecipient, feeRequired)) {
                revert();
            }

            // reset locked funds
            tradeInfo.funds = 0;

            safeSend(tradeInfo.seller, payment);

            // remove record from trades
            if (activeTrades > 0)
                activeTrades -= 1; // WARNING: use safemath

            eventHelper(_version, RESOLVED, tradeInfo.seller, tradeInfo.seller, _tradeId, _dataInfo, payment);
            return;
        }

        //check for duplicate resolve
        require(tradeInfo.resolved == RESOLVED_NONE);

        // cannot take funds, frozen time not passed yet
        require(now >= (tradeInfo.frozenTime + freezePeriod));

        // check for overpayment
        require(payment <= address(this).balance);

        // buyer voted no - check for seller's decision
        if (tradeInfo.buyerNo) {

            // both has voted - money is under arbitration
            if(tradeInfo.sellerNo) {

                // arbitration timeout is not over yet
                require(now >= (tradeInfo.frozenTime + freezePeriod + config.settings(SETTING_ARBITRATION_PERIOD)));
            }

            // reset locked funds
            tradeInfo.funds = 0;

            // arbiter was silent so redeem the funds to the buyer
            safeSend(tradeInfo.buyer, payment);

            // remove record from trades
            if (activeTrades > 0)
                activeTrades -= 1; // WARNING: use safemath

            eventHelper(_version, TIMEDOUT, tradeInfo.buyer, tradeInfo.buyer, _tradeId, _dataInfo, payment);
            return;
        }

        // if seller voted no send funds to sellers
        if (tradeInfo.sellerNo) {

            // token transfer should be approved by the seller
            // decide on the fee based on the funds collected and token price
            if(!depositToken.transferFrom(tradeInfo.seller, depositTokenRecipient, feeRequired)) {
                revert();
            }

            // reset locked funds
            tradeInfo.funds = 0;

            safeSend(tradeInfo.seller, payment);

            // remove record from trades
            if (activeTrades > 0)
                activeTrades -= 1; // WARNING: use safemath

            eventHelper(_version, TIMEDOUT, tradeInfo.seller, tradeInfo.seller, _tradeId, _dataInfo, payment);
            return;
        }
    }

    // @notice helper to emit events with counter
    // @param _tradeId trade reference id
    // @param _dataInfo arbitrary data message
    // @param _version dataInfo message version
    // @param _eventType type of events (see EventTypes above)
    // @param _sender address related to the event
    // @param _payment funds related to the event (it can be 0
    // for non funds-related event)
    // @param _currency what currency we are using
    function eventHelper (
        uint _version,
        uint8 _eventType,
        address _sender,
        address _recipient,
        uint _tradeId,
        string _dataInfo,
        uint _payment
    ) internal {
        contentCount++;
        emit LogEvent(_version, _eventType, _sender, _recipient, _tradeId, _dataInfo, _payment);
    }

    // @notice send an amount to an address and check the result (internally only)
    // @param _addr address to send the amount
    // @param _value amount to send to the address
    function safeSend(address _addr, uint _value) internal {

        require(_value <= address(this).balance);
        require(!atomicLock);

        atomicLock = true;
        if (!(_addr.call.gas(SAFE_GAS).value(_value)())) {
            atomicLock = false;
            revert();
        }

        atomicLock = false;
    }

    // @notice find a token fee for _value deposit (internally only)
    // @param _value amount to check
    function getDepositTokenFee(uint _value) constant internal returns (uint) {

        uint feeWei = 0;
        uint depositTokenFee = config.settings(SETTING_DEPOSIT_TOKEN_FEE_MILLIONTH);

        // calculate fee with overflow protection
        // HACK: 1000000 here is cause we use millionth fraction for storing deposit token fee.
        if(_value > 1 ether) {
            feeWei = (_value / 1000000) * depositTokenFee;
        } else {
            feeWei = (_value * depositTokenFee) / 1000000;
        }

        // now fee contains the fee in wei. We want to convert it to tokens.

        FeedBbt depositTokenPriceFeed = FeedBbt(config.settings(SETTING_DEPOSIT_TOKEN_PRICE_FEED_ADDRESS));

        uint tokenPrice = depositTokenPriceFeed.fee();
        uint depositFee = feeWei / tokenPrice;
        
        // set a minimum possible amount
        if(depositFee == 0)
            depositFee = 1;

        return depositFee;
    }
}