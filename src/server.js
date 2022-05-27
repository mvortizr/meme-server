const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const colors = require("colors");
const { default: axios } = require("axios");


// run on port 8080 unless specified otherwise
const port = process.env.PORT || 8090;

// start the db
const db = require("./app/models");
db.sequelize.sync();

/**
 * MODULE: Server.js 
 * PURPOSE: runs new Executor as a server that accepts requests to start new instances of NewExecutor
 */

const app = express();

// body parsers
app.use(express.urlencoded({extended: true}));
app.use(express.json());


// // cors options
// var corsOrigins = process.env.ORIGINS.split(',');
//
// var corsOptions = {
//     origin: function(origin, callback) {
//         if (corsOrigins.indexOf(origin) !== -1 || origin === undefined) {
//             callback(null, true);
//         }
//         else {
//             callback(new Error('origin '+ origin +' Not allowed by CORS'));
//         }
//     }
// };

//app.use(cors(corsOptions));
app.use(cors());



// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
    res.send(colors.rainbow("You've come to the right place"));
});


// import and use routes
require('./routes/account.route')(app) 
require('./routes/public.route')(app)
require('./routes/trading.route')(app)


// initialize websocket?
//require('./app/websocket');
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}.`);
    });
}

module.exports = app;


