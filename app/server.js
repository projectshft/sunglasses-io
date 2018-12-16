var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

let users = {};
let brands = [];
let products = []

const PORT = process.env.PORT || 8080

const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (req, res) {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
})

server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);

fs.readFile("initial-data/brands.json", "utf-8", (err, data) => {
    if(err) throw err;
    brands = JSON.parse(data);
});

fs.readFile("initial-data/users.json", "utf-8", (err, data) => {
    if(err) throw err;
    users = JSON.parse(data);
});

fs.readFile("initial-data/products.json", "utf-8", (err, data) => {
    if(err) throw err;
    products = JSON.parse(data);
});

router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(brands))
});

router.get("/api/brands/:id/products", (request, response) => {
    response.writeHead(200, {"Content-Type": "application/json"} )
    return response.end(JSON.stringify(users))
  })

router.get("/api/login", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json"});
  return response.end(JSON.stringify(users))
})
})



module.exports = server;