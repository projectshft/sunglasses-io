var https = require('https');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
const defaultProductReturnCount = 10;
var brands = [];
var products = {};
var users = [];
let user = {};

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

https.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
    if (error) {
        console.log(error)
    }
    console.log(`Server is listening to port ${PORT} `)
});

// read brands json file
fs.readFile( __dirname + '/../initial-data/brands.json', 'utf8', function (err, data) {
    if (err) {
      throw err; 
    }
    brands = JSON.parse(data)
  });

  // read products json file
fs.readFile( __dirname + '/../initial-data/products.json', 'utf8', function (err, data) {
    if (err) {
      throw err; 
    }
    products = JSON.parse(data)
  });

  // read users json file
  fs.readFile( __dirname + '/../initial-data/users.json', 'utf8', function (err, data) {
    if (err) {
      throw err; 
    }
    users = JSON.parse(data)
  });

// get all brands
myRouter.get('/api/brands', function(request,response) {
  response.end(JSON.stringify(brands));
});

// return (limit) first 10 products
myRouter.get('/api/products', function(request,response) {
    var returnedProducts = products.slice(0, defaultProductReturnCount)
    response.end(JSON.stringify(returnedProducts));
});

// return the correct products for a given brand
myRouter.get('/api/brands/:id/products', function(request,response) {
    let brandId = brands.find((brand)=> {
        // match the request params with the brand's id in the json
        return brand.id == request.params.id
      }) 
    response.end(JSON.stringify(brandId));
});

// return all items in user's cart
myRouter.get('/api/me/cart', function(request,response) {
    response.end(JSON.stringify(user.cart_items));
});

// post all items to cart?
myRouter.post('/api/me/cart', function(request,response) {
    // ?????
});

myRouter.delete('/api/me/cart/:productId', function(request,response) {
    let deleteProduct = products.find((product)=> {
        return product.id == request.params.productId
      })
      // remove the 'deleteProduct' from cart_items
      user.cart_items.splice(1, deleteProduct); //remove one item, deleteProduct
      response.end();
});

// find product in products array and add to user's cartItems
myRouter.post('/api/me/cart/:productId', function(request,response) {
    let addProduct = products.find((product)=> {
        return product.id == request.params.productId
      })
      // add item with correct productId to user's cart
      user.cart_items.push(addProduct); 
      response.end();
});

// Login call
myRouter.post('/api/login', function(request,response) {

    if (request.body.username && request.body.password) {
      let user = users.find((user)=>{
        return user.login.username == request.body.username && user.login.password == request.body.password;
      });
      if (user) {

        response.writeHead(200, {'Content-Type': 'application/json'});    

        let currentAccessToken = accessTokens.find((tokenObject) => {
          return tokenObject.username == user.login.username;
        });
    
        if (currentAccessToken) {
          currentAccessToken.lastUpdated = new Date();
          response.end(JSON.stringify(currentAccessToken.token));
        } else {
            let newAccessToken = {
            username: user.login.username,
            lastUpdated: new Date(),
            token: uid(16)
          }
          accessTokens.push(newAccessToken);
          response.end(JSON.stringify(newAccessToken.token));
        }
      } else {
        response.writeHead(401, "Invalid username or password");
        response.end();
      }
    } else {
      response.writeHead(400, "Incorrectly formatted response");
      response.end();
    }
    });