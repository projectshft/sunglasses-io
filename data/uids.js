const uid = require('rand-token').uid;


// first token should be attached to user with id of 1
const uids = [
  uid(16),
  uid(16),
  uid(16)
]

module.exports = uids;