const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");


describe("NFT Marketplace Contract", () => {
    
    //Global variables
    let maxSupply = 4000;
    let mintPrice = ethers.utils.parseUnits('2','ether');
    let metadata = "abcdefghijklmnopq";
    let tokenRoyalty = 2000; // fee denominator is by default 10000, royalty denominator 1000 = 20% royalty
    let defaultListingPrice = ethers.utils.parseUnits('0.000025','ether');
    
    //setup
    const setupMarketPlace = async() => {
        let [owner, nonOwner] = await ethers.getSigners();
        //deploying NFT Marketplace 
        const NFTMarket = await ethers.getContractFactory("NFTMarketplace");
        let marketplaceContract = await NFTMarket.deploy();
        
        return { marketplaceContract, owner, nonOwner}
    }

    const setupNFTcontract = async ({ marketPlaceAdress, maxSupply, mintPrice}) => {
        let [owner, nonOwner] = await ethers.getSigners();

        //deploying NFT contract    
        const NFTContract = await ethers.getContractFactory("TradelayerEthNFT");
        let deployed = await NFTContract.deploy(marketPlaceAdress, maxSupply, mintPrice);
        let nftContract = await deployed.deployed();
    
        return {owner, nftContract, nonOwner}
    
    };
  

    describe("Deployment ", () => {
        
        it("Contract can be deployed", async () => {
             await setupMarketPlace();
          
        });

        it("Contract set the right owner", async () => {
            const {marketplaceContract, owner} = await setupMarketPlace();
            expect(await marketplaceContract.owner()).to.equal(owner.address);
         
        });
    });

    describe("Updating values ", () => {
        
        it("Set new listing price by owner", async () => {
            const { marketplaceContract } = await setupMarketPlace();
            const newListingPrice = ethers.utils.parseUnits('1','ether');

            await marketplaceContract.setListingPrice(newListingPrice);
            let returnedListingPrice =  await marketplaceContract.getListingPrice();

            expect(returnedListingPrice).to.equal(newListingPrice);       
         
        });



        it("Reject listing price when it is set to less than 0", async () => {
            const { marketplaceContract } = await setupMarketPlace();
            const newListingPrice = ethers.utils.parseUnits('0','ether');

            await expect(marketplaceContract.setListingPrice(newListingPrice)).to.be.revertedWith(
                "Listing Price must be greater than 0"
            );      
         
        });

        
        it("Rejects non-owner that tries to set the listing price", async () => {
            const { marketplaceContract , nonOwner} = await setupMarketPlace();
            const newListingPrice = ethers.utils.parseUnits('2','ether');

            await expect(marketplaceContract.connect(nonOwner).setListingPrice(newListingPrice)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );      
         
        });
        

        it("Creates a market item", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            

            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});
             
            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  
         
        });

        it("Creates two market items with different owners", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});
            await nftContract.connect(nonOwner).mint(metadata,tokenRoyalty, {value: mintPrice});
           
            
            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, //token ID 0
                owner.address
            );

            await marketplaceContract.connect(nonOwner).createMarketItem(
                nftContract.address, 
                1, // token ID 1
                owner.address
            );   
         
        });

        
        it("Reject creation of market item for invalid NFT contract", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            let marketPlaceAdress = marketplaceContract.address;
         
           
            await expect( marketplaceContract.connect(owner).createMarketItem(
                "0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455", // invalid NFT contract
                0,
                owner.address
            )).to.be.revertedWith(
                "NFT contract address is invalid"
            );
         
        });

       
        it("Reject creation of market item for invalid tokenID", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
           
            await expect( marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token id doesn't exist
                owner.address
            )).to.be.revertedWith(
                "ERC721: owner query for nonexistent token"
            );
         
        });
        // Reject creation fo market item for invalid owner
        it("Reject creation of market item for invalid owner", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});

            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});
           
            await expect( marketplaceContract.connect(nonOwner).createMarketItem(
                nftContract.address, 
                0, 
                owner.address
            )).to.be.revertedWith(
                "You must own the NFT to list it"
            );
         
        });

    });

    describe("Reading values ", () => {
   
        it("Get listing price", async () => {
            const { marketplaceContract } = await setupMarketPlace();

            const returnedListingPrice = await marketplaceContract.getListingPrice()
            expect(returnedListingPrice).to.equal(defaultListingPrice);
          
        });

        // Get balance of the contract
        it("Get balance of the contract", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            const expectedFirstBalance =  ethers.utils.parseUnits('0','ether');
            

            const returnedFirstBalance = await marketplaceContract.getBalance();
            const returnedFirstBalanceInEtherString = await ethers.utils.formatEther(returnedFirstBalance);
            const returnedFirstBalanceInInEtherBigNumber = await ethers.utils.parseUnits(returnedFirstBalanceInEtherString, 'ether');

            expect(expectedFirstBalance).to.equal(returnedFirstBalanceInInEtherBigNumber);

            // list an NFT to get some money on the contract
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // the second balance should have the default listing price

            const returnedSecondBalance = await marketplaceContract.getBalance();
            const returnedSecondBalanceEtherString = await ethers.utils.formatEther(returnedSecondBalance);
            const returnedSecondBalanceInEtherBigNumber = await ethers.utils.parseUnits(returnedSecondBalanceEtherString, 'ether');

            expect(returnedSecondBalanceInEtherBigNumber).to.equal(defaultListingPrice);
          
        });
        
        it("Get amount of items indexed", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            const expectedItemsIndexed = 0
            const returnedItemIndexed = await marketplaceContract.getAmountOfItemsIndexed();
            expect(expectedItemsIndexed).to.equal(await returnedItemIndexed.toNumber());

            // index an item
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            

            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});
             
            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // get item indexed again
            const expectedItemsIndexed2 = 1 
            const returnedItemIndexed2 = await marketplaceContract.getAmountOfItemsIndexed();
            expect(expectedItemsIndexed2).to.equal(await returnedItemIndexed2.toNumber());
        });

        // Get amount of items for sale
        it("Get amount of items for sale", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            const expectedItemsForSale = 0
            const returnedItemsForSale = await marketplaceContract.getAmountOfItemsForSale();
            expect(expectedItemsForSale).to.equal(await returnedItemsForSale.toNumber());

            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // get items for sale again
            const expectedItemsForSale2 = 1
            const returnedItemsForSale2 = await marketplaceContract.getAmountOfItemsForSale();
            expect(expectedItemsForSale2).to.equal(await returnedItemsForSale2.toNumber());
            
        });
        
        // Get amount of trades
        it("Get amount of trades", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            const expectedAmountOfTrades = 0
            const returnedAmountOfTrades = await marketplaceContract.getAmountOfTrades();
            expect(expectedAmountOfTrades).to.equal(await returnedAmountOfTrades.toNumber());

            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // get amount of trades again
            const expectedAmountOfTrades2 = 1
            const returnedAmountOfTrades2 = await marketplaceContract.getAmountOfItemsForSale();
            expect(expectedAmountOfTrades2).to.equal(await returnedAmountOfTrades2.toNumber());
            
        });
        // Get marketItemById
        it("Get market item by ID", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();

            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});
            let tokenID = 0;
            let itemID = 1;
            let expectedForSale = false
            let expectedPrice = 0

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                tokenID, // token ID 0
                owner.address
            );  

            // get the info of market item
            let [
                returnedItemId,
                returnedNftContractAddress,
                returnedTokenID,
                returnedNFTOwner,
                returnedNFTCreator,
                returnedPrice,
                returnedForSale      
            ] = await marketplaceContract.getMarketItemById(itemID)

            expect(itemID).to.equal(returnedItemId);
            expect(nftContract.address).to.equal(returnedNftContractAddress);
            expect(tokenID).to.equal(returnedTokenID);
            expect(owner.address).to.equal(returnedNFTOwner);
            expect(owner.address).to.equal(returnedNFTCreator);
            expect(expectedPrice).to.equal(returnedPrice);
            expect(expectedForSale).to.equal(returnedForSale);
        
        });

        // Get tradeById
        it("Get tradeById by ID", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();

            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});
            let tokenID = 0;
            let itemID = 1;
            let expectedStatus = "Open"
            let price =  ethers.utils.parseUnits('5','ether')

            const [expectedRoyaltyAddress, expectedRoyalty] = await nftContract.royaltyInfo(0,price)

            //index an item
            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                tokenID, // token ID 0
                owner.address
            );  

            //put it on sale
            await marketplaceContract.connect(owner).listMarketItem(
                tokenID, // token ID 
                itemID, // item ID,
                nftContract.address,
                price,
                {value:defaultListingPrice}
            );  

            // get the info of trade
            let [
                returnedPoster,
                returnedItem,
                returnedPrice,
                returnedRoyalty,
                returnedStatus    
            ] = await marketplaceContract.getTradeById(1)


            expect(owner.address).to.equal(returnedPoster);
            expect(itemID).to.equal(returnedItem);
            
            const returnedPriceEtherString = await ethers.utils.formatEther(returnedPrice);
            const returnedPriceInEtherBigNumber = await ethers.utils.parseUnits(returnedPriceEtherString, 'ether');
            expect(price).to.equal(returnedPriceInEtherBigNumber);
            
            const decodedReturnedStatus = await ethers.utils.parseBytes32String(returnedStatus)
            expect(expectedStatus).to.equal(decodedReturnedStatus);
            
            expect(expectedRoyalty).to.equal(returnedRoyalty);
        
        });
    });

    

    describe("List NFTs (Sell) ", () => {
        
        // List market item
        it("List Sale", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  
        });

        
        it("Assigns the token to the contract", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            returnedOwnerOfContract = await nftContract.ownerOf(0);

            expect(returnedOwnerOfContract).to.equal(marketplaceContract.address);
        });
        

        it("Rejects listing of market item with less eth than the listing price", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});

            let tokenID = 0
            let itemID = 1

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                tokenID, // token ID 0
                owner.address
            );  

            await expect(marketplaceContract.connect(owner).listMarketItem(
                tokenID, // token ID 
                itemID, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:ethers.utils.parseUnits('0.00001','ether')}
            )).to.be.revertedWith(
                "You must pay the listing price"
            );
            
        });

        // Rejects listing of market item when nftContract provided is wrong
        it("Rejects listing of market item when nftContract provided is wrong", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
            
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            await nftContract.mint(metadata,tokenRoyalty, {value: mintPrice});

            let tokenID = 0
            let itemID = 1

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                tokenID, // token ID 0
                owner.address
            );  

            await expect(
                marketplaceContract.connect(owner).listMarketItem(
                    tokenID, // token ID 
                    itemID, // item ID,
                    "0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455", //wrong nft contract
                    ethers.utils.parseUnits('5','ether'),
                    {value:defaultListingPrice}
                )
            ).to.be.revertedWith(
                "NFT contract address is invalid"
            );             
        });
        
        
    });

    describe("Cancel Trade (Cancel a Sale) ", () => {
   
        it("Can cancel a sale, return token to owner and sets the cancelled status", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            let expectedStatus = "Cancelled"
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            await marketplaceContract.connect(owner).cancelTrade(
                1, // trade ID 
                nftContract.address,
                1
            );  

            returnedOwner = await nftContract.ownerOf(0)

            expect(returnedOwner).to.be.equal(owner.address)

            // get the info of trade
            let [
                returnedPoster,
                returnedItem,
                returnedPrice,
                returnedRoyalty,
                returnedStatus    
            ] = await marketplaceContract.getTradeById(1)

            const decodedReturnedStatus = await ethers.utils.parseBytes32String(returnedStatus)
            expect(expectedStatus).to.equal(decodedReturnedStatus);


        });
      
        // Check nft contract is a valid address
        it("Cancel sale checks that nft contract is a valid address", async () => {
            const { marketplaceContract, owner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            await expect(
                marketplaceContract.connect(owner).cancelTrade(
                    1, // trade ID 
                    "0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455", //wrong address
                    1
                )
            ).to.be.revertedWith(
                "NFT contract address is invalid"
            );
             

        });
        

        it("Checks that the sender of the cancellation is the poster", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            await expect(
                marketplaceContract.connect(nonOwner).cancelTrade(
                    1, // trade ID 
                    nftContract.address, //wrong address
                    1
                )
            ).to.be.revertedWith(
                "Trade can be cancelled only by poster"
            );

        });

        
        it("Rejects when trade is in Cancelled status", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // cancels the trade changing it's status
            await marketplaceContract.connect(owner).cancelTrade(
                1, // trade ID 
                nftContract.address,
                1
            );  


            await expect(
                marketplaceContract.connect(owner).cancelTrade(
                    1, // trade ID 
                    nftContract.address,
                    1
                )
            ).to.be.revertedWith(
                "Trade is not Open"
            );

        });

        
        it("Rejects when trade is in Executed status", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // the trade is executed, status changes to Executed
            await marketplaceContract.connect(nonOwner).executeTrade(
                1, // trade ID              
                1, // item ID
                nftContract.address,
                nonOwner.address,
                {value: ethers.utils.parseUnits('6','ether')} //price + royalty
            );  


            await expect(
                marketplaceContract.connect(owner).cancelTrade(
                    1, // trade ID 
                    nftContract.address, 
                    1
                )
            ).to.be.revertedWith(
                "Trade is not Open"
            );

        });

        
    });

    describe("Execute Trade (Buy NFTs) ", () => {
        // Execute trade
        it("Executes trade and assigns new owner of NFT", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
            let expectedStatus = "Executed"
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // the trade is executed, status changes to Executed
            await marketplaceContract.connect(nonOwner).executeTrade(
                1, // trade ID              
                1, // item ID
                nftContract.address,
                nonOwner.address,
                {value: ethers.utils.parseUnits('6','ether')} //price + royalty
            );  

            let returnedNewOwner = await nftContract.ownerOf(0)

            // get the info of trade
            let [
                returnedPoster,
                returnedItem,
                returnedPrice,
                returnedRoyalty,
                returnedStatus    
            ] = await marketplaceContract.getTradeById(1)

            const decodedReturnedStatus = await ethers.utils.parseBytes32String(returnedStatus)
            
            expect(expectedStatus).to.equal(decodedReturnedStatus);
            expect(returnedNewOwner).to.be.equal(nonOwner.address)
        });
        // Check new owner is a valid address
        it("Checks the new owner is a valid address", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // the trade is executed, status changes to Executed
            await expect(
                marketplaceContract.connect(nonOwner).executeTrade(
                    1, // trade ID              
                    1, // item ID
                    nftContract.address,
                    "0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455",
                    {value: ethers.utils.parseUnits('6','ether')} //price + royalty
                )
            ).to.be.revertedWith(
                "New owner address must be the same as the sender"
            );
             
        });
        // Check nft contract is a valid address
        it("Checks the nft contract is a valid address", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // the trade is executed, status changes to Executed
            await expect(
                marketplaceContract.connect(nonOwner).executeTrade(
                    1, // trade ID              
                    1, // item ID
                    "0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455",
                    nonOwner.address,
                    {value: ethers.utils.parseUnits('6','ether')} //price + royalty
                )
            ).to.be.revertedWith(
                "NFT contract address is invalid"
            );
             
        });
       
        it("Rejects when trade is in Executed status", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // the trade is executed, status changes to Executed
            marketplaceContract.connect(nonOwner).executeTrade(
                1, // trade ID              
                1, // item ID
                nftContract.address,
                nonOwner.address,
                {value: ethers.utils.parseUnits('6','ether')} //price + royalty
            )

            
            await expect(
                marketplaceContract.connect(nonOwner).executeTrade(
                    1, // trade ID              
                    1, // item ID
                    nftContract.address,
                    nonOwner.address,
                    {value: ethers.utils.parseUnits('6','ether')} //price + royalty
                )
            ).to.be.revertedWith(
                "Trade is not Open"
            );
             
        });
        // Reject when trade is in Cancelled status
        it("Rejects when trade is in Cancelled status", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            
           // cancels the trade changing it's status
            await marketplaceContract.connect(owner).cancelTrade(
                1, // trade ID 
                nftContract.address,
                1
            );  

            
            await expect(
                marketplaceContract.connect(nonOwner).executeTrade(
                    1, // trade ID              
                    1, // item ID
                    nftContract.address,
                    nonOwner.address,
                    {value: ethers.utils.parseUnits('6','ether')} //price + royalty
                )
            ).to.be.revertedWith(
                "Trade is not Open"
            );
             
        });

       
        it("Rejects when price submitted is less than asking price", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();
        
            // list an item for sale
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            // the trade is executed, status changes to Executed
            await expect(
                marketplaceContract.connect(nonOwner).executeTrade(
                    1, // trade ID              
                    1, // item ID
                    nftContract.address,
                    nonOwner.address,
                    {value: ethers.utils.parseUnits('3','ether')} //price + royalty
                )
            ).to.be.revertedWith(
                "Price submitted must match asking price"
            );
             
        });

    });

    describe("Cash Out ", () => {
        // Allows the owner to cash out
        it("Allows the owner to cash out", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();   
           
            // list an NFT to add some money to the contract
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  


            const provider = waffle.provider;

            const amountToRetire = ethers.utils.parseUnits('0.000001','ether');
            const shouldRemainingInContract = defaultListingPrice.sub(amountToRetire);
                    
            await marketplaceContract.cashOut(owner.address, amountToRetire);

            //get the balance of contract
            const balanceOfContractInWei = await provider.getBalance(marketplaceContract.address);
            const balanceOfContractInEtherString = await ethers.utils.formatEther(balanceOfContractInWei);
            const balanceOfContractInEtherBigNumber = await ethers.utils.parseUnits(balanceOfContractInEtherString, 'ether');
           
            expect(shouldRemainingInContract).to.equal(balanceOfContractInEtherBigNumber);            

        });
        
        // Rejects non-owner that tries to cash out
        it("Allows the owner to cash out", async () => {
            const { marketplaceContract, owner, nonOwner } = await setupMarketPlace();   
           
            // list an NFT to add some money to the contract
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});
            
            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address, 
                0, // token ID 0
                owner.address
            );  

            // list sale
            await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID 
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );  

            const amountToRetire = ethers.utils.parseUnits('0.000001','ether');
                    
            await expect(
                 marketplaceContract.connect(nonOwner).cashOut(nonOwner.address, amountToRetire)
            ).to.be.revertedWith(
            "Ownable: caller is not the owner"
            );          

        });
    });

    describe("Events", () => {

        it("Creates a event when listing an item", async () => {

            // list an item for sale
            const { marketplaceContract, owner } = await setupMarketPlace();
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});

            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            let createMarketItemTransaction = await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address,
                0, // token ID 0
                owner.address
            );

            let createMarketTx = await createMarketItemTransaction.wait()
            let eventCreateMarketTx = createMarketTx.events.find(event => event.event === 'MarketItemCreated');
            let itemIdInBigNumber = eventCreateMarketTx.args[0]
            let itemIdInNumber = itemIdInBigNumber.toNumber()
            let expectedItemId = 1

            expect(itemIdInNumber).to.equal(expectedItemId)


        });


        it("Creates a event when selling", async () => {

            // list an item for sale
            const { marketplaceContract, owner } = await setupMarketPlace();
            let marketPlaceAdress = marketplaceContract.address;
            const { nftContract } = await setupNFTcontract({ marketPlaceAdress, maxSupply, mintPrice});

            // mint NFT
            await nftContract.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});

            await marketplaceContract.connect(owner).createMarketItem(
                nftContract.address,
                0, // token ID 0
                owner.address
            );


            // list sale
            let listSaleTransaction = await marketplaceContract.connect(owner).listMarketItem(
                0, // token ID
                1, // item ID,
                nftContract.address,
                ethers.utils.parseUnits('5','ether'),
                {value:defaultListingPrice}
            );

            let listSaleTx = await listSaleTransaction.wait()
            let eventlistTx =listSaleTx.events.find(event => event.event === 'TradeCreated');
            console.log('eventlistTx', eventlistTx)
            let tradeIdInBigNumber = eventlistTx.args[0]
            let tradeIdInNumber = tradeIdInBigNumber.toNumber()
            let expectedTradeId = 1

            expect(tradeIdInNumber).to.equal(expectedTradeId)



        });

    });

});