const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const queryHandler = require('../utils/queryHandler');

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

let products = [];
let brands = [];
let cart = [];

let server = http.createServer( (req, res) => {
  myRouter(req, res, finalHandler(req, res))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile('/Users/joshuacushing/code/Parsity/evals/sunglasses-io/initial-data/products.json', "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });

  fs.readFile('/Users/joshuacushing/code/Parsity/evals/sunglasses-io/initial-data/brands.json', "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded
    Listening on PORT ${PORT}`);
  });
});

//LOGIN

myRouter.get('/sunglasses', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(products))
})

myRouter.delete('/sunglasses', (req, res) => {
  res.writeHead(405)
  res.end('Cannot delete this resource')
})

myRouter.get('/sunglasses/brands', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(brands))
})

myRouter.delete('/sunglasses/brands', (req, res) => {
  res.writeHead(405)
  res.end('Cannot delete this resource')
})

myRouter.get('/sunglasses/:product', (req, res) => {
  if (queryHandler(products, req)) {
    res.writeHead(200)
    res.end(JSON.stringify(queryHandler(products, req)))
  } else {
    res.writeHead(404)
    res.end('searched product not found')
  }
})

myRouter.get('/sunglasses/brands/:brand', (req, res) => {
  if (queryHandler(brands, req)) {
    res.writeHead(200)
    res.end(JSON.stringify(queryHandler(brands, req)))
  } else {
    res.writeHead(404)
    res.end('searched product not found')
  }
})

//CART
//POST /cart
myRouter.post('/cart', (req, res) => {
  //check for proper keys and values
  //i.e. – check to make sure that an object has the proper values
  const toPost = req.body
  cart.push(toPost)
  res.writeHead(201)
  res.end(`${toPost.name} posted to cart.`);
})
//GET /cart
//DELETE /cart (not permitted)
//DELETE /cart/:id 

module.exports = server;