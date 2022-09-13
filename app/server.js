var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
let Brand = require('./models/Brands')
// let User = require('./models/User')
// let Product = require('./models/Product')
let users = require('../initial-data/users.json')
let products = require('../initial-data/products.json')

let accessTokens = []

let myRouter = Router()
myRouter.use(bodyParser.json())
const PORT = 3001;

let server = http.createServer(function (request, response){
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT)

let getUserInfo = (username) => {
  return users.find((user) => user.login.username == username)
  }

let getValidTokenFromRequest = (req) => {
  let parsedUrl = require('url').parse(req.url, true)
  if (parsedUrl.query.accessToken){
    let currentAccessToken = accessTokens.find(at => {
      const parsedToken = parsedUrl.query.accessToken
      return at.token == parsedToken
    }
    )
    if(currentAccessToken){
      return currentAccessToken
    } else {
      console.log(`null 1`)
      return null
    }
  } else {
    console.log(`null 2`)
    return null
  }
}

let getUsernameFromRequest = (token) => {
  return accessTokens.find((user) => user.token == token)
}

const getProducts = () => {
  return products
}

const productsById = (id) => {
  return products.filter((prod) => prod.id == id )
}

const addProductToCart = (product, username) => {

  let user = getUserInfo(username)
  let cart = user.cart
  return cart.push(product)
}

const getUserNameAndToken = (request) => {
let parsedUrl = require('url').parse(request.url, true)
  const reqToken = (parsedUrl.query.accessToken)
  const usernameFromReq = getUsernameFromRequest(reqToken)
  const userInfo = getUserInfo(usernameFromReq.username)
  return userInfo
}

const editCart = () => {

}

myRouter.get('/brands', function(request, response){
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(Brand.getBrands()))
})

myRouter.get('/brands/:id/products', function(request, response){
  const productsByBrandId = Brand.getProductsByBrandId
  (request.params.id)
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(productsByBrandId))
})

myRouter.get('/products', function(request, response){
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(getProducts()))
})

myRouter.get('/search', function(request, response){
  const searchTerms = request.query
  console.log(searchTerms)
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(searchResults(searchTerms)))
})

myRouter.get('/products/:id', function(request, response){
  let prodId = request.params.id
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(productsById(prodId)))
})

myRouter.post('/login', function(request, response){
  if(request.body.username && request.body.password){
    let username = request.body.username
    let password = request.body.password
    let user = users.find((user=> {
      return user.login.username == username && user.login.password == password})
      )
      if(user){
        response.writeHead(200, {'Content-Type':'application/json'})
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, "Invalid username or password")
      return response.end()
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response")
    return response.end()
  }
}
)

myRouter.get('/me', function(request, response){
  const userInfo = getUserNameAndToken(request)
  if(getValidTokenFromRequest(request)){
    response.writeHead(200, {'Content-Type':'application/json'})
    return response.end(JSON.stringify(userInfo))
  } else {
    console.log('get token failed')
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
  }
)

myRouter.get('/me/cart', function(request, response){
  const userInfo = getUserNameAndToken(request)
  if(getValidTokenFromRequest(request)){
    response.writeHead(200, {'Content-Type':'application/json'})
    return response.end(JSON.stringify(userInfo.cart))
  } else {
    console.log('get token failed')
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
})

myRouter.post('/me/cart', function(request, response){
  let parsedUrl = require('url').parse(request.url, true)
  const userInfo = getUserNameAndToken(request)
  let username = getUsernameFromRequest(request)
  let product = (parsedUrl.body.product)
  if(getValidTokenFromRequest(request)){
    response.writeHead(200, {'Content-Type':'application/json'})
    addProductToCart(product, username)
    return response.end(JSON.stringify(userInfo.cart))
  } else {
    console.log('get token failed')
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
})

myRouter.post('/me/cart/:productId', function(request, response){
  const userInfo = getUserNameAndToken(request)
  const productId = request.params.productId
  if(getValidTokenFromRequest(request)){
    response.writeHead(200, {'Content-Type':'application/json'})
    return response.end(JSON.stringify(userInfo.cart))
  } else {
    console.log('get token failed')
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
})




module.exports = server