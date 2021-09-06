var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

let brands = [];
let products = [];
let users = [];

const PORT = 3001;

const TOKEN_VALIDITY_TIMEOUT = 1440 * 60 * 1000;

const accessTokens = [];
const cart = [];


let myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
  brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));

  products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));

  users = JSON.parse(fs.readFileSync('../initial-data/users.json', 'utf-8'));
});

myRouter.get('/api/products', function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

myRouter.get('/api/brands', function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', function(request, response) {
  const id = request.params.id;
  const selectedBrand = brands.find(brand => brand.id == id);

  if (!selectedBrand) {
    response.writeHead(404, "There are not products of this brand");
    return response.end();
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  
  const brandProducts = products.filter(
    product => product.categoryId === id
  );
  return response.end(JSON.stringify(brandProducts));
});

myRouter.post('/api/login', (request, response) => {

  if (request.body.username && request.body.password) {

    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });

    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });

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
      response.writeHead(401, "Incorrect username or password");
      return response.end();
    }

  } else {
    response.writeHead(400, "Missing username or password");
    return response.end();
  }
});

const getValidTokenFromRequest = function (req) {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.query.validToken) {
    const currentAccessToken = accessTokens.find(
      (accessToken) =>
        accessToken.token == parsedUrl.query.validToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
    );

    if (currentAccessToken) {
      return currentAccessToken;
    }
    return null;
  }
  return null;
};

myRouter.get("/v1/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "Please login to access cart");
    return response.end();
  }

  let user = users.find((user) => {
    return user.login.username === currentAccessToken.username;
  });

  if (!user) {
    response.writeHead(401, "The user does not exist");
    return response.end();
  } else {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(user.cart));
  }
});

myRouter.post("/v1/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "You don't have access, please log in");
    return response.end();
  }
  let user = users.find((user) => {
    return user.login.username === currentAccessToken.username;
  });
  if (!user) {
    response.writeHead(401, "The user does not exist");
    return response.end();
  } else {

    const productId = request.body.productId;
    const addedProduct = products.find(product => product.id == productId);

    if (!addedProduct) {
      response.writeHead(404, "That product does not exist");
      return response.end();
    }

    if (request.body.quantity >= 1) {
      addedProduct.quantity = request.body.quantity;
      user.cart.push(addedProduct);
    } else {
      response.writeHead(404, "That quantity is not valid");
    }
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(user.cart));
  }
});

myRouter.post("/v1/me/cart/:productId", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "You don't have access, please log in");
    return response.end();
  }

  let user = users.find((user) => {
    return user.login.username === currentAccessToken.username;
  });

  if (!user) {
    response.writeHead(401, "The user does not exist");
    return response.end();
  } else {
    const { productId } = request.params;
    const foundProduct = user.cart.find(product => product.id == productId);

    if (!foundProduct) {
      response.writeHead(404, "That product is not in the cart");
      return response.end();
    }
    const indexOfItemInCart = user.cart.findIndex(i => i.id === productId);
    let cart = user.cart;

    if (request.body.quantity >= 1) {
      cart[indexOfItemInCart].quantity = request.body.quantity;
    } else {
      response.writeHead(404, "That quantity is not valid");
      return response.end();
    }
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(user.cart));
  }
});

myRouter.delete("/v1/me/cart/:productId", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401, "You don't have access, please log in");
    return response.end();
  }

  let user = users.find((user) => {
    return user.login.username === currentAccessToken.username;
  });

  if (!user) {
    response.writeHead(401, "The user does not exist");
    return response.end();
  } else {
    const { productId } = request.params;
    const product = user.cart.find(product => product.id == productId);

    if (!product) {
      response.writeHead(404, "That product is not in the cart");
      return response.end();
    }
    const productToRemove = user.cart.indexOf(product);
    user.cart.splice(productToRemove, 1);
    response.writeHead(200);
    return response.end();
  }
});

module.exports = server;
