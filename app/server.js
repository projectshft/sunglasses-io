var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const url = require('url');
//make the documentation match the code and make the code match the tests
//each of the end-points that you represent via the API yaml file should be represented in the final test suite
//REMEMBER ACCESS FOR SWAGGER DOCUMENTATION
//SECURITY DEFINITIONS

//make 400 404 and 401 Error

//taken from the util.js file in the goalworthy server project
const findObject = (objId, state) => {
  const item = state.find(obj => obj.id === objId);
  return !item ? null : item;
};

const PORT = process.env.PORT || 3005;

//State holding variables
let brands = [];
let products = [];
let users = [];
let failedLoginAttempts = {};
let accessTokens = [];
let user;

//router set up
const router = Router();
router.use(bodyParser.json());

//server set up
const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`Server running on ${PORT}`);
  //populate brands
   brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));

  //populate products
  products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf8'));

  //populate users
  users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
});

  //GET Brands Endpoint
  router.get("/api/brands", (req, res) => {
    const parsedUrl = url.parse(req.originalUrl);
    const { query } = queryString.parse(parsedUrl.query);
    let brandsToReturn = [];
    //if there is an empty query all brands should be returned otherwise
    //the brand returned should be the query in question
    if (query !== undefined) {
      brandsToReturn = brands.filter(brand => brand.name.includes(query));

      if (brandsToReturn.length === 0) {
        res.writeHead(404, `ERROR: Brand not found!`);
        return res.end();
      }
    } else { 
      brandsToReturn = brands;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(brandsToReturn))
  });

  //GET PRODUCTS ENDPOINT
  router.get('/api/products', (req, res) => {
    const parsedUrl = url.parse(req.originalUrl);
    const { query } = queryString.parse(parsedUrl.query);
    let productsToReturn = [];
    if (query !== undefined) {
      //see comment in server.test.js file and YAML documentation for explanation 
      //for choosing to limit queries by description as opposed to name or other property
      productsToReturn = products.filter(product => product.description.includes(query));

      if (productsToReturn.length === 0) {
        res.writeHead(404, 'ERROR: Product Not Found!');
        return res.end();
      }
    } else {
      productsToReturn = products;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(productsToReturn))
  })

  //GET PRODUCTS WITHIN BRANDS
  router.get('/api/brands/:brandId/products', (req, res) => {
    const { brandId } = req.params;
    const brand = findObject(brandId, brands);
    if (!brand) {
      res.writeHead(404, 'ERROR: Brand Not Found!');
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const productsWithinBrand = products.filter(product => product.categoryId === brandId);
    return res.end(JSON.stringify(productsWithinBrand))
  })

//POST LOGIN
  router.post('/api/login', (req, res) => {
    if (!failedLoginAttempts[req.body.username]){
      failedLoginAttempts[req.body.username] = 0;
    }
    if (req.body.username && req.body.password && failedLoginAttempts[req.body.username] < 3) {
      user = users.find((user)=>{
          return user.login.username == req.body.username && user.login.password == req.body.password;
      });
      if (user) {
      // Reset our counter of failed logins
      failedLoginAttempts[req.body.username] = 0;
      // Write the header because we know we will be returning successful at this point and that the response will be json
      res.writeHead(200, {'Content-Type': 'application/json'});
  
      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });
      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        res.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        res.end(JSON.stringify(newAccessToken.token));
      }
      } else {
        // When a login fails, tell the client in a generic way that either the username or password was wrong
        let numFailedForUser = failedLoginAttempts[req.body.username];
      if (numFailedForUser) {
        failedLoginAttempts[req.body.username]++;
      } else {
        failedLoginAttempts[req.body.username] = 0
      }
      res.writeHead(401, "Invalid username or password");
      res.end();
      }
    } else {
      // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
      res.writeHead(400, "Incorrectly formatted response");
      res.end();
    }
  });

  //GET ME
  router.get('/api/me', (req, res) => {
    if (!user) {
      res.writeHead(401, 'Please log into our services to view your information');
      return res.end();
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(user));
  })

  //GET ME/CART
  router.get('/api/me/cart', (req, res) => {
    if (!user) {
      res.writeHead(401, 'Please log into our services to view your information');
      return res.end();
    }
    let cart = user.cart;
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(cart));
  })
//POST ME/CART
  router.post('/api/me/cart', (req, res) => {
    let cart = user.cart;
    // const count = 1;
    // const item = findObject(id, products);
    let item = Object.assign({}, req.body);
    if (!item) {
      res.writeHead(404, 'No item was selected to add to the cart');
      return res.end();
    }
    res.writeHead(200);
    cart.push(item);
    return res.end(JSON.stringify(cart))
  })
//DELETE ME/CART/:productId
  router.delete('/api/me/cart/:productId', (req, res) => {
    // let cart = me.cart;
    // let { productId } = request.params;
  })

  // function deleteBook(req, res) {
  //   books = books.filter((book=>book.id != req.params.id))
  // //   res.send(true);
  // };
//POST ME/CART/:productId
  router.post('/api/me/cart/:productId', (req, res) => {

  })
module.exports = server;