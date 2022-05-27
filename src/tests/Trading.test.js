const request = require('supertest')
const app = require('../server')
const axios = require('axios').default;
const db = require('../app/models')

require('dotenv').config();


const authInfo = {
    "email":"mary5555@gmail.com",
    "password":"12345678",
    "returnSecureToken":true
}

const logIn = async (data = authInfo) =>{


    let res = await axios.post(`https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${process.env.FIREBASE_KEY}`
        , data)

    let tokenId = res.data.idToken;
    let BearerToken = `Bearer ${tokenId}`
    return BearerToken
}



describe('Testing trading functions', () => {

    beforeAll(async() => {
        await db.trade.truncate()

    })




    // Should create a trade
    it('Should create a trade', async () => {

        let BearerToken = await logIn()

        let payload = {
            "tradeId":1,
            "itemId":1,
            "price": 1000,
            "royalty":10,
            "tokenId":"72",
            "nftContract":"0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9",
            "addressCreated":"0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455"

        }


        const res = await request(app)
            .post(`/trading/trade/new`)
            .send(payload)
            .set('Authorization', BearerToken)


        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({error: false, message:"Trade created successfully"})

        //check if it is saved on test BD
        let trade = await db.trade.findOne({where: { tradeId: payload.tradeId}})

        let tradeId = trade.tradeId
        let tradeStatus = trade.status

        expect(tradeId).toEqual(payload.tradeId)
        expect(tradeStatus).toEqual("Open")

    }, 5000)
    // Shouldn't create two trades with the same tradeId
    it('Shouldn\'t create two trades with the same tradeId', async () => {
        let BearerToken = await logIn()
        //first trade
        let payload = {
            "tradeId":2,
            "itemId":2,
            "price": 1000,
            "royalty":10,
            "tokenId":"71",
            "nftContract":"0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9",
            "addressCreated":"0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455"

        }


        const res = await request(app)
            .post(`/trading/trade/new`)
            .send(payload)
            .set('Authorization', BearerToken)


        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({error: false, message:"Trade created successfully"})

        //second trade

        const res2 = await request(app)
            .post(`/trading/trade/new`)
            .send(payload)
            .set('Authorization', BearerToken)

        expect(res2.statusCode).toEqual(400)
        expect(res2.body).toEqual({error: true, message:"A previous trade with the same NFT is open"})

    }, 5000)

    // Shouldn't create a trade if there's a previous trade with the same NFT open
    it('Shouldn\'t create a trade if there\'s a previous trade with the same NFT open', async () => {
        let BearerToken = await logIn()
        console.log('bearer',BearerToken)
        //first trade
        let payload = {
            "tradeId":3,
            "itemId":3,
            "price": 1000,
            "royalty":10,
            "tokenId":"60",
            "nftContract":"0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9",
            "addressCreated":"0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455"

        }


        const res = await request(app)
            .post(`/trading/trade/new`)
            .send(payload)
            .set('Authorization', BearerToken)


        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({error: false, message:"Trade created successfully"})

        let payload2 = {
            "tradeId":4,
            "itemId":4,
            "price": 1000,
            "royalty":10,
            "tokenId":"60",
            "nftContract":"0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9",
            "addressCreated":"0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455"

        }

        //second trade
        const res2 = await request(app)
            .post(`/trading/trade/new`)
            .send(payload2)
            .set('Authorization', BearerToken)

        expect(res2.statusCode).toEqual(400)
        expect(res2.body).toEqual({error: true, message:"A previous trade with the same NFT is open"})

    }, 5000)
    // Should execute a trade
    it('Should execute a trade', async () => {
        let BearerToken = await logIn()
        console.log('bearer',BearerToken)
        //Creates the trade
        let payload = {
            "tradeId":5,
            "itemId":5,
            "price": 1000,
            "royalty":10,
            "tokenId":"61",
            "nftContract":"0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9",
            "addressCreated":"0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455"

        }


        const res = await request(app)
            .post(`/trading/trade/new`)
            .send(payload)
            .set('Authorization', BearerToken)


        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({error: false, message:"Trade created successfully"})

        // executing the trade
        let authInfo2 = {
            "email":"mary16@hotmail.com",
            "password":"12345678",
            "returnSecureToken":true
        }

        let payload2 = {
            "addressSold": "0x12D5fBf4dC71d96D6F9Bd4C2E80e958a31df8622"
        }

        let myBearerToken = await logIn(authInfo2)

        const res2 = await request(app)
            .post(`/trading/trade/execute/5`)
            .send(payload2)
            .set('Authorization', myBearerToken)

        expect(res2.statusCode).toEqual(200)
        expect(res2.body).toEqual({error: false, message:"Trade was executed successfully"})

    }, 5000)
    // Shouldn't execute a trade that doesn't exist
    it('Shouldn\'t execute a trade that doesn\'t exist', async () => {
        let BearerToken = await logIn()
        console.log('bearer',BearerToken)
        //Creates the trade
        let payload = {
            "addressSold": "0x12D5fBf4dC71d96D6F9Bd4C2E80e958a31df8622"
        }


        const res = await request(app)
            .post(`/trading/trade/execute/5000`)
            .send(payload)
            .set('Authorization', BearerToken)


        expect(res.statusCode).toEqual(400)
        expect(res.body).toEqual({error: true, message:"Trade doesn't exists"})

    }, 5000)
    // Shouldn't execute a trade that is not opened
    it('Shouldn\'t execute a trade that is not open', async () => {
        let BearerToken = await logIn()
        console.log('bearer',BearerToken)

        //Creates the trade
        let payload = {
            "tradeId":6,
            "itemId":6,
            "price": 1000,
            "royalty":10,
            "tokenId":"62",
            "nftContract":"0x0c5f4b37b32993f7923569c1a7605c3a67ca6bc9",
            "addressCreated":"0x3e8e97b0a4215ed4e4a79438e3dcb3a2f15e6455"

        }


        const res = await request(app)
            .post(`/trading/trade/new`)
            .send(payload)
            .set('Authorization', BearerToken)


        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({error: false, message:"Trade created successfully"})

        // executing the trade
        let authInfo2 = {
            "email":"mary16@hotmail.com",
            "password":"12345678",
            "returnSecureToken":true
        }

        let payload2 = {
            "addressSold": "0x12D5fBf4dC71d96D6F9Bd4C2E80e958a31df8622"
        }

        let myBearerToken = await logIn(authInfo2)

        const res2 = await request(app)
            .post(`/trading/trade/execute/6`)
            .send(payload2)
            .set('Authorization', myBearerToken)

        expect(res2.statusCode).toEqual(200)
        expect(res2.body).toEqual({error: false, message:"Trade was executed successfully"})

        //trying to execute again, gives error
        const res3 = await request(app)
            .post(`/trading/trade/execute/6`)
            .send(payload2)
            .set('Authorization', myBearerToken)

        expect(res3.statusCode).toEqual(400)
        expect(res3.body).toEqual({error: true, message:"Trade is not open"})

    }, 5000)
    // Should cancel a trade
    // Shouldn't cancel a trade that is not opened



})
