var http = require('http')
var fs = require('fs')
var finalHandler = require('finalhandler')
var queryString = require('querystring')
var Router = require('router')
var bodyParser = require('body-parser')
var uid = require('rand-token').uid

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const PORT = 3001
let brands = []
let products = []
let accessTokens = []
//let accessTokens = [{ token: 'qswWsnJLHJlcIHoY', username: 'lazywolf342' }]
let failedLoginAttempts = {}

// Helpers to get/set our number of failed requests per username
var getNumberOfFailedLoginRequestsForUsername = function(username) {
  let currentNumberOfFailedRequests = failedLoginAttempts[username]
  if (currentNumberOfFailedRequests) {
    return currentNumberOfFailedRequests
  } else {
    return 0
  }
}

var setNumberOfFailedLoginRequestsForUsername = function(username, numFails) {
  failedLoginAttempts[username] = numFails
}

// Helper method to process access token
var getValidTokenFromRequest = function(request) {
  console.log(request.headers.xauth)
  if (request.headers.xauth) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find(accessToken => {
      console.log(accessToken.token)
      return accessToken.token == request.headers.xauth
    })
    console.log(currentAccessToken)
    if (currentAccessToken) {
      return currentAccessToken
    } else {
      return null
    }
  } else {
    return null
  }
}
// var getValidTokenFromRequest = function(request) {
//   var parsedUrl = require('url').parse(request.url, true)
//   if (parsedUrl.query.accessToken) {
//     // Verify the access token to make sure it's valid and not expired
//     let currentAccessToken = accessTokens.find(accessToken => {
//       return accessToken.token == parsedHeader.query.accessToken
//     })
//     if (currentAccessToken) {
//       return currentAccessToken
//     } else {
//       return null
//     }
//   } else {
//     return null
//   }
// }

// Setup router
var myRouter = Router()
myRouter.use(bodyParser.json())

const server = http
  .createServer(function(request, response) {
    myRouter(request, response, finalHandler(request, response))
  })
  .listen(PORT, error => {
    if (error) {
      throw error
    }

    brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf8'))

    products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf8'))

    users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf8'))
  })

//get all brands
myRouter.get('/brands', (request, response) => {
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brands))
  return
})
//get all products by brandID
myRouter.get('/brands/:brandId/products', (request, response) => {
  //filter for the products with the appropriate brand Id
  let brandProducts = products.filter(product => {
    return product.brandId == request.params.brandId
  })
  //if there are no products with the brand Id, a 401 error should be thrown
  if (brandProducts == false) {
    response.writeHead(401, 'No products with that brand Id found.')
    response.end()
    return
  }
  //if there are products with the brandId, send them
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  response.end(JSON.stringify(brandProducts))
  return
})
//get products by productName
myRouter.get('/products', (request, response) => {
  let query = queryString.parse(request.url.substring(10))

  //if the user enters an empty string in the search bar, a 403 error should be thrown
  if (Object.keys(query).length == 0) {
    response.writeHead(
      402,
      'Please enter the name of the product you are searching for.'
    )
    response.end()
    return
  }
  //match productName in query to the productNames in products.json
  let product = products.find(product => {
    return product.productName === query.productName
  })
  //if there is no product with that productName, a 403 error should be thrown
  if (!product) {
    response.writeHead(403, 'The product does not exist')
    response.end()
    return
  }
  response.writeHead(200, Object.assign({ 'Content-Type': 'application/json' }))
  //if there is a product with the queried productName, return the product
  response.end(JSON.stringify(product))
  return
})

// post the user's login information
myRouter.post('/login', (request, response) => {
  //Make sure there is an email and password in the request
  if (request.body.username && request.body.password) {
    console.log(request.body)
    //See if there is a user that has the username and password
    let user = users.find(user => {
      console.log(user)
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password &&
        getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3
      )
    })
    console.log(user)
    if (user) {
      // If we found a user, reset our counter of failed logins
      setNumberOfFailedLoginRequestsForUsername(request.body.username, 0)

      //when successful, return json header
      response.writeHead(
        200,
        Object.assign({
          'Content-Type': 'application/json'
        })
      )
      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find(accessToken => {
        return (
          accessToken.token == parsedUrl.query.accessToken &&
          new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
        )
      })
      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date()
        response.end(JSON.stringify(currentAccessToken.token))
        return
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken)
        console.log(accessTokens)
        response.end(JSON.stringify(newAccessToken.token))
        return
      }
    } else {
      // Update the number of failed login attempts
      let numFailedForUser = getNumberOfFailedLoginRequestsForUsername(
        request.body.username
      )
      setNumberOfFailedLoginRequestsForUsername(
        request.body.username,
        numFailedForUser++
      )

      // When a login fails, tell the client in a generic way that either the username or password was wrong
      response.writeHead(406, 'Invalid username or password')
      response.end()
      return
    }
  } else {
    //if there was no username or password in the request, throw a 405
    response.writeHead(405, 'You must enter your username and password')
    response.end()
    return
  }
})
myRouter.get('/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request)
  console.log(currentAccessToken)
  if (!currentAccessToken) {
    response.writeHead(407, 'You must be logged in to access your cart.')
    response.end()
    return
  } else {
    let user = users.find(user => {
      console.log(user)
      return user.login.username == currentAccessToken.username
    })
    response.writeHead(
      200,
      Object.assign({
        'Content-Type': 'application/json'
      })
    )
    response.end(JSON.stringify(user.cart))
    return
  }
})

//export the server so that tests can be written
module.exports = server
