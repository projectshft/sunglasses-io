var http = require('http');
var fs = require('fs');
var uid = require('rand-token').uid;
var finalHandler = require('finalhandler');
var Router = require('router');
var bodyParser   = require('body-parser');
const url = require("url");

const PORT = 3001;
let brands = [];
let users = []
let token = [];
let products = [];

// server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

//router
const router = Router();
router.use(bodyParser.json());

//setup
server.listen(PORT, err => {
  if (err) throw err;

  brands = JSON.parse(fs.readFileSync("initial-data/brands.json","utf-8"));
  products = JSON.parse(fs.readFileSync("initial-data/products.json","utf-8"));
  users = JSON.parse(fs.readFileSync("initial-data/users.json","utf-8"));

});

//helper function? 
const getValidToken = function(req) {
  const url = require('url').parse(req.url, true);
  if (url.query.token) {    
    let accessToken = token.find(p => {
      return p.token == url.query.token;
    });
    if (accessToken) {
      return accessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

//sunglasses route
router.get('/api/sunglasses', function(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const search = parsedUrl.query.q;

  if(search === undefined || search.length === 0){
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(products))
  } else if (search.length > 0) {
    const filter = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if(filter.length !== 0) {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(filter));
    } else {
      res.writeHead(400, 'Invalid Search');
      return res.end();
    }
  }
});

//Brands
router.get('/api/brands', function(req, res) {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
})

//Brands/Id
router.get('/api/brands/:brandId/sunglasses', function(req, res) {
  const {brandId} = req.params;
  const filter= products.filter(p => p.categoryId === brandId);
  
  if(filter.length > 0) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(filter));
  } else {
    res.writeHead(404, 'Unable to find brand given the id.');
    return res.end();
  }
})


//User + token
router.post('/api/me', function( req, res) {
  const { username, password } = req.body;

  if(req.body.username && req.body.password) {
    let user = users.find(p => {
      return p.login.username === req.body.username && p.login.password === req.body.password;
    });

    if(user) {
      res.writeHead(200, { "Content-Type": "application/json" });
      
      let accessToken = token.find((p) => {
        return p.username == user.login.username;
      });

      if (accessToken) {
        accessToken.lastUpdated = new Date();
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(accessToken.token));
      } else {
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(11)
        }
        token.push(newAccessToken);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      res.writeHead(404, 'incorrect username, password, or both.')
      return res.end();
    }
  } else {
    res.writeHead(404, 'incorrect username, password, or both.')
    return res.end();
  }
})

// /me/cart get
router.get('/api/me/cart', function(req, res) {
  const accessToken = getValidToken(req);
  if(accessToken) {
    res.writeHead(200, {'Content-Type': 'application/json'})
    let filter = users.find(p => p.login.username == accessToken.username);
    return res.end(JSON.stringify(filter.cart));
  } else {
    res.writeHead(400, 'Invalid access token');
    return res.end();
  }
})

//me/cart post
router.post('/api/me/cart', (req, res) => {
  let accessToken = getValidToken(req);
  if (!currentAccessToken) {
    res.writeHead(400, "Invalid access token");
    return res.end();
  } 
})

// /me/cart/add
router.post('/api/me/cart/:id/add', (req, res) => {
  let accessToken = getValidToken(req);


  if(accessToken) {
    const filter = products.find(p => p.name == req.body.name)

    if(filter) {
      res.writeHead(200, {'Content-Type': 'application/json'})
      let userFilter = users.find(p => p.login.username == accessToken.username);
      let product = {
        product: filter,
        quantity: 1
      }

      userFilter.cart.push(product);
      return res.end(JSON.stringify(userFilter.cart));

    } else {
      res.writeHead(401, "Not a valid product");
      return res.end();
    }
  } else {
    res.writeHead(400, "Invalid access token");
    return res.end();
  }
})

// /me/cart/remove
router.post('/api/me/cart/:id/remove', (req, res) => {
  let accessToken = getValidToken(req)
  if(accessToken) {
    const filter = products.find(p => p.name == req.body.name)
    if(filter) {
      res.writeHead(200, {'Content-Type': 'application/json'})
      let userFilter = users.find(p => p.login.username == accessToken.username);
      let newCart = userFilter.cart.filter(p => p.product.name !== req.body.name)
      userFilter.cart = newCart
      return res.end(JSON.stringify(userFilter.cart));
    } else {
      res.writeHead(401, "Not a valid product");
      return res.end();
    }
  } else {
    res.writeHead(400, "Invalid access token");
    return res.end();
  }
})


//me/cart/quantity
router.post('/api/me/cart/:id/quantity', (req, res) => {
  let accessToken = getValidToken(req)

  if(req.body.quantity < 1) {
    console.log('quantity greater than one ')
    res.writeHead(401, "Quantity must be greater than 1");
      return res.end();
  }

  if(accessToken) {
    let userFilter = users.find(p => p.login.username == accessToken.username)
    let productFilter = userFilter.cart.find(p => p.product.id == req.params.id)
    if(productFilter) {
      res.writeHead(200, {'Content-Type': 'application/json'})
      console.log('what is good')
      const changeQuantity = userFilter.cart.indexOf(productFilter)
      userFilter.cart[changeQuantity].quantity = req.body.quantity;
      return res.end(JSON.stringify(userFilter.cart));
    } else {
      res.writeHead(404, "Can't change quantity of this item")
    }
  } else {
    res.writeHead(400, "Invalid access token");
    return res.end();
  }
})
module.exports = server;