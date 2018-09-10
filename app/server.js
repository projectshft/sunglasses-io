var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;


const PORT = 3001;

// Create the server
http.createServer(function (request, response) {
  response.writeHead(200, {'Content-type': 'text/plain/n'});
  response.write(`server is listening on ${PORT}\n`);
  response.end(`Hello World`);
}).listen(PORT);
fs.readFile('initial-data/brands.json', (err, data) => {
  if (err) throw err;
  brands = JSON.parse(data);
  console.log(brands);
  console.log(`Server setup: ${brands.length} brands loaded`);
});
fs.readFile('initial-data/products.json', (err, data) => {
  if (err) throw err;
  products = JSON.parse(data);
  console.log(products);
  console.log(`Server setup: ${products.length} products loaded`);
});
fs.readFile('initial-data/users.json', (err, data) => {
  if (err) throw err;
  users = JSON.parse(data);
  console.log(users);
  console.log(`Server setup: ${users.length} users loaded`);
});

  console.log(`Server is listening on ${PORT}`);
