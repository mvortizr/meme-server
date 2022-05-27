const express = require ('express')
const account = require("../app/controllers/account.controller");
const token = require("../app/controllers/token.controller");
const auth = require("./auth");
const trading = require("../app/controllers/trading.controller");


module.exports = (app) => {
    const trading =require('../app/controllers/trading.controller')
    const auth = require('./auth')
    const router = express.Router();
    router.use(auth)

    router.post('/trade/new', trading.createTrade)
    router.post('/trade/cancel/:tradeId', trading.cancelTrade)
    router.post('/trade/execute/:tradeId', trading.executeTrade)


    app.use('/trading', router)
}
