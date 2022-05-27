
const crypto = require('crypto');
const pbkdf2 = require('pbkdf2');

const generateSalt = function() {
    return new Buffer.from((crypto.randomBytes(8))).toString('hex')
}

exports.encryptKeys = (key, secret, password) => {

    const salt = generateSalt();

    const pw = pbkdf2.pbkdf2Sync(password, salt, 1, 32, 'sha512');

    const encrypt = (str) => {
        var encryptKey = crypto.createCipheriv('aes-256-cbc', pw, salt);
        var myStr = encryptKey.update(str, 'utf8', 'hex')
        myStr += encryptKey.final('hex');

        return myStr;
    }
    
    const keyPair = {
        salt,
        key: encrypt(key),
        secret: encrypt(secret)
    }

    return keyPair;
}

exports.decryptKeys = function(key, secret, password, salt) {
    
    const pw = pbkdf2.pbkdf2Sync(password, salt, 1, 32, 'sha512');

    const decrypt = (str) => {
        var decryptKey = crypto.createDecipheriv('aes-256-cbc', pw, salt);
        var myStr = decryptKey.update(str, 'hex', 'utf8')
        myStr += decryptKey.final('utf8'); // throws if someone provided an incorrect password

        return myStr;
    }

    const keyPair = {
        salt: salt,
        key: decrypt(key),
        secret: decrypt(secret)
    }

    return keyPair;
}
