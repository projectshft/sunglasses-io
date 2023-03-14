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
//GET Products with filtered by brand
myRouter.get('/brands/:brandId/products', function(request, response) {
  let {brandId} = request.params;
  if (brandId > 5) {
    response.statusCode = 400
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
       }
   })
  }
  getProduct(brands, products, "2")

  response.writeHead(200, "Success");
  console.log(match)
  return response.end(match);


})
//POST login
myRouter.post('/login', (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, "Success")

      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      if ( currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(45)
        }
        accessToken.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(400, "Bad Request");
      return response.end();
    }
  } else {
    response.writeHead(401, "Unauthorized User");
    return response.end();
  }
})

//Aaron acces token method helper
var getValidTokenFromRequest = function(request) {
  var parsedUrl = require('url').parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
    });
    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

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