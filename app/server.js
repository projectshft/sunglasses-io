var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
// State holding variables
let brands = [];
let products = [];
let users = [];

// Router setup
const router = Router();
router.use(bodyParser.json());

http.createServer(function (request, response) {

  router(request, response, finalHandler(request, response));

}).listen(PORT, error => {
    // if (error) {
    //   return console.log("Error on Server Startup: ", error);
    // }
    // fs.readFile("stores.json", "utf8", (error, data) => {
    //   if (error) throw error;
    //   stores = JSON.parse(data);
    //   console.log(`Server setup: ${stores.length} stores loaded`);
    // });
    // fs.readFile("users.json", "utf8", (error, data) => {
    //   if (error) throw error;
    //   users = JSON.parse(data);
    //   console.log(`Server setup: ${users.length} users loaded`);
    // });
    // console.log(`Server is listening on ${PORT}`);
  });