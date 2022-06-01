var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const { response } = require('express');

const PORT = 8800;

let brands = [];
let user = {};
let products = [];
let users = [];
let accessTokens = [{
  username: '',
  lastUpdated: new Date(),
  token: ''
}];



http.createServer(function (request, response) {
  const PORT = 8080;

}).listen(PORT);

const myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));

  users = JSON.parse(fs.readFileSync('intial-data/users.json', 'utf-8'));

  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
});

const saveUser = (user) => {
  fs.writeFileSync('initial-data/users.json', JSON.stringify(user), 'utf-8');
}

myRouter.get('/brands', (request, response) => {
  response.writeHead(200, {"Content-Type": "application/json"});
  return response.end(JSON.stringify(brands));
})

myRouter.get('/brands/:id/products', (req, res) => {
  const { id } = req.params;
  const productsResult = products.filter(product => product.categoryId == id);
  const brand = brands.find(brand => brand.id == id);

  if (!brand) {
    res.writeHead(404, "That does not exist");
    return res.end();
  } else if (!productsResult) {
    res.writeHead(404, "None Found");
    return res.end();
  } else {
      res.writeHead(200, {"Content-Type": "application/json"});
      return res.end(JSON.stringify(productsResult));
  }
})

myRouter.get('/products', (req, res) => {
  const newUrl = url.parse(req.originalUrl);
  const { query } = URLSearchParams.parse(newUrl.query);
  let productsToReturn = []

  if (query !== undefined) {
    productsToReturn = products.filter(product => {
      return product.description.includes(query) || product.name.includes(query)
    });

    if (!productsToReturn) {
      res.writeHead(404, "no items match this data");
      return response.end();
    }
  } else {
    productsToReturn = products;
  }
  res.writeHead(200, {"Content-Type": "application/json"})
  return res.end(JSON.stringify(productsToReturn));
})

myRouter.post("/login", (req, res) => {
  if (req.body.username && req.body.password) {
    let user = users.find((user) => {
      return user.login.username == req.body.username && user.login.password == req.body.password
    });

    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });

      let currentAccessToken = accessTokens.find((token) => {
        token.username == user.login.username
      });

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();

        return res.end(JSON.stringify(currentAccessToken.token))
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }

        accessTokens.push(newAccessToken);
        return res.end(JSON.stringify(newAccessToken.token))
      }
    } else {
      res.writeHead(401, "Invalid name or password");
      return res.end();
    }
  } else {
    res.writeHead(400, "incorrect format");
    return res.end();
  }
});

const TOKEN_TIMEOUT = 15 * 60 * 1000;

const getValToken = (request) => {
  const newUrl = require('url').parse(request.url, true);

  if (newUrl.query.accessToken) {
    let currentAccessToken = accessTokens.find((accessToken) => {
      return accessToken.token == newUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_TIMEOUT;
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

myRouter.get('/me/cart', (req, res) => {
  let currentAccessToken = getValToken(req);

  if (!currentAccessToken) {
    res.writeHead(401, "You need to login")
    return res.end();
  }
  user = users.find(user=> {
    return currentAccessToken.username === user.login.username
  })

  res.writeHead(200, {"Content-Type": "application/json"})
  return res.end(JSON.stringify(user.cart));
});

myRouter.post("/me/cart", (req, res) => {
  let currentAccessToken = getValToken(req);

  if (!currentAccessToken) {
    res.writeHead(401, "You need to login")
    return res.end();
  }
  const user = users.find(user => {
    return currentAccessToken.username === user.login.username
  });
  const product = products.find(product => {
    return req.body.productId == product.id;
  });
  const prodCart = user.cart.find(item => {
    return req.body.productId == item.productId;
  })

  if (prodCart) {
    const index = user.cart.indexOf(prodCart);
    user.cart[index].count += 1;
  } else {
    user.cart.push({
      "productId": product.id,
      "count": 1,
      "price": product.price
    })
  }
  saveCurrentUser(user);
  res.writeHead(200, {"Content-Type": "application/json"})
  return res.end(JSON.stringify(product));
})

myRouter.delete("/me/cart/:productId", (req, res) => {
  let currentAccessToken = getValToken(req);

  if (!currentAccessToken) {
    res.writeHead(401, "You need to login")
    return res.end();
  }
  user = users.find(user => {
    return currentAccessToken.username === user.login.username
  });

  const delItem = user.cart.find(item => {
    return item.productId == req.params.productId;
  })

  if (delItem) {
    const index = user.cart.indexOf(delItem);
    user.cart.splice(index, 1);

    saveCurrentUser(user);
    res.writeHead(200);
    return res.end();
  } else {
    res.writeHead(404, "Item not in cart");
    return res.end();
  }
});

myRouter.post("/me/cart/:productId", (req, res) => {
  let currentAccessToken = getValToken(req);

  if (!currentAccessToken) {
    res.writeHead(401, "You need to login")
    return res.end();
  }
  user = users.find(user => {
    return currentAccessToken.username === user.login.username
  });

  const increment = user.cart.find(item => {
    return item.productId == req.params.productId;
  })

  if (increment) {
    const index = user.cart.indexOf(increment);
    user.cart[index].count += 1;

    saveCurrentUser(user);

    res.writeHead(200, {"Content-Type": "application/json"})
    return res.end(JSON.stringify(increment));
  } else {
    res.writeHead(404, "Item not in cart")
    return res.end();
  }
})

module.exports = server;