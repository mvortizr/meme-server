// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

// IMPORTANT
// fee denominator is by default 10000
// royalty denominator 1000 = 10% royalty

contract TradelayerEthNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    ERC721Royalty, 
    Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address public marketplaceAddress;
    uint256 public maxSupply;
    uint96 public mintPrice;

    // minting event
    event Mint(uint256 tokenId, address creator);
    event CashOutTo(address indexed payee, uint256 amount, uint256 balance);  

  

    constructor(
        address _marketplaceAddress,
        uint256 _maxSupply,
        uint96 _mintPrice
    ) 
    ERC721("TradelayerEthNFT", "TRADE") {
        
        //verify the marketplace has a valid address
        require(_marketplaceAddress != address(0) && _marketplaceAddress != address(this), "Marketplace address is invalid");
        require(Address.isContract(_marketplaceAddress), "Marketplace address does not belong to a contract");

        marketplaceAddress = _marketplaceAddress;
        maxSupply = _maxSupply;
        _setDefaultRoyalty(msg.sender, 1000);
        mintPrice = _mintPrice;
        
    }

    function setMintPrice (uint96 newMintPrice) public onlyOwner {
        require(newMintPrice > 0, "MintPrice must be greater than 0"); 
        mintPrice = newMintPrice;
    }

    function getMintPrice () public view returns (uint256 _mintPrice) {
        return mintPrice;
    }

    function setDefaultRoyalty (address payable newReceiver, uint96 newRoyalty) public onlyOwner{
         _setDefaultRoyalty(newReceiver, newRoyalty);
    }

    function setMarketplaceAddress (address newMarketplaceAddress) public onlyOwner {
        
        //verify the marketplace has a valid address
        require(newMarketplaceAddress != address(0) && newMarketplaceAddress != address(this), "Marketplace address is invalid");
        require(Address.isContract(newMarketplaceAddress), "Marketplace address does not belong to a contract");

         marketplaceAddress = newMarketplaceAddress;
    }

    // Cash out funds
    function cashOut(address payable _payee, uint256 _amount) public onlyOwner {
      require(_payee != address(0) && _payee != address(this));
      require(_amount > 0 && _amount <= address(this).balance);
      _payee.transfer(_amount);
      emit CashOutTo(_payee, _amount, address(this).balance);
    }
 
    function mint(string memory tokenURIMetadata, uint96 tokenRoyalty)
        public
        payable
        returns (uint256)
    {
        uint256 newItemId = _tokenIds.current();
        require(newItemId < maxSupply, "No tokens left");
        require(tokenRoyalty > 0, "Royalty must be greater than 0");
        require(msg.value >= mintPrice, "You must pay the minting price"); 

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURIMetadata);
        _setTokenRoyalty(newItemId,msg.sender, tokenRoyalty);
        setApprovalForAll(marketplaceAddress, true);
        _tokenIds.increment();
        emit Mint(newItemId, msg.sender); //emit mint event
        return newItemId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        // _exists verify the token exists
        require(
            _exists(tokenId),
            "ERC271 Metadata: URI query for nonexistant token"
        );
        return super.tokenURI(tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage, ERC721Royalty)
    {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


}
