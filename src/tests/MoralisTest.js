const moralisSecret = 'h8ijLmLoV2yns6rS1qL5LxLDYcr8LtKcmvj0bKwZqXifCOZRxhu5ae8DY3bwstyQ'

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const  Moralis = require('moralis/node')
console.log(Moralis.CoreManager.get("VERSION"))


moralisTest = async(req,res) => {
    
    try {
    await Moralis.start({ moralisSecret});
    console.log('Moralis initialized')

    
    let nftsResults = []
    let options = {}
    let nfts = null

    console.log('Doing first request')
    options = {chain:'eth', address:'0x12D5fBf4dC71d96D6F9Bd4C2E80e958a31df8622'}
    nfts = await Moralis.Web3API.account.getNFTs(options);
    console.log('Success')
    console.log(nfts)
    nftsResults.push(...nfts.result)

    console.log('Waiting')
    await timeout(1000);

    console.log('Doing second request')
    options =  {chain:'eth', address:'0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455'}
    nfts = await Moralis.Web3API.account.getNFTs(options);
    console.log('Success')
    console.log(nfts)
    nftsResults.push(...nfts.result)
    
    console.log(nftsResults)

    //res.status(200).send({nfts: nftsResults})
    
    } catch (e) {
        console.log(e)
    }
    
}

moralisTest()
