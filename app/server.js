var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

// State holding variables
let brands = [];
let user = {};
let products = [];
let users = [];

const PORT = 3001;
// see goalworthy & auth lesson.initial data includes JSON objects to be built out for req / response endpoints

// Setup router
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

  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));

  //populate users
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
  // hardcode "logged in" user
  user = users[0];
});

const saveCurrentUser = (currentUser) => {
  // set hardcoded "logged in" user
  users[0] = currentUser;
  fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
}
// Route to endpoint handlers
// Route to brands get /api/brands
router.get("/api/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query, sort } = querystring.parse(parsedUrl.query);
  let goalsToReturn = [];
  if (query !== undefined) {
    goalsToReturn = goals.filter(goal => goal.description.includes(query));

    if (!goalsToReturn) {
      response.writeHead(404, "There aren't any goals to return");
      return response.end();
    }
  } else {
    goalsToReturn = goals;
  }
  if (sort !== undefined) {
    goalsToReturn.sort((a, b) => a[sort] - b[sort]);
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(goalsToReturn));
});