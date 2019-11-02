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
  // Load initial users
  fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });
  console.log(`Server is listening on ${PORT}`);
});

router.get("/api/brands", (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  // Return all brands
  res.end(JSON.stringify(brands))
})

router.get('/api/brands/:id/products', (req, res) => {
  // Return only matching products from given brand
  let productsInBrand = products.filter((product) => {
    return product.brandId === req.params.id
  })

  // Return 404 if no products found(brand doesn't exist)
  if (productsInBrand.length === 0) {
    res.writeHead(404, {
      'Content-Type': "text/plain"
    })
    return res.end("404 Error: Brand ID not found.")
  }

  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(productsInBrand));
})

router.get("/api/products", (req, res) => {
  // Get our query params from the query string
  const queryParams = queryString.parse(url.parse(req.url).query)

  if (queryParams.query) {
    // Saves query value
    const searchQuery = queryParams.query;

    // Return only products matching name from searchQuery
    const matchingProducts = products.filter(product => {
      return (
        product.name.toUpperCase().includes(searchQuery.toUpperCase()) ||
        product.description.toUpperCase().includes(searchQuery.toUpperCase())
      )
    })

    // Return 404 if no products found
    if (matchingProducts.length === 0) {
      res.writeHead(404, {
        'Content-Type': "text/plain"
      })
      return res.end("404 Error: No products found.")
    }

    // Return all matching products
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    return res.end(JSON.stringify(matchingProducts));
  }

  // Returns all products if no query given
  else {
    res.writeHead(200, {
      'Content-Type': 'application/json'
    })
    return res.end(JSON.stringify(products))
  }

})

router.post("/api/login", (req, res) => {
  let emailReq = req.body.email
  let passwordReq = req.body.password
  let currentUser = (users.find(user => (user.email == emailReq) && (user.login.password === passwordReq)))

  // If no user found matching given credentials, return error
  if (!currentUser) {
    res.writeHead(401, {
      'Content-Type': "text/plain"
    })
    res.end("Error: username and/or password incorrect")
  }

  // Return username if correct login credentials provided
  res.writeHead(200, {
    'Content-Type': "text/plain"
  })
  res.end(currentUser.login.username)
})
// allow for testing
module.exports = server