const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;

const PORT = 3001;
// State holding variables
let brands = [];
let products = [];
let users = [];

// Router setup
const router = Router();
router.use(bodyParser.json());

const server = http.createServer(function (request, response) {

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

router.get("/api/brands", (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(brands))
})

// allow for testing
module.exports = server