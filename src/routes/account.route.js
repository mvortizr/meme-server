const ms = require('ms');
const express = require ('express')
const account = require("../app/controllers/account.controller");
const token = require("../app/controllers/token.controller");
const setConnectionTimeout = require("../middleware/setConnectionTimeOut")


module.exports = (app) => {
    const pinned =require('../app/controllers/pinned.controller')
    const account = require('../app/controllers/account.controller')
    const auth = require('./auth')
    const router = express.Router();
    const address = require('../app/controllers/address.controller')
    const token = require('../app/controllers/token.controller')

    //handle account creation
    router.post('/create', account.create) // create a sub path rather than use root path

    router.use(auth)

    //handling wallet addresses
    router.post('/add-address', address.add) // create a sub path rather than use root path
    router.get('/addresses', address.getAll)
    //TODO: how to remove addresses

    //handling view your own profile
    router.post('/profile/', account.getProfile)
    router.post('/token/getPinned',token.getPinnedNFTsOfAccount )

    //handling tokens
    router.post('/token/allTokensInAccount',setConnectionTimeout(ms('10h')),token.getNFTsOfAccount)


    //watch individual token when logged in
    router.post('/token/view/:tokenContract/id/:tokenId',token.getNFTInfo)

    //fetch NFTs on sale of an account
    router.post('/token/allTokensInSale',token.getNFTsOnSale)


    //handling pins
    router.post('/pin', pinned.add)
    router.post('/unpin', pinned.remove)

    //validating addresses
    router.post('/address/check', address.checkAddressOfUser)

    //tests
    router.get('/token/allTokensInAccountTest',token.getNFTsWithoutPagination)
    router.get('/token/cursorTest',token.testCursor)


    app.use('/account', router)

    

}