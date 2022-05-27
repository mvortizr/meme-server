
const express = require ('express')
const account = require("../app/controllers/account.controller");
const token = require("../app/controllers/token.controller");


module.exports = (app) => {
    const account = require('../app/controllers/account.controller')
    const tradelayer = require('../app/controllers/tradelayer.controller')
    const token = require('../app/controllers/token.controller')

    const router = express.Router();

    //router.post('/profile', account.findAccount) // create a sub path rather than use root path
    //router.post('/doRequest', tradelayer.request)  // trying out JSON-RPC request
    router.post('/moralis-test', token.moralisTest)

    //handle profile visit
    router.post('/profile/:username', account.getProfile)
    router.post('/token/getPinned/:username',token.getPinnedNFTsOfAccount )
    router.post('/token/allTokensInAccount/:username',token.getNFTsOfAccount)

    //watch individual token when not logged in
    router.post('/token/view/:tokenContract/id/:tokenId',token.getNFTInfo)

    //get nft on sale when not logged in
    router.post('/token/allTokensInSale/:username',token.getNFTsOnSale)

    app.use('/public', router)   


}