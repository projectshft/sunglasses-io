var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
// to parse req bodies
var bodyParser = require('body-parser');
// to generate access tokens
var uid = require('rand-token').uid;

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

// State holding variables
const PORT = 3001;
let brands = [];
let products = [];
let users = [];
const accessTokens = [
  { username: 'lazywolf342', password: 'tucker' }
];

chai.request('http://localhost:3001');
should = chai.should();
chai.use(chaiHttp);  

// Server
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

// Setup Router
let myRouter = Router();
myRouter.use(bodyParser.json());

server.listen(PORT, err => {
  if (err) throw err;
  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));
  users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
});


// test 1 (passing)
myRouter.get('/api/brands', (req, res) => {
  if(!brands) {
    res.writeHead(404, 'doesnt match any sunglass brands');
    return res.end();
  } else {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(brands));
  }
})

//test 2 (passing)
myRouter.get("/api/products", function (req, res) {
  if(!products) {
    res.writeHead(404, 'did not match any products');
    return res.end();
  } else {
  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(products));
  }
});

//test 3 (passing)
myRouter.get('/api/brands/:id/products', (req, res) => {
  let returnProducts = products.filter(
    (product) => product.categoryId === req.params.id
  );
  if (returnProducts.length === 0) {
    res.writeHead(404, 'does not match any brands');
    return res.end();
  } else {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(returnProducts));
}});

//test 4 (passing)

myRouter.post('/api/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    const currentUser = users.find(
      (currentUser) =>  currentUser.login.username === username && currentUser.login.password === password
    );

    if (currentUser) {
      res.writeHead(200, { 'Content-Type': 'Application/json' });

      const currentAccessToken = accessTokens.find(
        (token) => token.username === username
      );

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return res.end(JSON.stringify(currentAccessToken.token));
      }
      const addAccessToken = {
        username,
        token: uid(16),
      };
      accessTokens.push(addAccessToken);
      return res.end(JSON.stringify(addAccessToken.token));
    }
    res.writeHead(401, 'incorrect username or password');
    return res.end();
  }
  res.writeHead(400, 'invalid request');
  return res.end();
});

// test 5







module.exports = server;