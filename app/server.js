var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

const accessTokens = [
  {
  username: 'yellowleopard753',
  lastUpdated: new Date(),
  token: '723b306d-8f49-4a9e-9cca-8c8b8f3983fd'
  },
  {
  username: 'lazywolf342',
  lastUpdated: new Date(),
  token: '5e09efdf-9e7e-400f-8468-d79ebf39c185'
  },
  {
  username: 'greenlion235',
  lastUpdated: new Date(),
  token: 'e32a7da0-6b18-4a37-a443-055952e19a23'
  }
  ]
// todo: setup server, create endpoints:
// GET /api/brands
// GET /api/brands/:id/products
// GET /api/products
// POST /api/login
// GET /api/me/cart
// POST /api/me/cart
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId

const server = http.createServer(function (request, response) {
}).listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  const brands = JSON.parse(fs.readFileSync('initial-data/brands.json'))
  const users = JSON.parse(fs.readFileSync('initial-data/users.json'))
  const products = JSON.parse(fs.readFileSync('initial-data/products.json'))
  console.log("Loading " + brands.length + " brands");
  console.log("Loading " + users.length + " users");
  console.log(("Loading " + products.length + " products"));
});

module.exports = server