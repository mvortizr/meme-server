const db = require('../models')
const {sequelize} = require("../models");
const {QueryTypes} = require("sequelize");
const Sequelize = require("sequelize");
const TradeModel = db.trade
const Pinned = db.pinned
//const Address = db.address
//const dB = require('../models')


// Trade Status: Open, Executed, Cancelled
exports.createTrade = async(req,res) => {
    try {

        // get info from body
        let tradeId = req.body.tradeId
        let itemId = req.body.itemId
        let price = req.body.price //price in Wei
        let royalty = req.body.royalty
        let status = "Open"
        let tokenId = req.body.tokenId
        let nftContract = req.body.nftContract
        //let addressCreated = req.body.addressCreated

        let addressCreated = null

        // find account Id wth address
        let query = "select * from address WHERE UPPER(\"addressDir\") = UPPER('" + req.body.addressCreated.toString()+"');"
        let addressOnDB = await sequelize.query(query, { type: QueryTypes.SELECT })

        if(addressOnDB.length>0) {
            if(addressOnDB[0].accountUid == req.uid) {
                addressCreated = addressOnDB[0].id
            } else {
                res.status(401).send({error: true, message:"You are unauthorized to make this trade"})
                return
            }
        }

        // see if trade with the same NFT exists and it's open
        let previousTrade = await TradeModel.findOne({where: {
            nftContract: nftContract,
            tokenId: tokenId,
            status: "Open"
        }})

        if(previousTrade != null){
            console.log('previousTrade', previousTrade)
            res.status(400).send({error: true, message:"A previous trade with the same NFT is open"})
            return
        }


        //delete from pinned items if exists
        let pin = await Pinned.findOne({where: {contractAddress: nftContract, tokenId: tokenId, accountUid:req.uid, addressId: addressCreated }})

        //console.log('pin', pin)
        if(pin !== null) {
            await Pinned.destroy({where: {id: pin.id}})
        }


        await TradeModel.create({
            tradeId: tradeId,
            itemId: itemId,
            price: price,
            royalty: royalty,
            status: status,
            tokenId: tokenId,
            nftContract: nftContract,
            addressCreated: addressCreated
        })

        res.status(200).send({error: false, message:"Trade created successfully"})


    } catch (e) {
        console.log(e)
        res.status(500).send({error: true, message: 'An error has occurred'})
    }
}

exports.cancelTrade = async(req,res) => {
    try {
        let tradeId = req.params.tradeId
        let trade = await TradeModel.findOne({where: {tradeId: tradeId}})

        if(trade === null) {
            res.status(400).send({error: true, message:"Trade doesn't exists"})
            return
        }

        if(trade.status !== "Open") {
            res.status(400).send({error: true, message:"Trade is not open"})
            return
        }
        //console.log( trade.toJSON())
        trade.set({
            status: "Cancelled",
            cancelledDate: Sequelize.fn('now')
        })

        await trade.save()

        res.status(200).send({error: false, message:"Trade was cancelled successfully"})

    } catch (e) {
        res.status(500).send({error: true, message: "An error has ocurred"})
    }


}

exports.executeTrade = async(req,res) => {
    try {
        let tradeId = req.params.tradeId
        let trade = await TradeModel.findOne({where: {tradeId: tradeId}})

        if(trade === null) {
            res.status(400).send({error: true, message:"Trade doesn't exists"})
            return
        }

        if(trade.status !== "Open") {
            res.status(400).send({error: true, message:"Trade is not open"})
            return
        }

        let addressSold = null

        // find account Id wth address
        let query = "select * from address WHERE UPPER(\"addressDir\") = UPPER('" + req.body.addressSold.toString()+"');"
        let addressOnDB = await sequelize.query(query, { type: QueryTypes.SELECT })

        if(addressOnDB.length>0) {
            if(addressOnDB[0].accountUid == req.uid) {
                addressSold = addressOnDB[0].id
            } else {
                res.status(401).send({error: true, message:"You are unauthorized to make this trade"})
            }
        }


        trade.set({
            status: "Executed",
            soldDate: Sequelize.fn('now'),
            addressSold: addressSold
        })

        await trade.save()

        res.status(200).send({error: false, message:"Trade was executed successfully"})

    } catch (e) {
        res.status(500).send({error: true, message: "An error has ocurred"})
    }
}