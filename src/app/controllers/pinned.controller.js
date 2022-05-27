const dB = require('../models')
const firebase = require('../../routes/admin')
const {sequelize} = require("../models");
//const {QueryTypes} = require("sequelize/types");
const { QueryTypes } = require('sequelize');

const Pinned = dB.pinned;
const Address = dB.address;

const MAX_AMOUNT_PINNED = 6

exports.add = async (req, res) => {
    try {

        let allpins = await Pinned.findAndCountAll({where: { accountUid: req.uid}})

        if(allpins.count >= MAX_AMOUNT_PINNED) {
            return res.status(200).send({
                error: true,
                message: "You can only have max 6 items pinned"
            })
        }


        //check that the nft hasn't been added before
        let previouslyPinned = await Pinned.findOne({where: {tokenId: req.body.tokenId, contractAddress: req.body.contractAddress}})

        if(previouslyPinned) {
            return res.status(200).send({error: true, message: "Item previously pinned"})
        }



        //check that walletAddress exists and belongs to user
        // let address = await Address.findOne({ where: { addressDir: req.body.walletAddress } })


        let query = "select * from address WHERE UPPER(\"addressDir\") = UPPER('" + req.body.walletAddress +"');"
        let addressOnDB = await sequelize.query(query, { type: QueryTypes.SELECT })
        let address = {}

        if(addressOnDB.length>0) {
            if(addressOnDB[0].accountUid == req.uid) {
                address = addressOnDB[0]
            } else {
                return res.status(200).send({
                    error: true,
                    message: "Address associated with the NFT doesn't belong to user"
                })
            }
        } else {
            return res.status(200).send({error: true, message: "Address doesn't exists"})
        }

        // // if (!address) {
        // //     return res.status(200).send({error: true, message: "Address doesn't exists"})
        // // }
        //
        // if (address.accountUid != req.uid) {
        //     return res.status(200).send({
        //         error: true,
        //         message: "Address associated with the NFT doesn't belong to user"
        //     })
        // }


        //creates the pin
        await Pinned.create({
                accountUid: req.uid,
                contractAddress: req.body.contractAddress,
                tokenId: req.body.tokenId,
                addressId: address.id
        })
        res.status(200).send({error: false, message: 'Added successfully'})

    }
    catch(error){
        console.log(error)
        res.status(500).send({error: true, message: 'Error adding pin, try later'})

    }
}

exports.remove = async (req, res) => {
    try {
        //check if exists
        //TODO check if you have permissions
        let pin = await Pinned.findOne({where: {id: req.body.pinId}})
        if (!pin) {
            return res.status(400).send({error: true, message: "Pin doesn't exists"})
        }

        //destroy the pin
        await Pinned.destroy({where: {id: req.body.pinId}})
        res.status(200).send({error: false, message: 'Pin removed successfully'})

    }
    catch(error){
        console.log(error)
        res.status(500).send({error: true, message: 'Error deleting pin'})

    }

}