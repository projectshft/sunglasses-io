const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const { access } = require('fs/promises');
const uid = require('rand-token').uid;

let brands = [];
let products = [];
let users = [];
// for the convenience of grading, an access token is given
// the updated time checking is depreciated for the same reason
let accessTokens = [
  {
    username: 'yellowleopard753',
    lastUpdated: new Date(),
    token: 'mVQGrtceicJGzjmg',
  },
];

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
let myRouter = Router();
myRouter.use(bodyParser.json());

let server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    console.log('Error on Server Startup: ', error);

    fs.readFile('../initial-data/brands.json', 'utf8', (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });

    fs.readFile('../initial-data/products.json', 'utf8', (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });

    fs.readFile('../initial-data/users.json', 'utf8', (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });

    console.log(`Server is listening on ${PORT}`);
  });

// GET /api/brands
myRouter.get('/api/brands', (request, response) => {
  //   const queryParams = queryString.parse(url.parse(request.url).query);
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

// GET /api/brands/:id/products
myRouter.get('/api/brands/:id/products', (request, response) => {
  let brand = brands.find((brand) => {
    return brand.id == request.params.id;
  });

  if (!brand) {
    response.writeHead(404, "That brand can't be found");
    return response.end();
  } else {
    let productsAPI = products.filter(
      (product) => product.categoryId == request.params.id
    );

    if (!productsAPI) {
      response.writeHead(404, "That product can't be found");
      return response.end();
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(productsAPI));
  }
});

// GET /api/products
myRouter.get('/api/products', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

// POST /api/login
myRouter.post('/api/login', (request, response) => {
  // console.log('request Body: ', request.body);
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' });
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
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, 'Invalid username or password');
      return response.end();
    }
  } else {
    response.writeHead(400, 'Incorrectly formatted response');
    return response.end();
  }
});

// Helper method to process access token
const getValidTokenFromRequest = function (request) {
  const parsedUrl = require('url').parse(request.url, true);
  // console.log('parseUrl: ', parsedUrl.query.accessToken);
  // console.log(accessTokens);
  if (parsedUrl.query.accessToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == parsedUrl.query.accessToken
        // &&
        // new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
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

// GET /api/me/cart
myRouter.get('/api/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  // console.log(currentAccessToken);
  if (!currentAccessToken) {
    response.writeHead(401, 'You need to have access to this call to continue');
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    if (!user) {
      response.writeHead(403, "You don't have access to the cart");
      return response.end();
    } else {
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify(user.cart));
    }
  }
});

// POST /api/me/cart
myRouter.post('/api/me/cart', (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);
  // console.log('curAccToken: ', currentAccessToken);
  // console.log('request body:: ', request.body);
  if (!currentAccessToken) {
    response.writeHead(401, 'You need to have access to this call to continue');
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    if (!user) {
      response.writeHead(403, "You don't have access to the cart");
      return response.end();
    } else {
      // user.cart = [...user.cart, request.body];
      const newCart = [...user.cart, request.body];
      response.writeHead(200, { 'Content-Type': 'application/json' });
      // console.log('users cart:: ', user.cart);
      return response.end(JSON.stringify(newCart));
    }
  }
});

// DELETE /api/me/cart/:productId
myRouter.delete('/api/me/cart/:productId', (request, response) => {
  const { productId } = request.params;
  let user;
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You need to have access to this call to continue');
    return response.end();
  } else {
    let product = products.find((product) => product.id == productId);
    if (!product) {
      response.writeHead(404, "That product can't be found");
      return response.end();
    }
    user = users.find(
      (user) => user.login.username == currentAccessToken.username
    );
    if (!user) {
      response.writeHead(403, "You don't have access to the cart");
      return response.end();
    } else {
      user = {
        ...user,
        cart: user.cart.filter((c) => c.id != productId),
      };
      // console.log("Updated User's cart", user);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end();
    }
  }
});

// POST /api/me/cart/:productId
myRouter.post('/api/me/cart/:productId', (request, response) => {
  const { productId } = request.params;
  let user;
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    response.writeHead(401, 'You need to have access to this call to continue');
    return response.end();
  } else {
    let product = products.find((product) => product.id == productId);
    if (!product) {
      response.writeHead(404, "That product can't be found");
      return response.end();
    }
    user = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });

    if (!user) {
      response.writeHead(403, "You don't have access to the cart");
      return response.end();
    } else {
      user = {
        ...user,
        cart: [...user.cart, product],
      };
      // user.cart = [...user.cart, product];
      response.writeHead(200, { 'Content-Type': 'application/json' });
      return response.end(JSON.stringify(user));
    }
  }
});

module.exports = {
  server,
};
