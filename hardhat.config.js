require("@nomiclabs/hardhat-waffle");
require('dotenv').config()
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});



const {INFURA_PROJECT_ID,DEPLOYER_PRIVATE_KEY} = process.env;


// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 module.exports = {
  solidity: "0.8.4",
  networks:{
    localhost:{
      chainId: 31337
    }, //nodo local
    rinkeby: {
      url:`https://rinkeby.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts:[DEPLOYER_PRIVATE_KEY]
    },
    ropsten:{
      url:`https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts:[DEPLOYER_PRIVATE_KEY]
    }
  },
  paths:{
   sources:'./ethereum/contracts',
   tests:'./ethereum/test',
  }

};
