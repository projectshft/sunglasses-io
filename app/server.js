var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
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





const server = http.createServer((request, response) => {
  router(request, response, finalHandler(request, response));
})
  .listen(PORT, () => {
    products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));

    brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

    users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
    console.log(`server running on port ${PORT}`);
  });

// const saveCurrentUser = (currentUser) => {
//   // set hardcoded "logged in" user
//   users[0] = currentUser;
//   fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
// }
// // Route to endpoint handlers
// Route to brands get /api/brands
router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});
// Route to products get /api/products
router.get("/api/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});
// Route to product ids GET / api / brands /: id / products
router.get("/api/brands/:id/products", (request, response) => {
  const { categoryId } = request.params;
  const category = categories.find(category => category.id == categoryId);
  if (!category) {
    response.writeHead(404, "That category does not exist");
    return response.end();
  }
  response.writeHead(200, { "Content-Type": "application/json" });
  const relatedGoals = categories.filter(
    category => category.id === categoryId
  );
  return response.end(JSON.stringify(relatedGoals));
});




module.exports = server;
