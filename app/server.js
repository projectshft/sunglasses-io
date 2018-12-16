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

//make 400 404 and 401 Error

//taken from the util.js file in the goalworthy server
const findObject = (objId, state) => {
  const item = state.find(obj => obj.id === objId);
  return !item ? null : item;
};

const PORT = process.env.PORT || 3005;

//State holding variables
let brands = [];
let products = [];
let users = [];
let me = {};
let otherUser = {};

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
  //log the port that the server is running to confirm operation
  console.log(`Server running on ${PORT}`);
  //populate brands
   brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));

  //populate products
  products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf8'));

  //populate users
  users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
  //declare a variable to represent the current user ('me')
  me = users[0];
  otherUser = users[1];
  // });
});

  //GET Brands Endpoint
  router.get("/v1/brands", (req, res) => {
    const parsedUrl = url.parse(req.originalUrl);
    const { query } = queryString.parse(parsedUrl.query);
    let brandsToReturn = [];
    //if there is an empty query all brands should be returned otherwise
    //the brand returned should be the query in question
    if (query !== undefined) {
      brandsToReturn = brands.filter(brand => brand.name === query)

      if (!brandsToReturn) {
        res.writeHead(404, `ERROR: Brand not found!`);
        return res.end();
      }
    } else { 
      brandsToReturn = brands;
        // res.writeHead(200, {'Content-Type': 'application/json'});
        // return res.end(JSON.stringify(brandsToReturn))
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(brandsToReturn))
  });

  //GET PRODUCTS ENDPOINT
  router.get('/v1/products', (req, res) => {
    const parsedUrl = url.parse(req.originalUrl);
    const { query } = queryString.parse(parsedUrl.query);
    let productsToReturn = []; //empty search query shows up empty
    if (query !== undefined) {
      //see comment in server.test.js file and YAML documentation for explanation 
      //for choosing to limit queries by description as opposed to name or other property
      productsToReturn = products.filter(product => product.description.includes(query));

      if (!productsToReturn) {
        res.writeHead(404, 'ERROR: Product Not Found!');
        return res.end();
      }
    } else {
      productsToReturn = products;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(productsToReturn))
  })
  //REMEMBER ACCESS FOR SWAGGER DOCUMENTATION
  //SECURITY DEFINITIONS

  //GET PRODUCTS WITHIN BRANDS
  router.get('/v1/brands/:brandId/products', (req, res) => {
    const { brandId } = req.params;
    const brand = findObject(brandId, brands);
    if (!brand) {
      res.writeHead(404, 'ERROR: Brand Not Found!');
      return res.end();
    }
    res.writeHead(200, { 'Content-Type': 'application/json'});
    const productsWithinBrand = products.filter(product => product.categoryId === brandId);
    return res.end(JSON.stringify(productsWithinBrand))
  })
//POST LOGIN

  //GET ME
  router.get('/v1/me', (req, res) => {
    if (!me) {
      res.writeHead(404, 'User does not exist. Please make an account');
      return res.end();
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(me));
  })

  //GET ME/CART
  router.get('/v1/me/cart', (req, res) => {
    cart = me.cart;
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(cart));
  })
//POST ME/CART
  router.post('/v1/me/cart', (req, res) => {
    cart = me.cart;
    const { id } = request.params;
    const item = findObject(id, products);
    //if user is not logged in
    if (!me) {
      res.writeHead(404, 'Please log into our system!');
    return res.end();
    }
    res.user.writeHead(200);
    cart.push(item);
    return res.end(JSON.stringify(cart))
  })
//DELETE ME/CART/:productId
  router.delete('/v1/me/cart/:productId', (req, res) => {

  })
//POST ME/CART/:productId
  router.post('/v1/me/cart/:productId', (req, res) => {

  })
module.exports = server;