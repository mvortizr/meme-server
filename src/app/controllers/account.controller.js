const dB = require('../models')
const firebase = require('../../routes/admin');
const Pinned = dB.pinned
const Account = dB.account
const ProfileInfo = dB.profileInfo

const defaultAvatarURL = "https://res.cloudinary.com/marycloudinary/image/upload/v1647188938/memewallet/new_user.png"
const defaultBannerURL = "https://res.cloudinary.com/marycloudinary/image/upload/v1647188994/memewallet/default_banner.jpg"

const translateFirebaseErrorCodes = (code) => {

    let translation = {
        "unknown": { errorTitle:"An unexpected error happened", errorDescription:"There was an error doing the operation, please try again."},
        "auth/user-not-found": {errorTitle:"The user provided does not exist", errorDescription:"The user provided does not belong to this application. Verify the data and try again"},
        "auth/wrong-password": {errorTitle:"Wrong password", errorDescription:"The password entered does not match the password stored for this user "},
        "auth/email-already-exists":{errorTitle:"Email already exist", errorDescription:"The provided email is alredy in use by an existing user. Each user must have a unique email"},
        "auth/session-cookie-expired":{errorTitle:"Your session is expired", errorDescription:"Please sign in again"},
    }
    

    return translation[code] || translation["unknown"]
}

exports.create = async (req, res) => {
    var firebaseUser;

    try {
        const account = await Account.findOne({where: {username: req.body.username}}) // SELECT * FROM account WHERE username = req.body.username
        if (account) {
            return res.status(200).send({error: true, message: 'Username already exists'}) // ends the http request and sends the response back 
            
        }
            firebaseUser = await firebase.admin.auth().createUser({
            email: req.body.email,
            password: req.body.password,
            photoURL: defaultAvatarURL,
            displayName: req.body.username

        })

        
        await Account.create({uid: firebaseUser.uid, email: req.body.email, username: req.body.username, avatarUrl: defaultAvatarURL})
        await ProfileInfo.create({bannerUrl: defaultBannerURL, profileDescription: null, website: null, accountUid: firebaseUser.uid})
        console.log('WAGMI user created LFG', firebaseUser.uid)
        res.status(200).send({error: false, message: 'WAGMI Acount Created Successfully'})

    }
    
    catch(err) {

        if (!!err.code) { // if error code exists, it is a firebase error
            let {errorTitle} = translateFirebaseErrorCodes(err.code)
            res.status(200).send({error: true, message: errorTitle})
        }
        else {
            res.status(500).send({error: true, message: err.message || 'Ruh Roh, we got RUGGED try again'})
            if (firebaseUser){

            firebase.admin.auth().deleteUser(firebaseUser.uid)
            .catch(err => {
                console.log('Rugged by Google. Firebase threw an error while deleting user.')
            })
            

            }
        }
    

        


    }
}



//check if it's needed
exports.findAccount = async (req,res) => {
    var data = {}
    if (req.uid){
        data.uid = req.uid
    } 
    else {
        data.username=req.body.username
    }

    try {
        const account = await Account.findOne({where: data, include: ['pinned', 'profileInfo']})
        console.log('account find account', account)
        if (!account) {
           return res.status(200).send({error: true , message: "User doesn't exists"})
        }
        res.status(200).send({error: false, account: account})

    }catch(err){
        console.log(err)
        res.status(500).end()
    }

}

exports.getProfile = async(req, res) => {
    var data = {}

    // if I send a username it means I want to check someone else's profile
    // otherwise it's my profile, maybe this could be a middleware later
    if(req.params.username) {
        console.log("I'm looking for profile using the username")
        data.username = req.params.username
    } else {
        console.log("I'm looking for their own profile")
        if(req.uid) {
            data.uid = req.uid
            console.log('I got their uid')
        } else {
            return res.status(400).send({error: true , message: "Wrong request"})
        }
    }

    try {
        
        // Find account info
        const account = await Account.findOne({where: data, include: 'profileInfo'}) //include only profile info

        if (!account) {
            return res.status(400).send({error: true , message: "User doesn't exists"})
        } 

        return res.status(200).send({account: account})

    } catch (err) {
        console.log(err)
        res.status(500).end()
    }

}
