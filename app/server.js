var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 8080;

let sunglasses = [];
let brands = [];
let user = {};
let users = [];

const router = Router();
router.use(bodyParser.json());


const server = http.createServer((req, res) => {
    res.writeHead(200)
    router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
    if(err) throw err;
    // console.log(`server running on port ${PORT}`);

    sunglasses = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));

    brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

    users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));

    user = users[0];
})

module.exports = server;