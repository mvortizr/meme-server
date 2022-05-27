const dB = require('../models')
const firebase = require('../../routes/admin')
const { address } = require('../models')
const Address = dB.address
const { Op } = require('sequelize');

exports.add = async (req, res) => {
    try {
        await Address.create({accountUid: req.uid, addressDir: req.body.addressDir})
        res.status(200).send({error: false, message: 'added successfully'})

    }
    catch(error){
        console.log(error)
        res.status(500).send({error: true, message: 'error adding address'})

    }
}

exports.getAll = async (req, res)  => {
    try {
        const addresses=await Address.findAll({where:{accountUid: req.uid}})
        return res.status(200).send(addresses)
    }
    catch(error){
        console.log(error)
        res.status(500).send({error: true, message: 'error getting addresses'})

    }
}

exports.checkAddressOfUser = async (req, res) => {

    console.log(req.uid)
    console.log(req.body.address)

    try{

        const address =await Address.findOne(
            {
                where: {
                    accountUid: req.uid,
                    addressDir: {
                        [Op.iLike]: req.body.address
                    }
                }
            }
        )


        if(!address) {
            res.status(400).send({error: true, message: 'User doesn\'t have this address'})
        } else {
            res.status(200).send({error: false, message: 'User own this address'})
        }

    } catch (e) {
        console.log(e)
        res.status(500).send({error: true, message: 'error querying address'})
    }
}



