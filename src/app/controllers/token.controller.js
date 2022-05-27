const Moralis = require('moralis/node');
const dotenv = require("dotenv");
const dB = require('../models')
const { QueryTypes } = require('sequelize');
const {sequelize} = require('../models');
const {address} = require("hardhat/internal/core/config/config-validation");
const axios = require('axios').default;

dotenv.config();
const Account = dB.account
const Address = dB.address
const TradeModel = dB.trade

/* Moralis init code */
const serverUrl = process.env.MORALIS_SERVER_URL;
const appId = process.env.MORALIS_SERVER_URL;
const masterKey = process.env.MORALIS_MASTER_KEY;
const moralisSecret = process.env.MORALIS_SECRET;



function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

//test moralis
exports.moralisTest = async(req,res) => {
    
    try {
    await Moralis.start({ moralisSecret});
    console.log('Moralis initialized')
    console.log(Moralis.CoreManager.get("VERSION"))

    
    let nftsResults = []
    let options = {}
    let nfts = null

    console.log('Doing first request')
    options = {chain:'eth', address:'0x12D5fBf4dC71d96D6F9Bd4C2E80e958a31df8622'}
    nfts = await Moralis.Web3API.account.getNFTs(options);
    console.log('Success')
    console.log('nfts 1', nfts)
    nftsResults.push(...nfts.result)

    console.log('Waiting')
    await timeout(1000);

    console.log('Doing second request')
    options =  {chain:'eth', address:'0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455'}
    nfts = await Moralis.Web3API.account.getNFTs(options);
    console.log('nfts 2', nfts)
    console.log('Success')
    nftsResults.push(...nfts.result)

    console.log('nftsResult', nftsResults)
    
  

    res.status(200).send({nfts: nftsResults})
    
    } catch (e) {
        console.log(e)
    }
    
}

exports.testCursor = async(req, res) => {

    // options = {address: address.addressDir, chain: "rinkeby"};

    await Moralis.start({ moralisSecret});
    let cursor = null
    let resultNum = 1
    let nfts = []
    do {
        const response = await Moralis.Web3API.account.getNFTs({ address: '0x3e8e97B0a4215ed4E4a79438E3Dcb3a2f15e6455', chain: 'rinkeby', cursor: cursor})
        console.log(`Got page ${response.page} of ${Math.ceil(response.total / response.page_size)}, ${response.total} total`)
        for (const result of response.result) {
            console.log(`result ${resultNum}`, result)
            resultNum+=1
            nfts.push(result)
        }
        cursor = response.cursor
    } while (cursor != '' && cursor != null)

    res.status(200).send({nfts: nfts})

}


const getAccountInfo = async(req, res) => {
    let data = {}
    if(req.params.username) {
        console.log("I'm looking for profile using the username")
        data.username = req.params.username
        console.log('username', data.username)
    } else {
        console.log("I'm looking for their own profile")
        if(req.uid) {
            data.uid = req.uid
            console.log('I got their uid')
            console.log('uid', req.uid)
        } else {
            return res.status(400).send({error: true , message: "Wrong request"})
            return
        }
    }

    const account = await Account.findOne({where: data, include: ['pinned']})
    return account
}


const parseMetadata = async (nft) => {
    let nftTokenURI = nft.token_uri
    let metadata = nft.metadata
    const urlRegex =/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g



    if(metadata == null) {

        if (nftTokenURI.match(urlRegex) != null && nftTokenURI.match(urlRegex).length > 0 && nftTokenURI != null) {
            let urlToQuery = nftTokenURI.match(urlRegex)[0]


            try {
                let response = await axios({
                    method: 'get',
                    url: urlToQuery,
                    responseType: 'application/json',
                    timeout:5000
                })

                if(response.data) {
                    return response.data
                } else {
                    return null
                }

            } catch (e) {
                return null
            }

        }

        return null
    }

    else {

        metadata =  JSON.parse(nft.metadata)
        return metadata
    }

}

exports.parseMetadata = parseMetadata

