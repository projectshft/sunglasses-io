const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');


const PORT = 4001;

let users = [];
let products = [];
let brands = [];
let user = {};
let validUser = false;

const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, (err) => {
  if (err) {
    return console.log('Error starting server:', err);
  } else {
    console.log('Server is running on port', PORT);
    products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
    brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
    users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
  }
});

router.get('/api/brands', (req, res) => {
  if (!brands) {
    res.writeHead(404, 'Error');
    res.end();
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(brands));
  }
});

router.get('/api/brands/:categoryId/products', (req, res) => {
  const prods = products.filter((product) => product.categoryId == req.params.categoryId);
  if (!prods) {
    res.writeHead(404, 'Error');
    res.end();
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(prods));
  }
});

router.get('/api/products', (req, res) => {
  if (!products) {
    res.writeHead(404, 'Error');
    res.end();
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(products));
  }
});

router.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    user = users.find((user) => user.login.username === username && user.login.password === password);
    if (user) {
      validUser = true;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end();
    } else {
      res.writeHead(401, 'Invalid username or password');
      res.end();
    }
  } else {
    res.writeHead(401, 'Invalid username or password');
    res.end();
  }
});

router.get('/api/me/cart', (req, res) => {
  if (validUser) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user.cart));
  } else {
    res.writeHead(401, 'User not authenticated');
    res.end();
  }
});

router.post('/api/me/cart/add/:productId', (req, res) => {
  const productId = req.params.productId;
  const product = products.find((product) => product.id === productId);
  if (validUser) {
    if (product) {
      user.cart.push(product);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user.cart));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Product not found' }));
    }
  } else {
    res.writeHead(401, 'Invalid username or password');
    res.end();
  }
});

router.post('/api/me/cart/update/:productId', (req, res) => {
  const productId = req.params.productId;
  const product = products.find((product) => product.id === productId);
  if (validUser) {
    if (product) {
      user.cart.push(product);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user.cart));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Product not found' }));
    }
  } else {
    res.writeHead(401, 'Invalid username or password');
    res.end();
  }
});

router.post('/api/me/cart/delete/:productId', (req, res) => {
  const productId = req.params.productId;
  const product = products.find((product) => product.id === productId);
  if (validUser) {
    if (product) {
      user.cart = user.cart.filter((product) => product.id !== productId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(user.cart));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Product not found' }));
    }
  } else {
    res.writeHead(401, 'Invalid username or password');
    res.end();
  }
});

module.exports = server;