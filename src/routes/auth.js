

/**
 * MODULE: auth
 * PURPOSE: functions that will help protect the server against attacks
 */

const firebase = require('./admin.js');

const crypto = require('crypto');

const db = require("../app/models");
const Account = db.account;

// find the authentication header and parse the JWT
const getAuthToken = (req, res, next) => {
    if (
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        req.authToken = req.headers.authorization.split(' ')[1];
    }
    else if (
        req.body &&
        req.body.headers &&
        req.body.headers.authorization &&
        req.body.headers.authorization.startsWith('Bearer ')
    ) {
        req.authToken = req.body.headers.authorization.split(' ')[1];
    }
    else {
        req.authToken = null;
    }
    next();
};


// grab the auth token and if got, continue
module.exports = (req, res, next) => {
    //console.log(req.headers)
    getAuthToken(req, res, async () => {

        const authToken = req.authToken;

        firebase.admin.auth().verifyIdToken(authToken).then(async function (adminInfo) {

            req.uid = adminInfo.uid;
            getUser(req, res, next);

        }).catch(function (err) {
            console.log(err);
            return res.status(401).send({ message: 'You are not authorized to make this request' });
        })


    });
}

async function getUser(req, res, next) {
    // now find and save the customer info in res.locals
    try {
        const user = await Account.findByPk(req.uid);

        if (!user) {
            throw new Error("User does not exist in database");
        }

        res.locals.user = user.dataValues;

        return next();
    }
    catch (err) {
        console.log(err);
        res.status(403).send({ message: "You are not authorized to make this request" });
        // firebase auth passed
    }
}

