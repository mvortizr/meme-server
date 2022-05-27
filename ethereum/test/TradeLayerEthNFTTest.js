const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

// library used: https://hardhat.org/tutorial/testing-contracts.html


describe("Tradelayer NFT Contract", () => {

    
    //Global variables
    let maxSupply = 4000;
    let mintPrice = ethers.utils.parseUnits('2','ether');
    let metadata = "abcdefghijklmnopq";
    let tokenRoyalty = 1000; // fee denominator is by default 10000, royalty denominator 1000 = 10% royalty

    

    // building the setup for the tests
    const setupMarketPlace = async() => {
        //deploying NFT Marketplace 
        const NFTMarket = await ethers.getContractFactory("NFTMarketplace");
        const nftMarket = await NFTMarket.deploy();
        await nftMarket.deployed();
        return  nftMarket.address;
    }
    
    
    const setup = async ({ marketPlaceAdress, maxSupply, mintPrice}) => {
        let [owner, nonOwner] = await ethers.getSigners();

        //deploying NFT contract    
        const NFTContract = await ethers.getContractFactory("TradelayerEthNFT");
        const deployed = await NFTContract.deploy(marketPlaceAdress, maxSupply, mintPrice);
    
        return {owner, deployed, nonOwner}
    
    };

    describe("Deployment", () => {

        it("Sets max supply to passed param", async () => {
          const marketPlaceAdress = await setupMarketPlace();
          const { deployed } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
    
          const returnedMaxSupply = await deployed.maxSupply();
          expect(maxSupply).to.equal(returnedMaxSupply);
        });

        it("Sets the proper minting price", async () => {
            const marketPlaceAdress = await setupMarketPlace();
            const { deployed } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
      
            const returnedMintPrice = await deployed.mintPrice();
            expect(mintPrice).to.equal(returnedMintPrice);
        });

        it("Should set the right owner", async function () {
            const marketPlaceAdress = await setupMarketPlace();
            const { owner, deployed } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
            
            expect(await deployed.owner()).to.equal(owner.address);
        });

        it("Check marketplace address is not the adress 0", async () => {     
            const marketPlaceAdress =  ethers.constants.AddressZero;
            const NFTContract = await ethers.getContractFactory("TradelayerEthNFT");
        
            await expect( NFTContract.deploy(marketPlaceAdress, maxSupply, mintPrice)).to.be.revertedWith(
                "Marketplace address is invalid"
            );
      
        });

        it("Check marketplace address is a contract address", async () => {
            const marketPlaceAdress =  "0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455"
            const NFTContract = await ethers.getContractFactory("TradelayerEthNFT");
     
            await expect( NFTContract.deploy(marketPlaceAdress, maxSupply, mintPrice)).to.be.revertedWith(
                "Marketplace address does not belong to a contract"
            );

        });

    });

    describe("Minting", () => {
        
        it("Mint a token and assigns it to owner", async () => {
            const marketPlaceAdress = await setupMarketPlace();
            const { deployed, owner} = await setup({ marketPlaceAdress, maxSupply, mintPrice});

            await deployed.mint(metadata,tokenRoyalty, {value: mintPrice});

            const ownerOfMinted = await deployed.ownerOf(0);
            expect(ownerOfMinted).to.equal(owner.address);

        });

        
        it("Allows minting to non-owners", async () => {
            const marketPlaceAdress = await setupMarketPlace();        
            const { deployed, owner, nonOwner } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
            
            await deployed.connect(nonOwner).mint(metadata,tokenRoyalty, {value: mintPrice});
        });


        it("Reverts minting when user doesn't send enough ethers to cover the mint price", async () => {
            const marketPlaceAdress = await setupMarketPlace();
            let lesserMintPrice = ethers.utils.parseUnits('1','ether');
            
            const { deployed} = await setup({ marketPlaceAdress, maxSupply, mintPrice});
            
            await expect( deployed.mint(metadata,tokenRoyalty, {value: lesserMintPrice})).to.be.revertedWith(
                "You must pay the minting price"
            );
        });

        it("The contract mints two NFTs and sets the proper tokenID and owner", async () => {
            const marketPlaceAdress = await setupMarketPlace();             
            const { deployed, nonOwner, owner } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
           
         
            await deployed.connect(owner).mint(metadata,tokenRoyalty, {value: mintPrice});
            await deployed.connect(nonOwner).mint(metadata,tokenRoyalty, {value: mintPrice});

            const returnedOwnerOfMinted1 = await deployed.ownerOf(0);
            const returnedOwnerOfMinted2 = await deployed.ownerOf(1);

            expect(returnedOwnerOfMinted1).to.equal(owner.address);
            expect(returnedOwnerOfMinted2).to.equal(nonOwner.address);

        });

       
        it("The contract has a minting limit", async () => {
            const marketPlaceAdress = await setupMarketPlace();
            //setting a low max Supply
            maxSupply = 2;
                    
            const { deployed } = await setup({ marketPlaceAdress, maxSupply, mintPrice});

            await Promise.all([
                deployed.mint(metadata,tokenRoyalty, {value: mintPrice}), 
                deployed.mint(metadata,tokenRoyalty, {value: mintPrice})
            ]);
            
            await expect(deployed.mint(metadata,tokenRoyalty, {value: mintPrice})).to.be.revertedWith(
                "No tokens left"
            );

            // restoring high maxSupply
            maxSupply = 4000;
        });


       
        it("The contract sets the proper token URL", async () => {
            const marketPlaceAdress = await setupMarketPlace();        
            const { deployed } = await setup({ marketPlaceAdress, maxSupply, mintPrice});

            await deployed.mint(metadata,tokenRoyalty, {value: mintPrice})

            let returnedMetadata = await deployed.tokenURI(0);


            expect(metadata).to.equal(returnedMetadata);
 
        });

    
        it("The contract sets the proper royalty info", async () => {
            const marketPlaceAdress = await setupMarketPlace();        
            const { deployed, owner } = await setup({ marketPlaceAdress, maxSupply, mintPrice});

            await deployed.mint(metadata,tokenRoyalty, {value: mintPrice})
            const salePrice = 100;

            const [returnedRoyaltyAddress, returnedRoyalty] = await deployed.royaltyInfo(0, salePrice);
            
            expect(returnedRoyaltyAddress).to.equal(owner.address);
            expect(0.10 * salePrice).to.equal(returnedRoyalty);
            
        });
    
    });

    describe("Read info from contract", () => {
       
        it("The contract reads the minting price", async () => {
            const marketPlaceAdress = await setupMarketPlace();        
            const { deployed } = await setup({ marketPlaceAdress, maxSupply, mintPrice});

            let returnedMintPrice = await deployed.getMintPrice();
            expect(returnedMintPrice).to.equal(mintPrice);
 
        });

    });

    describe("Cash out ", () => {
        
        it("Allows the owner to cash out", async () => {
            const marketPlaceAdress = await setupMarketPlace();        
            const { deployed, owner } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
            const provider = waffle.provider;

            await deployed.mint(metadata,tokenRoyalty, {value: mintPrice})

            const amountToRetire = ethers.utils.parseUnits('1','ether');
            const shouldRemainingInContract = mintPrice.sub(amountToRetire);
                    
            await deployed.cashOut(owner.address, amountToRetire);

            //get the balance of contract
            const balanceOfContractInWei = await provider.getBalance(deployed.address);
            const balanceOfContractInEtherString = await ethers.utils.formatEther(balanceOfContractInWei);
            const balanceOfContractInEtherBigNumber = await ethers.utils.parseUnits(balanceOfContractInEtherString, 'ether');
           
            expect(shouldRemainingInContract).to.equal(balanceOfContractInEtherBigNumber);            

        });

        it("Rejects non-owner that try to cash out", async () => {
            const marketPlaceAdress = await setupMarketPlace();        
            const { deployed, owner, nonOwner } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
            
            await deployed.connect(nonOwner).mint(metadata,tokenRoyalty, {value: mintPrice});

            const amountToRetire = ethers.utils.parseUnits('1','ether');
                    
            await expect(deployed.connect(nonOwner).cashOut(owner.address, amountToRetire)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

    });

    describe("Updating the contract", () => {
        
        it("Changes marketplace address by Owner", async () => {
            const marketPlaceAdress = await setupMarketPlace(); 
            const marketPlaceAdress2 = await setupMarketPlace();             
            const { deployed } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
            
            await deployed.setMarketplaceAddress(marketPlaceAdress2);
            returnedMarketPlaceAdress = await deployed.marketplaceAddress();
            expect(returnedMarketPlaceAdress).to.equal(marketPlaceAdress2);

        });

        
        it("Rejects non-owner that tries to change the markeplace address", async () => {
            const marketPlaceAdress = await setupMarketPlace();  
            const marketPlaceAdress2 = await setupMarketPlace();      
            const { deployed, owner, nonOwner } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
                     
            await expect(deployed.connect(nonOwner).setMarketplaceAddress(marketPlaceAdress2)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
        });

        it("Changes minting price by Owner", async () => {
            const marketPlaceAdress = await setupMarketPlace(); 
            const newMintingPrice =  ethers.utils.parseUnits('5','ether');
            const { deployed } = await setup({ marketPlaceAdress, maxSupply, mintPrice});
            
            await deployed.setMintPrice(newMintingPrice);
            returnedMintPrice = await deployed.mintPrice();
            expect(newMintingPrice).to.equal(returnedMintPrice);

        });

        it("Reject non-owner that tries to change minting price", async () => {
            const marketPlaceAdress = await setupMarketPlace(); 
            const newMintingPrice =  ethers.utils.parseUnits('5','ether');
            const { deployed, nonOwner} = await setup({ marketPlaceAdress, maxSupply, mintPrice});
            
            await expect(deployed.connect(nonOwner).setMintPrice(newMintingPrice)).to.be.revertedWith(
                "Ownable: caller is not the owner"
            );
            
        });

    });


});
  