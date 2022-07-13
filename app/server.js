const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const queryHandler = require('../utils/queryHandler');
const arrayEquals = require('../utils/arrayEquals');
const postErrorMessage = require('../utils/postErrorMessage');

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

let products = [];
let brands = [];
let cart = [
  {
    "id": "1",
    "categoryId": "1",
    "name": "Superglasses",
    "description": "The best glasses in the world",
    "price":150,
    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
},
{
    "id": "2",
    "categoryId": "1",
    "name": "Black Sunglasses",
    "description": "The best glasses in the world",
    "price":100,
    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
},
{
    "id": "3",
    "categoryId": "1",
    "name": "Brown Sunglasses",
    "description": "The best glasses in the world",
    "price":50,
    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
}
];

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
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(queryHandler(products, req)))
  } else {
    res.writeHead(404)
    res.end('searched product not found')
  }
})

myRouter.get('/sunglasses/brands/:brand', (req, res) => {
  if (queryHandler(brands, req)) {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(queryHandler(brands, req)))
  } else {
    res.writeHead(404)
    res.end('searched brand not found')
  }
})

//CART
myRouter.post('/cart', (req, res) => {
  const toPost = req.body

  const canonList = [ 'id', 'categoryId', 'name', 'description', 'price', 'imageUrls' ]
  let listToCheck = []

  
  for (let prop in toPost) {
    listToCheck.push(prop)
  }

  if (!arrayEquals(canonList, listToCheck)) {
    res.writeHead(404)
    res.end(postErrorMessage)
  } else {
    cart.push(toPost)
    res.writeHead(201)
    res.end(`${toPost.name} posted to cart.`);
  }
})

myRouter.get('/cart', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.end(JSON.stringify(cart))
})

myRouter.delete('/cart', (req, res) => {
  res.writeHead(405)
  res.end('Cannot delete entire cart. Can only delete individual items')
})

//DELETE /cart/:id 
myRouter.delete('/cart/:id', (req, res) => {
  const reqID = req.params.id
  //if not an item in your cart 404 "The item ID does not match any items in your cart"
  
  let indexForObjectToDelete;

  cart.map((obj, i) => {
    if (obj.id === reqID) {
      indexForObjectToDelete = i;
      cart.splice(indexForObjectToDelete, 1)
    }
  })
 
  if (!indexForObjectToDelete) {
    res.writeHead(404)
    res.end('The item ID does not match any items in your cart');
  } 

  //if is an item in cart, remove from cart
  res.end();
})

//LOGIN – up top

module.exports = server;