// get pinned NFTs info
exports.getPinnedNFTsOfAccount = async(req, res) => {

    try {
        // get pinned NFTs of this account
        let account = await getAccountInfo(req,res)

        if(!account) {
            return res.status(400).send({error: true , message: "Wrong , account doesn't exists"})
        }

        let pinned = [...account.pinned]
        let pinnedWithWallet = []


        for (let pin of pinned) {
            let walletAddress = await Address.findOne({where: {id: pin.addressId}});
            pinnedWithWallet.push({...pin.dataValues, walletAddress: walletAddress?.addressDir, pinId: pin.dataValues.id})
        }

        if (pinnedWithWallet.length > 0) {
            let pinnedWithTokenInfo = []
            await Moralis.start({serverUrl, appId, masterKey});
            for (let pin of pinnedWithWallet) {
                let options = {address: pin.contractAddress, token_id: pin.tokenId, chain: "rinkeby"};
                let tokenIdMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);
                //TODO get out metadata from Arweave
                pinnedWithTokenInfo.push({...pin, ...tokenIdMetadata})
            }

            pinnedWithWallet = pinnedWithTokenInfo
        }

        // parse metadata 
        //  pinnedWithWallet.map(nft => {
        //     nft.metadata = JSON.parse(nft.metadata)
        // })

        for (let nft of pinnedWithWallet) {
            nft.metadata = await parseMetadata(nft)
        }

        res.status(200).send({pinned: pinnedWithWallet});
    } catch (e) {
        res.status(500).send({error: true, message: e.message || 'An error happened, please try again'})
    }
}



exports.getNFTsWithoutPagination = async(req, res) => {

    try {
    //get account
    let account = await getAccountInfo(req,res)

    if(!account) {
        res.status(400).send({error:true, message:"Account doesn't exists"})
        return
    }

    

    //get id of account
    let {uid: accountUid} = account

    // get all the saved addresses of account
    const addresses = await Address.findAll({where:{accountUid: accountUid}})

    console.log("I got the addresses", addresses)

    //get total count of NFTs
    await Moralis.start({ serverUrl, appId, masterKey });
    // Moralis.settings.setAPIRateLimit({
    //     anonymous:25, authenticated:25, windowMs:1000
    //   })

    console.log("I started moralis server")

    let nftsResults = []

    if (addresses.length > 0) {
        for (let address of addresses) {
            console.log('address', address.addressDir)
            options = {address: address.addressDir, chain: "rinkeby"};
            nfts = await Moralis.Web3API.account.getNFTs(options);
            console.log('I did the request')

            nftsResults.push(...nfts.result)
        }
    } else {
        //send empty address if the user doesn't have addresses saved
        res.status(200).send({nfts: []})
        return
    }

        for (let nft of nftsResults) {
            nft.metadata = await parseMetadata(nft)
            console.log('nft with metadata', nft)
        }

    res.status(200).send({nfts:nftsResults})
    } catch(e) {
        console.log(e)
    }

}


const fetchNFTsWithLimitAndOffset = async (options, pageSize)=> {
    await Moralis.start({ moralisSecret});
    let cursor = null
    let resultNum = 1
    let nfts = []
    let limit =options.limit
    let offset = !options.offset? 0:options.offset


        const response = await Moralis.Web3API.account.getNFTs({ address: options.address, chain:options.chain , limit: offset+limit, cursor: cursor})
        console.log(`Got page ${response.page} of ${Math.ceil(response.total / response.page_size)}, ${response.total} total`)

        console.log('response result', response.result.length)
        console.log('limit', limit, 'offset', offset, 'limit+offset', limit+offset)
        let results = response.result

        if(results.length>0){

            limit = Math.min(results.length - offset,limit)
            console.log('new limit', limit)

            for (let i = offset;i< results.length; i++) {
                let result = results[i]
                //result.metadata = await parseMetadata(result)
                nfts.push(result)
                console.log(`result ${resultNum}`, result)
                resultNum+=1
            }
        }



        //cursor = response.cursor
    // } while (cursor != '' && cursor != null, )

   return nfts
}


