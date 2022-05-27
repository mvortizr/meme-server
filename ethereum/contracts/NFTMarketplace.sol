// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";

import "hardhat/console.sol";

//Destructible, Pausable from open zepellin

contract NFTMarketplace is ReentrancyGuard, Ownable {
    using Address for address;
    using Counters for Counters.Counter;

    /////////////////////// VARIABLES ///////////////////////////

    //count amount of items for sale
    Counters.Counter private _itemsForSaleCounter;

    //count amount of items tracked
    Counters.Counter private _itemIds;

    // count trades done
    Counters.Counter private _tradesIds;

    // listing price of item
    uint256 listingPrice = 0.000025 ether;

    // Bytes4 Code for EIP-2981
    bytes4 private constant _INTERFACE_ID_ERC2981 = 0x2a55205a;

    // Bytes4 Code for ERC-721
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    /////////////////////// MAPPINGS ///////////////////////////

    //mappings allow 2^256 entries

    // mapping from tokenURL to marketItem
    mapping(uint256 => MarketItem) public idToMarketItem;

    // mapping of trades
    mapping(uint256 => Trade) public trades;

    //////////////////////// EVENTS ///////////////////////////

    event CashOutTo(address indexed payee, uint256 amount, uint256 balance);

    event MarketItemCreated(
        uint256 itemId,
        address nftContract,
        uint256 tokenId,
        address payable nftOwner,
        address payable nftCreator,
        uint256 price,
        bool forSale
    );

    event TradeCreated(
        uint256 tradeId,
        address poster,
        uint256 item,
        uint256 price,
        uint256 royalty,
        address payable royaltyReceiver,
        bytes32 status // Open, Executed, Cancelled
    );


    //////////////////////// STRUCTS ///////////////////////////

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable nftOwner;
        address payable nftCreator;
        uint256 price;
        bool forSale;
    }

    struct Trade {
        uint256 tradeId;
        address poster;
        uint256 item;
        uint256 price;
        uint256 royalty;
        address payable royaltyReceiver;
        bytes32 status; // Open, Executed, Cancelled
    }

    //////////////////////// METHODS ///////////////////////////

    //// GETTERS AND SETTERS ////

    // Sets current listing price
    function setListingPrice(uint256 newListingPrice) public onlyOwner {
        require(newListingPrice > 0, "Listing Price must be greater than 0");
        listingPrice = newListingPrice;
    }

    // Gets the listing price of the contract
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // Get balance of the contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Get amount of items tracked by contract
    function getAmountOfItemsIndexed() public view returns (uint256) {
        return _itemIds.current();
    }

    // Get amount of items for sale
    function getAmountOfItemsForSale() public view returns (uint256) {
        return _itemsForSaleCounter.current();
    }

    // Get amount of trades
    function getAmountOfTrades() public view returns (uint256) {
        return _tradesIds.current();
    }

    // Get information about item using its tokenURL
    function getMarketItemById(uint256 _tokenId)
        public
        view
        returns (
            uint256 itemId,
            address nftContract,
            uint256 tokenId,
            address nftOwner,
            address nftcreator,
            uint256 price,
            bool forSale
        )
    {
        return (
            idToMarketItem[_tokenId].itemId,
            idToMarketItem[_tokenId].nftContract,
            idToMarketItem[_tokenId].tokenId,
            idToMarketItem[_tokenId].nftOwner,
            idToMarketItem[_tokenId].nftCreator,
            idToMarketItem[_tokenId].price,
            idToMarketItem[_tokenId].forSale
        );
    }

    function getTradeById(uint256 _tradeId)
        public
        view
        returns (
            address poster,
            uint256 item,
            uint256 price,
            uint256 royalty,
            bytes32 status
        )
    {
        return (
            trades[_tradeId].poster,
            trades[_tradeId].item,
            trades[_tradeId].price,
            trades[_tradeId].royalty,
            trades[_tradeId].status
        );
    }

    //// LOGICAL METHODS ////

    // Cash out funds
    function cashOut(address payable _payee, uint256 _amount) public onlyOwner {
        require(_payee != address(0) && _payee != address(this));
        require(_amount > 0 && _amount <= address(this).balance);
        _payee.transfer(_amount);
        emit CashOutTo(_payee, _amount, address(this).balance);
    }

    // Track the new created NFT
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        address creator
    ) public nonReentrant returns (uint256 newitemId) {
        // check if the nftContractAddress provided is valid
        require(
            nftContract != address(0) && nftContract != address(this),
            "NFT contract address is invalid"
        );
        require(
            Address.isContract(nftContract),
            "NFT contract address is invalid"
        );
        require(
            IERC721(nftContract).supportsInterface(_INTERFACE_ID_ERC721),
            "NFT contract address must support the interface ERC721"
        );

        // stores nft contract in a variable
        IERC721 nftExecutableContract = IERC721(nftContract);

        // checks the owner of the token is the one making the request
        require(
            nftExecutableContract.ownerOf(tokenId) == msg.sender,
            "You must own the NFT to list it"
        );

        _itemIds.increment();

        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(creator), // owner
            payable(creator), // creator
            0, // price is 0 because it's not for sale yet
            false
        );


    emit MarketItemCreated(
        idToMarketItem[itemId].itemId,
        idToMarketItem[itemId].nftContract,
        idToMarketItem[itemId].tokenId,
        idToMarketItem[itemId].nftOwner,
        idToMarketItem[itemId].nftCreator,
        idToMarketItem[itemId].price,
        idToMarketItem[itemId].forSale
    );


    return itemId;

    }

    //List the item for sell, you have to send the item to the escrow
    function listMarketItem(
        uint256 tokenId,
        uint256 itemId,
        address nftContractAddress,
        uint256 sellPrice
    ) public payable nonReentrant returns (uint256 tradeId) {
        //check if is paying for the listing price
        require(msg.value >= listingPrice, "You must pay the listing price");

        // check if the nftContractAddress provided is valid
        require(
            nftContractAddress != address(0) &&
                nftContractAddress != address(this),
            "NFT contract address is invalid"
        );
        require(
            Address.isContract(nftContractAddress),
            "NFT contract address is invalid"
        );
        require(
            IERC721(nftContractAddress).supportsInterface(_INTERFACE_ID_ERC721),
            "NFT contract address must support the interface ERC721"
        );

        // stores nft contract in a variable
        IERC721 nftContract = IERC721(nftContractAddress);

        // checks the owner of the token is the one making the request
        require(
            nftContract.ownerOf(tokenId) == msg.sender,
            "You must own the NFT to sell it"
        );

        // transfers NFT to contract
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        // adjust counters
        _tradesIds.increment();
        _itemsForSaleCounter.increment();

        // gets current tradeId
        uint256 _tradeId = _tradesIds.current();

        //initialize royalty information
        uint256 nftRoyalty = 0;
        address royaltyReceiver = address(0);

        // get royalty information from contract
        if (nftContract.supportsInterface(_INTERFACE_ID_ERC2981)) {
            IERC2981 nftContractWithRoyalties = IERC2981(nftContractAddress);
            (royaltyReceiver, nftRoyalty) = nftContractWithRoyalties
                .royaltyInfo(tokenId, sellPrice);
        }

        // calculate final price
        uint256 finalPrice = nftRoyalty + sellPrice;

        // make changes to mappings
        trades[_tradeId] = Trade({
            tradeId: _tradeId,
            poster: msg.sender,
            item: itemId,
            price: sellPrice,
            royalty: nftRoyalty,
            royaltyReceiver: payable(royaltyReceiver),
            status: "Open"
        });

        //change on market index
        MarketItem memory itemInfo = idToMarketItem[itemId];
        itemInfo.forSale = true;
        itemInfo.price = finalPrice;

        idToMarketItem[itemId] = itemInfo;


        emit TradeCreated(
            trades[_tradeId].tradeId,
            trades[_tradeId].poster,
            trades[_tradeId].item,
            trades[_tradeId].price,
            trades[_tradeId].royalty,
            trades[_tradeId].royaltyReceiver,
            trades[_tradeId].status

        );

        return _tradeId;
    }

    // Execute trade, sell the item
    function executeTrade(
        uint256 _trade,
        uint256 _itemId,
        address _nftContractAddress,
        address payable _newOwner
    ) public payable nonReentrant {
        // check the new owner address is valid
        require(
            _newOwner == msg.sender,
            "New owner address must be the same as the sender"
        );

        //check is a valid ERC721 contract
        require(
            _nftContractAddress != address(0) &&
                _nftContractAddress != address(this),
            "NFT contract address is invalid"
        );
        require(
            Address.isContract(_nftContractAddress),
            "NFT contract address is invalid"
        );
        require(
            IERC721(_nftContractAddress).supportsInterface(
                _INTERFACE_ID_ERC721
            ),
            "NFT contract address must support the interface ERC721"
        );

        //get info from trade and marketitem
        Trade memory trade = trades[_trade];
        MarketItem memory marketItem = idToMarketItem[_itemId];
        //uint256 totalPrice = marketItem.price;
        uint256 royaltyPrice = trade.royalty;
        uint256 tokenPrice = trade.price;
        uint256 tokenId = marketItem.tokenId;

        // check the status of trade is open
        require(trade.status == "Open", "Trade is not Open");

        // check the price of the item is the proper value
        require(
            msg.value >= royaltyPrice + tokenPrice,
            "Price submitted must match asking price"
        );

        // getting nftContract
        IERC721 nftContract = IERC721(_nftContractAddress);

        // transfer price to owner
        marketItem.nftOwner.transfer(trade.price);

        if (royaltyPrice > 0) {
            trade.royaltyReceiver.transfer(royaltyPrice);
        }

        // transfer NFT to new owner
        nftContract.transferFrom(address(this), msg.sender, tokenId);

        //change NFT information
        MarketItem memory itemInfo = idToMarketItem[_itemId];
        itemInfo.forSale = false;
        itemInfo.price = 0;
        itemInfo.nftOwner = _newOwner;

        idToMarketItem[_itemId] = itemInfo;

        // change status of trade
        trades[_trade].status = "Executed";

        _itemsForSaleCounter.decrement();
    }

    // cancel Trade
    function cancelTrade(
        uint256 _trade,
        address _nftContractAddress,
        uint256 _itemId
    ) public nonReentrant {
        Trade memory trade = trades[_trade];

        // check that nft contract is valid
        require(
            _nftContractAddress != address(0) &&
                _nftContractAddress != address(this),
            "NFT contract address is invalid"
        );
        require(
            Address.isContract(_nftContractAddress),
            "NFT contract address is invalid"
        );
        require(
            IERC721(_nftContractAddress).supportsInterface(
                _INTERFACE_ID_ERC721
            ),
            "NFT contract address must support the interface ERC721"
        );

        // check that sender is the poster
        require(
            msg.sender == trade.poster,
            "Trade can be cancelled only by poster"
        );

        // check that trade is on proper status
        require(trade.status == "Open", "Trade is not Open");

        IERC721 nftContract = IERC721(_nftContractAddress);
        nftContract.transferFrom(address(this), trade.poster, idToMarketItem[_itemId].tokenId);

        // change status of trade
        trades[_trade].status = "Cancelled";

        //change NFT information
        MarketItem memory itemInfo = idToMarketItem[_itemId];
        itemInfo.forSale = false;
        itemInfo.price = 0;

        idToMarketItem[_itemId] = itemInfo;

        _itemsForSaleCounter.decrement();
    }

    /* Returns all market items */
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint256 itemCount = _itemIds.current();

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 1; i < itemCount; i++) {
            MarketItem storage currentItem = idToMarketItem[i];
            items[i] = currentItem;
        }
        return items;
    }

    /* Returns all trades items */
    function fetchTrades() public view returns (Trade[] memory) {
        uint256 itemCount = _itemIds.current();

        Trade[] memory items = new Trade[](itemCount);
        for (uint256 i = 1; i < itemCount; i++) {
            Trade storage currentItem = trades[i];
            items[i] = currentItem;
        }
        return items;
    }
}
