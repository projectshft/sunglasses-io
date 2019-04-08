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
  if (request.headers.xauth) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token == request.headers.xauth
    })
    if (currentAccessToken) {
      return currentAccessToken
    } else {
      return null
    }
  } else {
    return null
  }
}

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

// login
myRouter.post('/login', (request, response) => {
  //Make sure there is an email and password in the request
  if (request.body.username && request.body.password) {
    //See if there is a user that has the username and password
    let user = users.find(user => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password &&
        getNumberOfFailedLoginRequestsForUsername(request.body.username) < 3
      )
    })
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
          accessToken.token == request.headers.xauth &&
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
      response.writeHead(406, 'Invalid username or password.')
      response.end()
      return
    }
  } else {
    //if there was no username or password in the request, throw a 405
    response.writeHead(405, 'You must enter your username and password.')
    response.end()
    return
  }
})
//see cart if logged in
myRouter.get('/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request)
  if (!currentAccessToken) {
    response.writeHead(407, 'You must be logged in to access your cart.')
    response.end()
    return
  } else {
    // find the user based on login information
    let user = users.find(user => {
      return user.login.username == currentAccessToken.username
    })
    response.writeHead(
      200,
      Object.assign({
        'Content-Type': 'application/json'
      })
    )
    //show cart if the user is logged in
    response.end(JSON.stringify(user.cart))
    return
  }
})
//add products to cart
myRouter.post('/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request)
  if (!currentAccessToken) {
    response.writeHead(
      408,
      'You must be logged in to add products to your cart.'
    )
    response.end()
    return
  } else {
    // find user if logged in
    let user = users.find(user => {
      return user.login.username == currentAccessToken.username
    })

    //filter for the products with the appropriate product Id
    let productToAdd = products.find(product => {
      return product.productId == request.params.productId
    })

    //see if the product in already in the cart by productId
    let searchForProduct = user.cart.find(item => {
      return item.product.productId == request.params.productId
    })
    //if there are no products with the brand Id, a 409 error should be thrown
    if (!productToAdd) {
      response.writeHead(409, 'No products with that product Id found.')
      response.end()
      return
    } else if (searchForProduct) {
      // if the product is already in the cart, increase the quantity
      searchForProduct.quantity += 1
      response.writeHead(201, 'You have added another product to your cart.')
      response.end()
      return
    } else {
      //if the product is not in the cart, create a new cartItem
      let cartItem = {}
      cartItem.quantity = 1
      cartItem.product = productToAdd
      user.cart.push(cartItem)
      response.writeHead(
        200,
        Object.assign({
          'Content-Type': 'application/json'
        })
      )
      response.end(JSON.stringify(user.cart))
      return
    }
  }
})
//delete products from cart
myRouter.delete('/me/cart/:productId', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request)

  //if the user is not logged in, a 410 error should be thrown
  if (!currentAccessToken) {
    response.writeHead(
      410,
      'You must be logged in to delete products from your cart.'
    )
    response.end()
    return
  } else {
    //find the user if logged in
    let user = users.find(user => {
      return user.login.username == currentAccessToken.username
    })

    //find the product in the cart by productId
    let productToDelete = user.cart.find(item => {
      return item.product.productId == request.params.productId
    })

    //if there are no products with the product Id in the cart, a 411 error should be thrown
    if (!productToDelete) {
      response.writeHead(
        411,
        'No product with that product Id found in your shopping cart.'
      )
      response.end()
      return
    }
    //filter out the product that the user wants to delete
    let newCart = user.cart.filter(item => {
      return item.product.productId !== request.params.productId
    })

    //replace the users cart with the new Cart
    user.cart = newCart

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
//update quantity of products in post
myRouter.post('/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request)

  //parse the url
  var parsedUrl = require('url').parse(request.url, true)

  //if the user is not logged in, a 412 error should be thrown
  if (!currentAccessToken) {
    response.writeHead(
      412,
      'You must be logged in to update the quantity of products in your cart.'
    )
    response.end()
    return
  } else {
    let user = users.find(user => {
      return user.login.username == currentAccessToken.username
    })

    //if the url has a product Id update, then find the product in the cart
    if (parsedUrl.query.productId && parsedUrl.query.quantity) {
      //find the product in the cart by productId
      let productToUpdate = user.cart.find(item => {
        return item.product.productId == parsedUrl.query.productId
      })

      //if there are no products with the product Id in the cart, a 413 error should be thrown
      if (!productToUpdate) {
        response.writeHead(
          413,
          'No product with that product Id found in your shopping cart.'
        )
        response.end()
        return
      }
      //filter out the product
      let newCart = user.cart.filter(item => {
        return item.product.productId !== parsedUrl.query.productId
      })

      let updatedQuantity = parsedUrl.query.quantity

      //update the quantity of the product
      productToUpdate.quantity = updatedQuantity

      //add the new, updated product to the cart
      newCart.cartItem = productToUpdate

      //replace the users cart with the newCart
      user.cart = newCart
      response.writeHead(
        200,
        Object.assign({
          'Content-Type': 'application/json'
        })
      )
      response.end(JSON.stringify(user.cart))
      return
    } else {
      //if the user didn't specify the product Id or quantity in the url, throw a 414 error
      response.writeHead(414, 'Please specify the id of the product to update.')
      response.end()
      return
    }
  }
})
//export the server so that tests can be written
module.exports = server
