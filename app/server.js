var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;

let brands = [];
let products = [];
let users = [];

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

module.exports = server;