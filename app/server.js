const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser   = require('body-parser');

let brands = [];
let products = [];
let users = [];
let user = {};

const PORT = 3001;

const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
    router(req, res, finalHandler(req, res));
});

server.listen(PORT, '127.0.0.1', (err) => {
  if (err) {
    return console.log('Error')
  } else {
    console.log('Server running on port ' + PORT);
    brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
    products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
    users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
  }
});

router.get('/api/brands', (req, res) => {
  if (!brands) {
    res.writeHead(404, 'Error');
    res.end();
  } else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(brands));
  }
});

router.get('/api/brands/:categoryId/products', (req, res) => {
  const prods = products.filter((product) => {
    return product.categoryId == req.params.categoryId});
  if (!prods) {
    res.writeHead(404, 'Error');
    return res.end();
  } else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(prods));
  }
});

router.get('/api/products', (req, res) => {   
  if (!products) {
    res.writeHead(404, 'Error');
    return res.end();
  } else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(products));
  }
});

router.post('/api/login', (request, response) => {
  if (request.body.username && request.body.password) {
    user = users.find(user => {
      return user.login.username === request.body.username && user.login.password === request.body.password;
    });
    if (user) {
      response.writeHead(200, { 'Content-Type': 'application/json' })
      validUser = true;
      response.end();
    }
  } else {
    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
});

router.get('/api/me/cart', (request, response) => {
  if (validUser) {
    response.writeHead(200, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify(user.cart));
  } else {
    response.writeHead(401, 'user not authenticated');
    return response.end();
  }
});

router.post('/api/me/cart/add/:productId', (request, response) => {
  const productId = request.params.productId;
  const product = products.find(product => product.id === productId);
  user = users[0]
  validUser = true;
  if (validUser) {
    if (product) {
      user.cart.push(product);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(user.cart));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Product not found' }));
    }
  } else {
    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
});

router.post('/api/me/cart/update/:productId', (request, response) => {
  const productId = request.params.productId;
  const product = products.find(product => product.id === productId);
  user = users[0] 
  userAuth = true;
  if (userAuth) {
    if (product) {
      user.cart.push(product);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(user.cart));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Product not found' }));
    }
  } else {
    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
});

router.post('/api/me/cart/delete/:productId', (request, response) => {
  const productId = request.params.productId;
  const product = products.find(product => product.id === productId);
  user = users[0] 
  userAuth = true;
  if (userAuth) {
    if (product) {
      user.cart = user.cart.filter(product => product.id !== productId);
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(user.cart));
    } else {
      response.writeHead(404, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ message: 'Product not found' }));
    }
  } else {
    response.writeHead(401, 'Invalid username or password');
    return response.end();
  }
});

module.exports = server.listen(3001);