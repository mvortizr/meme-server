const token = require('../app/controllers/token.controller')






const test = async () => {
    let nft = {
        token_address: "0x422498e6bbc7e0cf5a72755efbdeac38a47c4885",
        token_id: "2",
        block_number_minted: "10527815",
        owner_of: "0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455",
        block_number: "10527815",
        token_hash: "f9b8f3e1d25b357395db61747f126851",
        amount: "1",
        contract_type: "ERC721",
        name: "TradelayerEthNFT",
        symbol: "TRADE",
        token_uri: "https://www.arweave.net/UruesQXTjjBDSVgLdNsvHOC6ozExY1m8l3m-v0yu9sI",
        metadata: null,
        synced_at: "2022-04-18T21:15:20.417Z"
    }
    let res = await token.parseMetadata(nft)

    console.log('res', res)
}

test()