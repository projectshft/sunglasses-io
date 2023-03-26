const http = require('http');
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser = require('body-parser');

const usersData = require('../initial-data/users.json');
const sunData = require('../initial-data/products.json');
const brandsData = require('../initial-data/brands.json');

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

let brands = brandsData;
let users = usersData;
let sunglasses = sunData;
const cartData = [];

let server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

myRouter.get('/sunglasses', function(request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(sunglasses));
});

myRouter.post('/me', function (request, response) {
  const { username, password } = request.body;
  const user = users.find(
    (user) => user.login.username === username && user.login.password === password
  );

  if (user) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user));
  } else {
    response.writeHead(401, { "Content-Type": "application/json" });
    return response.end(JSON.stringify({ error: "Invalid credentials" }));
  }
});

myRouter.post('/cart/sunglasses/:id/addToCart', function (request, response) {
  const { id } = request.params;
  const { sunglassesId, action, quantity } = request.body;

  if (action !== 'update_quantity' || !quantity) {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ error: 'Invalid action or missing quantity' }));
  }

  const sunglass = sunData.find(sunglass => sunglass.id === id);

  if (!sunglass) {
    response.writeHead(401, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ error: 'Invalid sunglasses ID' }));
  }

  const cartItemIndex = cartData.findIndex(item => item.sunglassesId === sunglassesId);

  if (cartItemIndex === -1) {
    cartData.push({ sunglassesId, quantity });
  } else {
    cartData[cartItemIndex].quantity = quantity;
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cartData));
});

myRouter.put('/cart/sunglasses/:id/changeQuantity', function (request, response) {
  const { id } = request.params;
  const { sunglassesId, action } = request.body;

  if (action !== 'remove') {
    response.writeHead(400, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ error: 'Invalid action' }));
  }

  const sunglass = sunData.find(sunglass => sunglass.id === id);

  if (!sunglass) {
    response.writeHead(401, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify({ error: 'Invalid sunglasses ID' }));
  }

  const cartItemIndex = cartData.findIndex(item => item.sunglassesId === sunglassesId);

  if (cartItemIndex !== -1) {
    cartData.splice(cartItemIndex, 1);
  }

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(cartData));
});

myRouter.post('/cart/checkout', function (request, response) {
  const totalPrice = cartData.reduce((total, item) => {
    const sunglasses = sunData.find(sunglasses => sunglasses.id === item.sunglassesId);
    return total + (item.quantity * sunglasses.price);
  }, 0);

  const responseBody = {
    message: 'Checkout processed successfully',
    totalPrice: totalPrice,
    purchasedItems: cartData
  };

  cartData.length = 0;

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(responseBody));
});

myRouter.get('/brands', function (request, response) {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
});

myRouter.get('/brands/:id/products', function (request, response) {
  const { id } = request.params;

  const products = sunglasses.filter(product => product.brandId === id);

  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

module.exports = server;