// solhint-disable max-line-length
// @title A contract to store goods infos

/* Deployment:
Owner: seller
Owner private testnet: 0x4460f4c8edbca96f9db17ef95aaf329eddaeac29
Address: dynamic
Address private testnet:
ABI: [{"constant":true,"inputs":[],"name":"seller","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_dataInfo","type":"string"}],"name":"cancel","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"trades","outputs":[{"name":"buyer","type":"address"},{"name":"funds","type":"uint256"},{"name":"count","type":"uint256"},{"name":"fake","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"status","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_dataInfo","type":"string"}],"name":"accept","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_dataInfo","type":"string"},{"name":"_escrowDataInfo","type":"string"},{"name":"_count","type":"uint256"}],"name":"buy","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"availableCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"saleCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_dataInfo","type":"string"},{"name":"_escrowDataInfo","type":"string"}],"name":"reject","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_dataInfo","type":"string"}],"name":"addDescription","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"contentCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"escrow","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"pendingCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_version","type":"uint256"},{"name":"_tradeId","type":"uint256"},{"name":"_buyer","type":"address"},{"name":"_buyerDataInfo","type":"string"},{"name":"_dataInfo","type":"string"},{"name":"_funds","type":"uint256"},{"name":"_count","type":"uint256"}],"name":"fakeBuy","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_escrow","type":"address"},{"name":"_count","type":"uint256"},{"name":"_price","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":false,"stateMutability":"nonpayable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"version","type":"uint256"},{"indexed":false,"name":"eventType","type":"uint8"},{"indexed":true,"name":"sender","type":"address"},{"indexed":true,"name":"tradeId","type":"uint256"},{"indexed":false,"name":"dataInfo","type":"string"},{"indexed":false,"name":"count","type":"uint256"},{"indexed":false,"name":"payment","type":"uint256"}],"name":"LogEvent","type":"event"}]
Optimized: yes
Solidity version: v0.4.24
*/

// solhint-enable max-line-length

pragma solidity 0.4.24;


// Escrow service interface
contract EscrowService {
    function deposit(uint version, uint tradeId, address seller, address buyer, string dataInfo)
        public payable;

    function yes(uint version, uint tradeId, address who, string dataInfo) public;

    function no(uint version, uint tradeId, address who, string dataInfo) public;
}


