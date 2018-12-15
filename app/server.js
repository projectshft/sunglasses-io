var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const { findObject } = require("./utils");

//state holding variables

let brands = [];
let user = {};
let product = {};
let products = [];
let users = [];
//i think you need to add a user object that hold the login info for a specific user. This will probably be necessary when it comes to authorization

const PORT = process.env.PORT || 8080;

//Router setup
const router = Router();
router.use(bodyParser.json());

//Server setup
const server = http.createServer((req, res) => {
    res.writeHead(200);
    router(req, res, finalHandler(req, res))
});

server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);
//populate brands
        brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
//populate products
        products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
        //hardcode product
        product = products[0];    
//populate users
        users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
        user = users[0];
});

router.get("/v1/brands", (req, res) => {
        if(!brands) {
            res.writeHead(404, "That brand cannot be found")
            return res.end();
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(brands));
    });

     

module.exports = server;