// get NFTs of account paginated
exports.getNFTsOfAccount = async(req, res) => {

    try{
        //get info from request
        let pageSize = req.body.pageSize
        let page = req.body.page

        console.log('pageSize', pageSize)
        console.log('page', page)

        //get account
        let account = await getAccountInfo(req,res)

        if(!account) {
            res.status(400).send({error:true, message:"Account doesn't exists"})
            return
        }

        //get id of account
        let {uid: accountUid} = account

        // get all the saved addresses of account
        const addresses = await Address.findAll({where:{accountUid: accountUid}})

        //get total count of NFTs
        await Moralis.start({ serverUrl, appId, masterKey });

        //initializing aux variables
        let nfts = []
        let options = {}
        let totalCount = 0
        let partialTotalCounts = []

        //initializing moralis
        await Moralis.start({ serverUrl, appId, masterKey });

        //build the total count
        if (addresses.length > 0) {
            for (let address of addresses) {
                console.log('address', address.addressDir)
                options = {address: address.addressDir, chain: "rinkeby", offset:1, limit:1};
                nfts = await Moralis.Web3API.account.getNFTs(options);
                console.log('I did the request')

                let currentPartialTotal = 0
                if(nfts) {
                    currentPartialTotal = nfts.total
                    totalCount+=currentPartialTotal
                }
                partialTotalCounts.push(currentPartialTotal)
            }
        } else {
            //send empty address if the user doesn't have addresses saved
            res.status(200).send({tokens: []})
            return
        }

        ///// get all NFTs from all of your addresses paginated
        let totalPages = Math.ceil(totalCount/pageSize)
        let startFetchFrom = ((page-1)* pageSize)
        let offsetOfFirst = 0
        let i = 0
        let cumulativeOffset = 0
        let previousCumulative = 0

        // return if page request was wrong
        if(page > totalPages) {
            res.status(400).send({error: true, message:"Page request was wrong"})
            return
        }

        // get the offset of first element
        while ((i < partialTotalCounts.length) && (cumulativeOffset < startFetchFrom) ) {
            previousCumulative = cumulativeOffset
            cumulativeOffset+= partialTotalCounts[i]
            i+=1
        }
        if(cumulativeOffset >= startFetchFrom) {
            offsetOfFirst = startFetchFrom - previousCumulative
        }

        // start async loop to get NFTs from each address
        let addressToUse = i===0? i: i - 1
        let addressToStart = addressToUse
        let responseNFTs = []
        let fetchedUntilNow = 0
        let firstLoop = true


        while (addressToUse < partialTotalCounts.length && fetchedUntilNow < pageSize) {

            console.log('address to use',  addresses[addressToUse].addressDir)
            options = {
                address: addresses[addressToUse].addressDir,
                chain: "rinkeby",
                limit: pageSize - fetchedUntilNow
            };

            if(firstLoop) {
                firstLoop = false
                options.offset = offsetOfFirst
            }
            console.log('options', options)

            // nfts = await Moralis.Web3API.account.getNFTs(options);
            nfts = await fetchNFTsWithLimitAndOffset(options)
            //fetchedUntilNow += nfts.result.length // no es total, es total de esta ronda
            fetchedUntilNow += nfts.length
            //console.log('result',nfts.result)
           // responseNFTs = [...responseNFTs,...nfts.result]
            responseNFTs = [...responseNFTs,...nfts]
           // console.log('response NFTs', responseNFTs)
            addressToUse+=1
        }

        // parse metadata 
        // responseNFTs.map(nft => {
        //     nft.metadata = parseMetadata(nft)
        // })
        //
        for (let nft of responseNFTs) {
            nft.metadata = await parseMetadata(nft)
        }

        // TODO add price to NFTs if they are on sale

        // TODO add owner info if it exists

        res.status(200).send({
            totalCount: totalCount,
            totalPages: totalPages,
            page: page,
            paginationDetails: {
                    partialTotalCounts: partialTotalCounts,
                    offsetOfFirst: offsetOfFirst,
                    addressToStart: addressToStart,
                    startFetchFrom: startFetchFrom,
                    cumulativeOffset: cumulativeOffset,
                    addressToUse: addressToUse,
            },
            tokens: responseNFTs,
        })
    }
    catch(e)  {
        res.status(500).send({error: true, message:"An error has ocurred", errorObj: e})
    }
}




