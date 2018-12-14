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
let products = [];
let users = [];
//i think you need to add a user object that hold the login info for a specific user. This will probably be necessary when it comes to authorization

const PORT = 3001;

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
    console.log(`serve running on port ${PORT}`)
});