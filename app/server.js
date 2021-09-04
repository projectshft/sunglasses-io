var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var url = require('url');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

let brands = [];
let products = [];
let users = [];
let accessTokens = [];

const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (req, res) {
  router(req, res, finalHandler(req, res))
}).listen(PORT, (err) => {

  if (err) {
    return console.log('Error on Server Startup: ', err)
  }

  fs.readFile('./initial-data/brands.json', 'utf8', (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    // console.log(`Server setup: ${brands.length} brands loaded`);
  });

  fs.readFile('./initial-data/products.json', 'utf-8', (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    // console.log(`Server setup: ${products.length} users loaded`);
  })

  fs.readFile('./initial-data/users.json', 'utf8', (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    // console.log(`Server setup: ${users.length} users loaded`);
  });

  // console.log(`Server is listening on ${PORT}`);
});

router.get('/api/brands', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
	return res.end(JSON.stringify(brands));
})

router.get('/api/brands/:id/products', (req, res) => {
  const brandProducts = products.filter(product => product.categoryId === req.params.id);

  if (brandProducts.length === 0) {
    res.writeHead(404, 'Brand not found');
    return res.end();
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brandProducts));
})

router.get('/api/products', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  const queryParams = queryString.parse(url.parse(req.url).query);

  if (queryParams.query) {
    const queryProducts = products.filter(product => product.name.toUpperCase().includes(queryParams.query.toUpperCase()));
    return res.end(JSON.stringify(queryProducts));
  }
  
  return res.end(JSON.stringify(products));
})

router.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);

  if (!product) {
    res.writeHead(404, 'Product not found');
    return res.end();
  }
  
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(product));
})

router.post('/api/login', (req, res) => {
  if (req.body.username && req.body.password) {
    const user = users.find(u => u.login.username === req.body.username && u.login.password === req.body.password);

    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });

      const existingAccessToken = accessTokens.find(accessToken => accessToken.username === user.login.username);

      if (existingAccessToken) {
        existingAccessToken.lastUpdated = new Date();
        return res.end(JSON.stringify(existingAccessToken));
      }

      const newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16)
      }

      accessTokens.push(newAccessToken);
      return res.end(JSON.stringify(newAccessToken));
    }

    res.writeHead(401, 'Invalid username or password');
    return res.end();
  }

  res.writeHead(400, 'Incorrectly formatted request');
  return res.end();
})

const getValidToken = (req) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.query.accessToken) {
    const validAccessToken = accessTokens.find(accessToken => accessToken.token === parsedUrl.query.accessToken);

    if (validAccessToken)
      return validAccessToken;
    
    return null;
  }
  return null;
}

router.get('/api/me/cart', (req, res) => {
  const accessToken = getValidToken(req);

  if (accessToken) {
    const user = users.find(u => u.login.username === accessToken.username);

    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(user.cart));
  }

  res.writeHead(401, 'You need to be logged in to view your cart.')
  return res.end();  
})

module.exports = server;