
const ms = require('ms');
const  setConnectionTimeout = (time) => {
    var delay = typeof time === 'string'
        ? ms(time)
        : Number(time || 5000);

    return function (req, res, next) {
        res.connection.setTimeout(delay);
        next();
    }
}

module.exports = setConnectionTimeout;
