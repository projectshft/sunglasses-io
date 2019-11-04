var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
var querystring = require("querystring");
var url = require("url");

let brands = [];
let products = [];
let users = [];
let tokens = [];

const JSON_CONTENT_HEADER = { "Content-Type": "application/json" };

const errors = {
  INVALID_BRAND_ID: { code: 404, message: "That brand does not exist" },
  INVALID_USER_PASS: { code: 401, message: "Invalid username and/or Password" },
  MISSING_USERNAME: { code: 400, message: "Missing username" },
  MISSING_PASS: { code: 400, message: "Missing Password" },
  MISSING_USERNAME_PASS: { code: 400, message: "Missing username/Password" }
};

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
  //populate products
  products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
  //populate products
  users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
});

//return brands, no auth necessary
router.get("/v1/brands", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let filteredBrands = [];
  if (query !== undefined) {
    filteredBrands = brands.filter(b =>
      b.name.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    filteredBrands = brands;
  }
  return prepareValidResponse(response, filteredBrands);
});

//return products, no auth necessary
router.get("/v1/products", (request, response) => {
  const parsedUrl = url.parse(request.originalUrl);
  const { query } = querystring.parse(parsedUrl.query);
  let filteredProducts = [];
  if (query !== undefined) {
    filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  } else {
    filteredProducts = products;
  }
  return prepareValidResponse(response, filteredProducts);
});

//return all products that match brandId, no auth necessary
router.get("/v1/brands/:brandId/products", (request, response) => {
  const { brandId } = request.params;
  //check for brand existence first
  const brand = brands.find(brand => brand.id == brandId);
  if (!brand) {
    return prepareErrorResponse(response, errors.INVALID_BRAND_ID);
  }
  //return products (might be none) that match brand categoryId
  const filteredProducts = products.filter(
    product => product.categoryId === brand.id
  );
  return prepareValidResponse(response, filteredProducts);
});

//return all products that match brandId, no auth necessary
router.post("/v1/api/login", (request, response) => {
  const { username, password } = request.body;

  //check for missing/blank username & pass
  if (
    (!username || username.trim() === "") &&
    (!password || password.trim() === "")
  ) {
    return prepareErrorResponse(response, errors.MISSING_USERNAME_PASS);
  } else if (!username || username.trim() === "") {
    return prepareErrorResponse(response, errors.MISSING_USERNAME);
  } else if (!password || password.trim() === "") {
    return prepareErrorResponse(response, errors.MISSING_PASS);
  }

  let user = users.find(
    obj => obj.login.username === username && obj.login.password === password
  );

  if (!user) {
    user = users.find(obj => obj.login.username === username);
    console.log("now  here");
    return prepareErrorResponse(response, errors.INVALID_USER_PASS);
  }

  //find or create access token
  let accessUser = tokens.find(obj => obj.username === username);

  if (accessUser) {
    accessUser.lastUpdate = Date.now();
  } else {
    var uid = require("rand-token").uid;

    accessUser = {
      username,
      accessToken: uid(16),
      lastUpdate: Date.now()
    };

    tokens.push(accessUser);
  }

  //return only the token
  let clonedToken = Object.assign({}, accessUser);
  delete clonedToken.username;
  delete clonedToken.lastUpdate;

  return prepareValidResponse(response, clonedToken);
});

//helper function to send return object back as JSON while setting JSON header
//instead of doing it every single repsonse
let prepareValidResponse = function(response, value) {
  response.writeHead(200, JSON_CONTENT_HEADER);
  if (value !== undefined) {
    return response.end(JSON.stringify(value));
  } else {
    return response.end();
  }
};

//helper function returning specified error object and extracting its code for head
let prepareErrorResponse = function(response, error) {
  response.writeHead(error.code, JSON_CONTENT_HEADER);
  return response.end(JSON.stringify(error));
};

module.exports = server;
