const request = require('request');
//require('dotenv').config();


let params = [
    "QMn7WV94yn4tC56vF3iQrKid733wm2wnHE", 
    2, 
    1, 
    "Quantum Miner", 
    "www.qm.com", 
    "dataexample", 
    "1000000"
]

let options = {
    url: "http://localhost:9332",
    method: "post",
    headers:
    { 
     "content-type": "text/plain"
    },
    // auth: {
    //     user: process.env.TESTNET_USERNAME,
    //     pass: process.env.TESTNET_PASSWORD
    // },
    body: JSON.stringify( {"jsonrpc": "1.0", "id": "curltest", "method": "tl_sendissuancefixed", "params": params })
};

exports.request = (options, (error, response, body) => {
    if (error) {
        console.error('An error has occurred: ', error);
    } else {
        console.log('response:', response)
        console.log('Post successful: body: ', body);
    }
});


