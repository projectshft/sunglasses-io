var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
const url = require("url");
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

const router = Router();
router.use(bodyParser.json());

let brands = [];
let products = [];
let users = [];
let accessTokens = [{
  username: 'emily',
  token: '1234'
}];

let server = http.createServer(function (request, response) {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
}).listen(PORT, err => {
  if (err) throw err;

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));

  console.log(`server running on port ${PORT}`);
});

router.get("/api/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);
  
  let brandToReturn = [];
  if (query !== undefined) {
    brandToReturn = brands.filter(brand => brand.name.includes(query))
  }
  else {
    brandToReturn = brands;
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandToReturn));
})

router.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brand = brands.find(brand => brand.id === id);
  if (brand) {
    let brandsProducts = products.filter(product => product.categoryId === brand.id);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brandsProducts));
  }
  else {
    response.writeHead(404, "No brand found");
    return response.end();
  }
});

router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = queryString.parse(parsedUrl.query);

  let productsToReturn = []
  if (query !== undefined) {
    productsToReturn = products.filter(product => product.name.includes(query) || product.description.includes(query))
  }
  else {
    productsToReturn = products
  }
 
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn))
})

router.post("/api/login", (request, response) => {
  if(request.headers.username && request.headers.password) {
    let user = users.find((user) => {
      return user.login.username == request.headers.username && user.login.password == request.headers.password;
    });

    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });
      
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      if(currentAccessToken) {
        return response.end(JSON.stringify(currentAccessToken.token));
      }
      else {
        let newAccessToken = {
          username: user.login.username,
          token: uid(11)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    }
    else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  }
  else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

const getValidTokenFromRequest = function(request) {
  const parsedUrl = url.parse(request.url, true)

  if (parsedUrl.query.accessToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == parsedUrl.query.accessToken;
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

router.get("/api/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  
  if (!currentAccessToken) {
    response.writeHead(401, "User is not logged in");
    return response.end()
  }
  else {
    let user = users.find(user => user.login.username === currentAccessToken.username);
    let cart = user.cart
    
    response.writeHead(200, { "Content-Type": "application/json" })
    return response.end(JSON.stringify(cart))
  }
});

router.post("/api/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  
  if (!currentAccessToken) {
    response.writeHead(401, "User is not logged in");
    return response.end()
  }
  else {
    let item = request.body.product;
    let user = users.find(user => user.login.username === currentAccessToken.username);
    let cart = user.cart;
    cart.push(item);

    response.writeHead(200, { "Content-Type": "application/json" })
    return response.end(JSON.stringify(cart));
  }
})

router.delete("/api/me/cart/:productId", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  
  if (!currentAccessToken) {
    response.writeHead(401, "User is not logged in");
    return response.end()
  }
  else {
    let { productId } = request.params;

    let user = users.find(user => user.login.username === currentAccessToken.username);
    let cart = user.cart;
    let makeSureIdExists = cart.find(item => item.id === productId);
    
    if (!makeSureIdExists) {
      response.writeHead(404, "Not found");
      return response.end();
    }
    else {
      let updatedCart = cart.filter((item => item.id !== productId));
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(updatedCart));
    }
  }
});

router.post("/api/me/cart/:productId", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  
  if (!currentAccessToken) {
    response.writeHead(401, "User is not logged in");
    return response.end()
  }
  else {
    let { productId } = request.params;

    let user = users.find(user => user.login.username === currentAccessToken.username);
    let cart = user.cart;
    let makeSureIdExists = cart.find(item => item.id === productId);
    
    if (!makeSureIdExists) {
      response.writeHead(404, "Not found");
      return response.end();
    }
    else {
      let amount = request.body.amount;
      let itemToChange = cart.find(item => item.id === productId);
      itemToChange.quantity = amount;
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(cart));
    }
  }
})

module.exports = server;