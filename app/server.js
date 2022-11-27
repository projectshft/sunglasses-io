var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

let brands = []
let products = []
let users = []


const router = Router();
router.use(bodyParser.json());

// const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication", "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE"};

const VALID_API_KEYS = ["88312679-04c9-4351-85ce-3ed75293b449","1a5c45d3-8ce7-44da-9e78-02fb3c1a71b7"];

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) =>  {
  // if(req.method === 'OPTIONS') {
  //   res.writeHead(200, CORS_HEADERS)
  //   return res.end()
  // }

  // if(!VALID_API_KEYS.includes(req.headers['x-authentication'])) {
  //   res.writeHead(401, "You need a valid API key", CORS_HEADERS)
  //   return res.end()
  // }
  console.log(req.headers)

  router(req, res, finalHandler(req, res));
})

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`server running on port: ${PORT}`)

  brands = JSON.parse(fs.readFileSync('./initial-data/brands.json'))

  products = JSON.parse(fs.readFileSync('./initial-data/products.json'))

  users = JSON.parse(fs.readFileSync('./initial-data/users.json'))

  user = users[0];
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

//GET all Products
router.get('/v1/products', (req, res) => {
  if(!products) {
    res.writeHead(404, "No Brands Found")
    return res.end();
  } 
  res.writeHead(200, {"Content-Type": "application/json"})
  return res.end(JSON.stringify(products))
})

//GET all products in brand
router.get('/v1/brands/:brandId/products', (req, res) => {
  const { brandId } = req.params;
  const brand = brands.find(brand => brand.id === brandId)
  if(!brand) {
    res.writeHead(404, "Brand does not exist")
    return res.end();
  }
  res.writeHead(200, {"Content-Type": "application/json"})
  const relatedProducts = products.filter(product => product.brandId === brandId)
  console.log(brandId)
  return res.end(JSON.stringify(relatedProducts))
})

//Add Product To Cart
router.post('/v1/cart/:productId', (req, res) => {
  const { productId } = req.params;
  const product = products.find(product => product.id === productId)
  res.writeHead(200, {"Content-Type": "application/json"})
  user.cart.push(product);
  return res.end()
})

//Get All Products in Cart
router.get('/v1/cart', (req, res) => {
  res.writeHead(200,  {"Content-Type": "application/json"})
  return res.end(JSON.stringify(user.cart))
})

router.delete('/v1/cart/clear', (req, res) => {
  res.writeHead(200,  {"Content-Type": "application/json"}  )
  user.cart.length(0)
  return res.end();
})

router.post('/v1/login', (req, res) => {
  // res.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}))
  console.log(req.body.username)
  if(!req.body.username || !req.body.password) {
    res.writeHead(400, "Incorrectly formatted response")
    return res.end()
  }
  let user = users.find((user) => {
    return user.login.username === req.body.username && user.login.password === req.body.password
  })
  if(!user) {
    res.writeHead(400, 'Username of Password incorrect or not found');
    return res.end()
  }
  res.writeHead(200)
  return res.end();

})

module.exports = server;