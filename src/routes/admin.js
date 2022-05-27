
const firebase = require("firebase-admin");

const serviceAccount = require('../memewallet-30e1a-firebase-adminsdk-3iv1n-507602e363.json');
const projectID = 'memewallet-30e1a'


exports.admin = firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    projectId: projectID
});
