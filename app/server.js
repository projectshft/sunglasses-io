const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const Cart = require('../models/cart')

let brands = []
let products = []
let users = []

const router = Router();
router.use(bodyParser.json());

const accessTokens = [
  {
    username: 'lazywolf342',
    lastUpdate: new Date(),
    token: '4Yz8kIppR1rw7z29'
  }
];

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) =>  {
  router(req, res, finalHandler(req, res));
})

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`server running on port: ${PORT}`)

  // load local data into memory 
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'))
  products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'))
  users = JSON.parse(fs.readFileSync('../initial-data/users.json', 'utf-8'))
});


//GET all brands
router.get('/v1/brands', (req, res) => {
  if(!brands) {
    res.writeHead(404, "No Brands Found")
    return res.end();
  }
  res.writeHead(200, {"Content-Type": "application/json"})
  return res.end(JSON.stringify(brands))
})


//GET all products in brand
router.get('/v1/brands/:brandId/products', (req, res) => {
  const { brandId } = req.params;
  const brand = brands.find(brand => brand.id === brandId)
  if(!brand) {
    res.writeHead(404, "Brand does not exist")
    return res.end();
  }
  const relatedProducts = products.filter(product => product.brandId === brandId)

  if(!relatedProducts) {
    res.writeHead(404, 'No Products Found')
    res.end();
  }

  res.writeHead(200, {"Content-Type": "application/json"})
  return res.end(JSON.stringify(relatedProducts))
})


//GET all Products
router.get('/v1/products', (req, res) => {
  if(!products) {
    res.writeHead(404, "No Brands Found")
    return res.end();
  } 
  res.writeHead(200, {"Content-Type": "application/json"})
  return res.end(JSON.stringify(products))
})


//POST login user
router.post('/v1/login', (req, res) => {
  if(!req.body.username || !req.body.password) {
    res.writeHead(400, "Incorrectly formatted response")
    return res.end()
  }
  let user = users.find((user) => {
    return user.login.username === req.body.username && user.login.password === req.body.password
  })
  if(!user) {
    res.writeHead(400, 'Username or Password incorrect');
    return res.end()
  }
  res.writeHead(200, {"Content-Type": "application/json"})
  
  let currentAccessToken = accessTokens.find(token => {
    return token.username === user.login.username;
  })

  if (currentAccessToken) {
    currentAccessToken.lastUpdate = new Date();
    return res.end(JSON.stringify(currentAccessToken.token))
  } else {
    let newAccessToken = {
      username: user.login.username,
      lastUpdate: new Date(),
      token: uid(16),
    }
    accessTokens.push(newAccessToken);
    return res.end(JSON.stringify(newAccessToken.token))    
  }
})


//Get All Products in Cart 
router.get('/v1/cart', (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);
  if(!currentAccessToken) {
    res.writeHead(401, 'No Access')
    return res.end()
  }
  
  let user = users.find((user) => {
    return user.login.username === currentAccessToken.username;
  })

  res.writeHead(200,  {"Content-Type": "application/json"})
  return res.end(JSON.stringify(user.cart))
})


//Add Product To Cart  - /v1/cart/:productId
router.post('/v1/cart/:productId', (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req);
  if(!currentAccessToken) {
    res.writeHead(401, 'No Access')
    return res.end()
  }

  let user = users.find((user) => {
    return user.login.username === currentAccessToken.username;
  })

  const { productId } = req.params;
  const product = products.find(product => product.id === productId)

  if(!product) {
    res.writeHead(400, 'Product does not exist')
    return res.end();
  }

  res.writeHead(200, {"Content-Type": "application/json"})
  user.cart.push(product);
  return res.end(JSON.stringify(product))
})


//Delete Item from Cart
router.delete('/v1/cart/:productId', (req, res) => {
  let currentAccessToken = getValidTokenFromRequest(req)

  if(!currentAccessToken) {
    res.writeHead(401, 'Access Denied')
    return res.end();
  }

  let user = users.find((user) => {
    return user.login.username === currentAccessToken.username
  })

  const { productId } = req.params;
  const index = user.cart.findIndex((item) => item.id === productId)
  if(index > -1) {
    user.cart.splice(index, 1)
  }

  res.writeHead(200,  {"Content-Type": "application/json"}  )
  return res.end(JSON.stringify(user.cart));
})


//helper function to process the access token
const getValidTokenFromRequest = (req) => {
  const parsedUrl = require('url').parse(req.url, true);

  if(!parsedUrl.query.accessToken) return null
  
  let currentAccessToken = accessTokens.find((accessToken) => {
    return accessToken.token === parsedUrl.query.accessToken
  })
  return currentAccessToken ? currentAccessToken : null;
}

module.exports = server;