//get info of a particular NFT
exports.getNFTInfo = async(req,res) => {


    if(!req.params.tokenId || !req.params.tokenContract) {
        res.status(400).send({error: true, message:"Bad request"})
        return
    }

    //initializing moralis
    await Moralis.start({ serverUrl, appId, masterKey });

    //search NFT metadata
    let options = {address: req.params.tokenContract, token_id: req.params.tokenId, chain: "rinkeby"};
    let tokenMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);



    if (!tokenMetadata) {
        res.status(404).send({error: true, message:"NTF not found"})
        return
    }

    //Parse metadata
    tokenMetadata.metadata = await parseMetadata(tokenMetadata)

    // Is the requester the owner?
    tokenMetadata.AmIOwner = false
    let query = "select * from address WHERE UPPER(\"addressDir\") = UPPER('" + tokenMetadata.owner_of.toString()+"');"
    let addressOnDB = await sequelize.query(query, { type: QueryTypes.SELECT })

    if(addressOnDB.length>0) {
        if(addressOnDB[0].accountUid == req.uid) {
            tokenMetadata.AmIOwner = true
        }
    }

    // is it on sale? send price
    //let openTrade = TradeModel.findOne({where:{status: "Open", tokenId: tokenMetadata.token_id, }})
    let openTradeQuery = "SELECT * from trade " +
        " WHERE UPPER(\"nftContract\") = UPPER('" + tokenMetadata.token_address.toString()+"') AND  " +
        " \"tokenId\" = '"+ tokenMetadata.token_id.toString() + "' AND " +
        " status = 'Open';"

    let trade = await sequelize.query(openTradeQuery, {type: QueryTypes.SELECT})

    if(trade.length>0) {
        trade = trade[0]
        tokenMetadata.totalPrice = trade.price + trade.royalty
    } else {
        trade = {}
    }


    res.status(200).send({ nft: {...tokenMetadata, ...trade}})


}


exports.getNFTsOnSale = async (req,res) => {

    try {

        if (!req.body.pageSize || !req.body.page) {
            res.status(401).send({error: true, message: 'Pagination info is required on request'})
            return
        }

        let pageSize = req.body.pageSize
        let page = req.body.page

        let account = await getAccountInfo(req, res)

        if (!account) {
            res.status(400).send({error: true, message: "Account doesn't exists"})
            return
        }

        let countQuery = "SELECT COUNT(*) FROM trade t, address a, account acc WHERE t.status = 'Open' AND " +
            "    t.\"addressCreated\" = a.id AND a.\"accountUid\" = acc.uid AND acc.uid = '" + account.uid + "' ;"

        let amountOpenTrades = await sequelize.query(countQuery, {type: QueryTypes.SELECT})

        if (amountOpenTrades.length > 0) {
            amountOpenTrades = amountOpenTrades[0].count
            console.log('amountOpenTrades', amountOpenTrades)

            if (amountOpenTrades <= 0) {
                res.status(200).send({error: false, nftsOnSale: []})
                return
            }

        } else {
            res.status(200).send({error: false, nftsOnSale: []})
            return
        }

        //calculating pagination info
        let totalPages = Math.ceil(amountOpenTrades / pageSize)
        let offset = (page - 1) * pageSize
        let limit = pageSize

        //initializing moralis
        await Moralis.start({serverUrl, appId, masterKey});

        let query = "SELECT t.\"tradeId\", t.\"itemId\", t.price, t.royalty, t.status, t.\"tokenId\", t.\"nftContract\", " +
            " a.\"addressDir\" as \"walletAddress\", acc.username AS \"ownerUsername\" " +
            "FROM trade t, address a, account acc WHERE t.status = 'Open' AND t.\"addressCreated\" = a.id " +
            "AND a.\"accountUid\" = acc.uid AND acc.uid = '" + account.uid + "' OFFSET " + offset + " LIMIT " + limit + ";"
        let openTrades = await sequelize.query(query, {type: QueryTypes.SELECT})

        let nftsOnSale = []

        for (let openTrade of openTrades) {
            // console.log('openTrade', openTrade)
            openTrade.totalPrice = openTrade.price + openTrade.royalty
            let options = {address: openTrade.nftContract, token_id: openTrade.tokenId, chain: "rinkeby"};
            let tokenMetadata = await Moralis.Web3API.token.getTokenIdMetadata(options);
            tokenMetadata.metadata = await parseMetadata(tokenMetadata)
            openTrade = {...openTrade, ...tokenMetadata}
            nftsOnSale.push(openTrade)
            //console.log('openTrade', openTrade)
        }

        res.status(200).send({error: false, nftsOnSale: nftsOnSale, totalPages: totalPages})

    } catch (e) {
        res.status(500).send({error:true, message:'An error has ocurred'})
    }



}
