var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
const { report } = require("process");

const PORT = 3001;

// State holding variables
let sunglasses = [];
let user = {};
let users = [];
let categories = [];

//setup router
let router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {
  response.writeHead(200);
  router(request, response, finalHandler(request, response));
});

server.listen(PORT, () => {
  console.log("Server is running.");
  //load data onto server
  sunglasses = JSON.parse(fs.readFileSync("products.json", "uft-8"));
  //load all users
  users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
  //current user will be user[0] initially
  user = users[0];
  //load all categories
  categories = JSON.parse(fs.readFileSync("brands.json", "utf-8"));
});
