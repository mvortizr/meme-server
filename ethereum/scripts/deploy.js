const hre = require("hardhat");
const fs = require('fs');

async function main() {

  // deploying NFT marketplace
  const NFTMarket = await hre.ethers.getContractFactory("NFTMarketplace");
  const nftMarket = await NFTMarket.deploy();
  await nftMarket.deployed();
  console.log("nftMarket deployed to:", nftMarket.address);


  //deploying TradelayerEthNFT
  let maxSupply = 4000;
  let mintPrice = ethers.utils.parseUnits('100','wei');

  const NFTcontract = await hre.ethers.getContractFactory("TradelayerEthNFT");
  const nftContract = await NFTcontract.deploy(nftMarket.address,maxSupply,mintPrice);
  await nftContract.deployed();
  console.log("nftContract deployed to:", nftContract.address);

  let config = `
  export const nftMarketAddress = "${nftMarket.address}"
  export const nftContractaddress = "${nftContract.address}"
  `

  let data = JSON.stringify(config)
  fs.writeFileSync('config.js', JSON.parse(data))

}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


// // We require the Hardhat Runtime Environment explicitly here. This is optional
// // but useful for running the script in a standalone fashion through `node <script>`.
// //
// // When running the script with `npx hardhat run <script>` you'll find the Hardhat
// // Runtime Environment's members available in the global scope.
// const hre = require("hardhat");

// async function main() {
//   // Hardhat always runs the compile task when running scripts with its command
//   // line interface.
//   //
//   // If this script is run directly using `node` you may want to call compile
//   // manually to make sure everything is compiled
//   // await hre.run('compile');

//   // We get the contract to deploy
//   const Greeter = await hre.ethers.getContractFactory("Greeter");
//   const greeter = await Greeter.deploy("Hello, Hardhat!");

//   await greeter.deployed();

//   console.log("Greeter deployed to:", greeter.address);
// }

// // We recommend this pattern to be able to use async/await everywhere
// // and properly handle errors.
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
