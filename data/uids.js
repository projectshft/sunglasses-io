const uidCreator = require('rand-token').uid;


const uid = 
  {
    username: "yellowleopard753",
    hash: uidCreator(16),
    lastUpdated: new Date()
  }

module.exports = uid;