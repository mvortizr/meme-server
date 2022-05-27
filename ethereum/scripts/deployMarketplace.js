const hre = require("hardhat");
const fs = require('fs');

async function main() {

    // deploying NFT marketplace
    const NFTMarket = await hre.ethers.getContractFactory("NFTMarketplace");
    const nftMarket = await NFTMarket.deploy();
    await nftMarket.deployed();
    console.log("nftMarket deployed to:", nftMarket.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });