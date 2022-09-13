var http = require('http');
var finalHandler = require('finalhandler');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
let Brand = require('./models/Brands')
let users = require('../initial-data/users.json')
let products = require('../initial-data/products.json')

let accessTokens = [
  {
    username:'yellowleopard753', 
    token: 'VYVR5aif8AbaVpBe',
    }
  ]

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
      return null
    }
  } else {
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

const addProductToCart = (productId, username) => {
  const item = productsById(productId)
  let cartId = uid(16)
  let product = {id:cartId, product: item, quantity: 1}
  let user = getUserInfo(username)
  let cart = user.cart
  return cart.push(product)
}

const deleteProductFromCart = (productId, username) => {
  const user = getUserInfo(username)
  let cart = user.cart
  let newCart = cart.filter(prod => prod.id != productId)
  cart = newCart
  return cart
}

const getUserNameAndToken = (request) => {
let parsedUrl = require('url').parse(request.url, true)
  const reqToken = (parsedUrl.query.accessToken)
  const usernameFromReq = getUsernameFromRequest(reqToken)
  const userInfo = getUserInfo(usernameFromReq.username)
  return userInfo
}

const editCart = (productId, username, editQty) => {
  const user = getUserInfo(username)
  let cart = user.cart
  let updatedCart = cart.map((item) => {
    if(item.id == productId){
      item.quantity = editQty
    }
  })
  return updatedCart
}
// GET /brands
myRouter.get('/brands', function(request, response){
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(Brand.getBrands()))
})

//GET /brands/:id/products
myRouter.get('/brands/:id/products', function(request, response){
  const productsByBrandId = Brand.getProductsByBrandId
  (request.params.id)
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(productsByBrandId))
})

//GET /products
myRouter.get('/products', function(request, response){
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(getProducts()))
})

//GET /products/:id
myRouter.get('/products/:id', function(request, response){
  let prodId = request.params.id
  response.writeHead(200, {'Content-Type':'application/json'})
  return response.end(JSON.stringify(productsById(prodId)))
}) 

//POST /login
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
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
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

//GET /me
myRouter.get('/me', function(request, response){
  if(getValidTokenFromRequest(request)){
  const userInfo = getUserNameAndToken(request)
    response.writeHead(200, {'Content-Type':'application/json'})
    return response.end(JSON.stringify(userInfo))
  } else {
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
  }
)

//GET /me/cart
myRouter.get('/me/cart', function(request, response){
  if(getValidTokenFromRequest(request)){
    const userInfo = getUserNameAndToken(request)
    response.writeHead(200, {'Content-Type':'application/json'})
    return response.end(JSON.stringify(userInfo.cart))
  } else {
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
})

//POST /me/cart
myRouter.post('/me/cart', function(request, response){
  if(getValidTokenFromRequest(request)){
    let parsedUrl = require('url').parse(request.url, true)
    const userInfo = getUserNameAndToken(request)
    let productId = parsedUrl.query.productId
    response.writeHead(200, {'Content-Type':'application/json'})
    addProductToCart(productId, userInfo.login.username)
    return response.end(JSON.stringify(userInfo.cart))
  } else {
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
})

//DELETE /me/cart/:productId
myRouter.delete('/me/cart/:productId', function(request, response){
  if(getValidTokenFromRequest(request)){
    const productId = request.params.productId
    const userInfo = getUserNameAndToken(request)
    const cart = userInfo.cart
    deleteProductFromCart(productId, userInfo.login.username)
    response.writeHead(200, {'Content-Type':'application/json'})
    return response.end(JSON.stringify(cart))
  } else {
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
})

//POST /me/cart/:productId
myRouter.post('/me/cart/:productId', function(request, response){
  if(getValidTokenFromRequest(request)){
    const productId = request.params.productId
    const userInfo = getUserNameAndToken(request)
    const cart = userInfo.cart
    const editQty = request.body.editQty
    if(editQty <= 0){
      deleteProductFromCart(productId, userInfo.login.username)
    } else {
      editCart(productId, userInfo.login.username, editQty)
    } 
    response.writeHead(200, {'Content-Type':'application/json'})
    return response.end(JSON.stringify(cart))
  } else {
    response.writeHead(401, "you need to log in to see this page")
    return response.end()
  }
})

module.exports = server