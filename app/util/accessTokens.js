// const { use } = require('chai')
// let users = require('../../initial-data/users.json')


// let accessTokens = []


// let getValidTokenFromRequest = (req) => {

//   let parsedUrl = require('url').parse(req.url, true)
  
//   if (parsedUrl.query.accessToken){
    
//     let currentAccessToken = accessTokens.find(accessToken => {
//       return accessToken.token == parsedUrl.query.accessToken
//     })
//     if(currentAccessToken){
//       // console.log(currentAccessToken)
//       return currentAccessToken
//     } else {
//       return null
//     }
//   } else {
//     return null
//   }
// }

// let getUsernameFromRequest = (token) => {
  
//   let userIdWithToken = accessTokens.find((user)=> {
//     user.token == token
//     return user.username
//   })
//   console.log(`username: ${userIdWithToken}`)
//   return userIdWithToken
  
  
// }

// module.exports = {accessTokens, getValidTokenFromRequest, getUsernameFromRequest}