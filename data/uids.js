const uidCreator = require('rand-token').uid;


// first token should be attached to user with id of 1
const uid = 
  {
    username: "yellowleopard753",
    hash: uidCreator(16),
    lastUpdated: new Date()
  }

module.exports = uid;