var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var querystring = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
const url = require("url");
var uid = require('rand-token').uid;

let brands = [];
let products = [];
let users = [];
let carts = [];
let accessTokens = [];

const newAccessToken = uid(16);

const router = Router();
router.use(bodyParser.json());

const server = http.createServer((request, response) => {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
});

server.listen(3001, err => {
  if (err) throw err;
  console.log("server running on port 3001");

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
});

router.get("/v1/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let brandsToReturn = [];
  if (query !== undefined) {
    brandsToReturn = brands.filter(brand =>
      brand.name.includes(query)

    );
    if (!brandsToReturn) {
      response.writeHead(404, "There aren't any brands to return");
      return response.end();
    }
  } else {
    brandsToReturn = brands;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brandsToReturn));
});

router.get("/v1/brands/:brandId/products", (request, response) => {
  const { brandId } = request.params;
  const brand = brands.find(brand => brand.id == brandId);
  if (!brand) {
    response.writeHead(404, "That brand does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedProducts = products.filter(
    product => product.brandId === brandId
  );
  return response.end(JSON.stringify(relatedProducts));
});

router.get("/v1/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let productsToReturn = [];
  if (query !== undefined) {
    productsToReturn = products.filter(product =>
      product.description.includes(query)

    );
    if (!productsToReturn) {
      response.writeHead(404, "There aren't any products to return");
      return response.end();
    }
  } else {
    productsToReturn = products;
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsToReturn));
});

router.post("/v1/login", (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return user.login.username == request.body.username && user.login.password == request.body.password;
    });
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      let currentAccessToken = accessTokens.find((token) => {
        return token.username == user.login.username;
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify({ token: currentAccessToken.token }));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify({ token: newAccessToken.token }));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {

    response.writeHead(400, "Incorrectly formatted inputs");
    return response.end();
  }
})

const getValidTokenFromRequest = function (request) {
  if (request.headers.currentaccesstoken) {
    let currentAccessToken = accessTokens.find((accessToken) =>
      accessToken.token == request.headers.currentaccesstoken
    );

    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

router.get("/v1/me/cart", (request, response) => {
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
    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(user.cart));
  }
});

router.post("/v1/me/cart", (request, response) => {
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

router.post("/v1/me/cart/:productId", (request, response) => {
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

router.delete("/v1/me/cart/:productId", (request, response) => {
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





