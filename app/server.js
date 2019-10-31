var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;

let brands = [];

const PORT = process.env.PORT || 3001;

const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  //populate brands
  brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
});

router.get("/v1/brands", (request, response) => {
  return prepareValidResponse(response, brands);
});

//helper function to send return object back as JSON while setting JSON header
//instead of doing it every single repsonse
let prepareValidResponse = function(response, value) {
  response.writeHead(200, { "Content-Type": "application/json" });
  if (value !== undefined) {
    return response.end(JSON.stringify(value));
  } else {
    return response.end();
  }
};

module.exports = server;