contract Product {

    struct TradeInfo {
        address buyer;
        uint funds;
        uint count;
        bool fake;
    }

    //enum ProductStatus
    uint8 constant internal STATUS_NONE = 0;
    uint8 constant internal STATUS_AVAILABLE = 1;
    uint8 constant internal STATUS_CANCELED = 2;

    //enum EventTypes
    uint8 constant internal BUY = 1;
    uint8 constant internal ACCEPT = 2;
    uint8 constant internal REJECT = 3;
    uint8 constant internal CANCEL = 4;
    uint8 constant internal FAKE_BUY = 5;
    uint8 constant internal DESCRIPTION = 10;

    // data
    uint constant internal SAFE_GAS = 25000;

    // seller/owner of the goods
    address public seller;

    // event counters
    uint public contentCount = 0;

    // hold total items put for sale
    uint public saleCount;

    // status of the goods: see ProductStatus enum
    uint public status;

    // how many items left for sale
    uint public availableCount;

    // how many items is being processed
    uint public pendingCount;

    // price per item in WEI
    uint public price;

    mapping (uint => TradeInfo) public trades;

    // escrow
    EscrowService public escrow;

    // @dev see eventHelper function
    event LogEvent(uint indexed version, uint8 eventType, address indexed sender, uint indexed tradeId,
        string dataInfo, uint count, uint payment);

    // allow only the seller
    modifier onlySeller {
        require(msg.sender == seller);
        _;
    }

    // @notice constructor, set initial variables
    // @param _escrow unique escrow address of the seller
    // @param _count items (number) available to buy
    // @param _price price of each item (in WEI)
    // @dev the escrow address should be already deployed
    constructor (address _escrow, uint _count, uint _price) public {
        // set the seller as the creator of the contract
        seller = msg.sender;

        //non-escrowed payments are not supported
        require(_escrow != 0);

        escrow = EscrowService(_escrow);

        status = STATUS_AVAILABLE;
        saleCount = _count;
        price = _price;
        availableCount = _count;
    }

    // @notice fallback function, don't allow call to it
    function () public {
        revert();
    }

    // @notice add new description to the goods
    // @param _version dataInfo message version
    // @param _dataInfo arbitrary data message
    function addDescription (uint _version, string _dataInfo) public onlySeller {

        // Emit a Description event type
        eventHelper(_version, DESCRIPTION, msg.sender, 0, _dataInfo, 0, 0);
    }

    // @notice buy a product
    // @param _version dataInfo message version
    // @param _tradeId trade reference ID
    // @param _dataInfo arbitrary data message
    // @param _escrowDataInfo arbitrary data message for escrow contract
    // @param _count how many items to buy
    function buy (
        uint _version,
        uint _tradeId,
        string _dataInfo,
        string _escrowDataInfo,
        uint _count
    ) public payable
    {
        // goods status must be available
        require(status == STATUS_AVAILABLE);

        // total price must be not less than price * items number bought
        require(msg.value >= (price * _count));

        // items bought mustn't exceed the current avilable items
        require(_count <= availableCount);
        require(_count > 0);

        //create default TradeInfo struct or access existing
        TradeInfo storage tradeInfo = trades[_tradeId];

        //lock only once for a given id
        require(tradeInfo.funds == 0);

        // delegate to escrow contract
        // escrow contract now knows the Product contract address, the seller of this Product and
        // the funds depositor (buyer)
        escrow.deposit.value(msg.value)(_version, _tradeId, seller, msg.sender, _escrowDataInfo);

        tradeInfo.buyer = msg.sender;
        tradeInfo.funds = msg.value;
        tradeInfo.count = _count;
        tradeInfo.fake = false;

        pendingCount += _count;
            
        //Buy order to event log
        eventHelper(_version, BUY, msg.sender, _tradeId, _dataInfo, _count, msg.value);
    }

    // @notice imitate buying a product to have BUY event and tradeId added to contract
    // @param _version dataInfo message version
    // @param _tradeId trade reference ID
    // @param _buyer who is the buyer
    // @param _dataInfo arbitrary data message
    // @param _funds the payment from the buyer
    // @param _count how many items to buy
    function fakeBuy (
        uint _version,
        uint _tradeId,
        address _buyer,
        string _buyerDataInfo,
        string _dataInfo,
        uint _funds,
        uint _count
    ) public
    {
        // goods status must be available
        require(status == STATUS_AVAILABLE);

        // items bought mustn't exceed the current avilable items
        require(_count <= availableCount);
        require(_count > 0);

        //create default TradeInfo struct or access existing
        TradeInfo storage tradeInfo = trades[_tradeId];

        //lock only once for a given id
        require(tradeInfo.funds == 0);

        tradeInfo.buyer = _buyer;
        tradeInfo.count = _count;
        tradeInfo.fake = true;
            
        //Buy order to event log
        eventHelper(_version, FAKE_BUY, _buyer, _tradeId, _buyerDataInfo, _count, _funds);

        //instantly accept the fakeBuy
        availableCount -= _count;

        //Accept order to event log
        eventHelper(_version, ACCEPT, msg.sender, _tradeId, _dataInfo, _count, _funds);
    }

    // @notice accept an order
    // @param _tradeId trade reference ID
    // @param _dataInfo arbitrary data message
    // @param _version dataInfo message version
    function accept (uint _version, uint _tradeId, string _dataInfo) public onlySeller {

        TradeInfo storage tradeInfo = trades[_tradeId];

        require(tradeInfo.funds > 0);
        require(tradeInfo.count <= availableCount);
        require(tradeInfo.count <= pendingCount);

        pendingCount -= tradeInfo.count;
        availableCount -= tradeInfo.count;

        //close the trade
        uint _funds = tradeInfo.funds;
        tradeInfo.funds = 0;

        //Accept order to event log
        eventHelper(_version, ACCEPT, msg.sender, _tradeId, _dataInfo, tradeInfo.count, _funds);
    }

    // @notice reject an order
    // @param _version dataInfo message version
    // @param _tradeId trade reference ID
    // @param _dataInfo arbitrary data message
    // @param _escrowDataInfo arbitrary data message for escrow contract
    function reject (uint _version, uint _tradeId, string _dataInfo, string _escrowDataInfo) public onlySeller {

        TradeInfo storage tradeInfo = trades[_tradeId];

        require(tradeInfo.funds > 0);
        require(tradeInfo.count <= pendingCount);

        if(!tradeInfo.fake) {
            escrow.yes(_version, _tradeId, seller, _escrowDataInfo);
        }

        pendingCount -= tradeInfo.count;

        //close the trade
        uint _funds = tradeInfo.funds;
        tradeInfo.funds = 0;

        //Reject order to event log
        eventHelper(_version, REJECT, msg.sender, _tradeId, _dataInfo, tradeInfo.count, _funds);
    }

    // @notice cancel an order
    // WARNING: check if there are some pending trades?
    function cancel (uint _version, string _dataInfo) public onlySeller {

        // set Canceled global status
        status = STATUS_CANCELED;

        // emit Cancel event log
        eventHelper(_version, CANCEL, msg.sender, 0, _dataInfo, availableCount, 0);
    }

    // @notice helper to emit events with counter
    // @param _version dataInfo message version
    // @param _eventType type of events (see EventTypes above)
    // @param _sender address related to the event
    // @param tradeId trade reference id
    // @param _dataInfo arbitrary data message    
    // @param _count number event emitted
    // @param _payment funds related to the event (it can be 0
    // for non funds-related event)
    function eventHelper (
        uint _version,
        uint8 _eventType,
        address _sender,
        uint _tradeId,
        string _dataInfo,
        uint _count,
        uint _payment
    ) internal
    {
        contentCount++;
        emit LogEvent(_version, _eventType, _sender, _tradeId, _dataInfo, _count, _payment);
    }
}