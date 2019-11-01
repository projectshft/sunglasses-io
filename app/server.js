const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const url = require('url')
const uid = require('rand-token').uid;

const PORT = 3001;
// State holding variables
let brands = [];
let products = [];
let users = [];

// Router setup
const router = Router();
router.use(bodyParser.json());

// Declare server to export for testing
const server = http.createServer(function (request, response) {

  router(request, response, finalHandler(request, response));

}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }
  // Load initial brands
  fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  // Load initial products
  fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

router.get("/api/brands", (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(brands))
})

router.get("/api/products", (req, res) => {

  res.writeHead(200, {
    'Content-Type': 'application/json'
  })

  // Get our query params from the query string
  const queryParams = queryString.parse(url.parse(req.url).query)

  if (queryParams.query) {
    // Saves query value
    const searchQuery = queryParams.query;

    // Return only products matching name from searchQuery
    const matchingProducts = products.filter(product => {
      return (product.name.toUpperCase().includes(searchQuery.toUpperCase()))
    })
    // Return all matching products
    return res.end(JSON.stringify(matchingProducts));
  }
  // Returns all products if no query given
  else {
    return res.end(JSON.stringify(products))
  }

})

// allow for testing
module.exports = server