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

const PORT = process.env.PORT || 3005;

//State holding variables
let brands = [];
let products = [];
let users = [];
let user = {};

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
  // console.log(brands)
  // console.log(brands.length);
  // fs.readFile("./initial-data/brands.json", 'utf-8', (err, data) => {
  //   if (err) throw err;
  //   brands = JSON.parse(data);
  // });

  //populate products
  products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf8'));
  // fs.readFile('./initial-data/products.json', 'utf-8', (err, data) => {
  //   if (err) throw err;
  //   products = JSON.parse(data);
  // });

  //populate users
  users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
  // fs.readFile('./initial-data/users.json', 'utf-8', (err, data) => {
  //   if (err) throw err;
  //   users = JSON.parse(data);
  let user = users[0];
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
      brandsToReturn = brands.filter(brand => brand.name.includes(query))
      if (!brandsToReturn) {
        res.writeHead(404, `ERROR: PRODUCT DOES NOT EXIST`);
        res.end();
      }
        brandsToReturn = brands;
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(brands))
  });
//REMEMBER ACCESS FOR SWAGGER DOCUMENTATION
//SECURITY DEFINITIONS

module.exports = server;