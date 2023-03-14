const http = require('http');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const fs = require('fs');


const uid = require('rand-token').uid;
const newAccessToken = uid(45);

let accessToken = [];

//state variables
let brands = [];
let users = [];
let products = [];


// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  	myRouter(request, response, finalHandler(request, response))
}).listen(8090, () => {

  console.log("Node is running on 8090")
});

//Brands file
fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
  if (error) throw error;
  brands = JSON.parse(data);
  console.log(`Server setup: ${brands.length}`)
});
//users file
fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
  if (error) throw error;
  users = JSON.parse(data);
  console.log(`Server setup: ${users.length}`)
});
//products file
fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
  if (error) throw error;
  products = JSON.parse(data);
  console.log(`Server setup: ${products.length}`)
});

//GET Brands OK
myRouter.get('/brands', function(request, response) {
  let allBrands = brands
  if(!allBrands) {
    response.writeHead(404, "Nothing to return");
  }
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(allBrands));
});

//GET Products OK
myRouter.get('/products', function(request, response) {
  if(!products) {
    response.writeHead(404, "Nothing to return");
  };
response.writeHead(200, {"Content-Type": "application/json"});
return response.end(JSON.stringify(products));
});

//GET Products with filtered by brand OK
myRouter.get('/brands/:brandId/products', function(request, response) {
  let {brandId} = request.params;
  if (brandId > 5) {
    response.writeHead(400, "No parameter with that ID")
    return response.end("No brand with that id please choose 1 through 5")
  }

  let match = [];
  let getProduct = function (brand, product, parameter) {
    let myParam = parameter.toString();
    product.forEach(prod => {
     let myBrand = brand.find(e =>
       e.id === prod.categoryId);
       if (myBrand.id === myParam) {
         match.push(myBrand.name)
         match.push(prod.name)
         match.push(prod.price)
         match.push(prod.description)
         match.push(prod.imageUrls)
       }
   })
  }

  //For Test with id 2
  // getProduct(brands, products, "2")

  //disable  below for test
   getProduct(brands, products, brandId);
  products = match;
  console.log(products)
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(products));


})

//POST login
myRouter.post('/login', (request, response) => {
})


//GET Me/Cart
myRouter.get("/me/cart", function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if(!currentAccessToken) {
    response.writeHead(401, "Unauthorized to access shopping cart");
    return response.end();
  } else {
    let cart = users.cart;
    let user = users.find((user) => {
      return user.login.username === currentAccessToken.username;
    });
    if(user) {
      response.writeHead(200, "Access granted")
      return response.end(JSON.stringify(cart));
    } 
  }
})

//POST Me/Cart
myRouter.post('/me/cart', function (request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if(!currentAccessToken) {
    response.writeHead(401, "Unauthorized to access shopping cart");
    return response.end();
  } else {
    let cart = users.cart;
    let user = users.find((user) => {
      return user.login.username === currentAccessToken.username;
    });
    if(user) {
      response.writeHead(200, "Access granted")
      return response.end(JSON.stringify(cart));
    } 
  }
});

//DELETE /me/cart/{prodId}
myRouter.delete('/me/cart/:productId', function (reqest, response) {
  let currentAccessToken = getValidTokenFromRequest(request);

  if(!currentAccessToken) {
    response.writeHead(401, "Unauthorized to access shopping cart");
    return response.end();
  }
  
  let {productId} = request.params;
  let cart = users.cart;

  const removeItem = function(id) {
    products = products.filter((p => p.id !=id))
  };

  cart = removeItem(productId);
  response.writeHead(200, "Item Successfully remove");
  return response.end(JSON.stringify(cart));

  
})

module.exports = server;