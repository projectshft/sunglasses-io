const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const Sunglasses = require('./sunglasses.model')

const VALID_API_KEYS = ['xyz', 'abc']

const PORT = 3001;

const state = {
  products: [],
  users: [],
  brands: []
}

async function loadState() {
  try {
    state.products = await Sunglasses.readJSONFile("products.json");
    state.users = await Sunglasses.readJSONFile("users.json");
    state.brands = await Sunglasses.readJSONFile("brands.json");
  } catch(error) {
    console.log("error loading the page:", error)
  }
} ;

Router.use(bodyParser.json()); // parse each req body into js object

http.createServer(async (req, res) => {
  //Each req needs an api key
  if(!VALID_API_KEYS.includes(req.headers['API-Key']) || req.headers['API-Key'] == undefined) {
    res.writeHead(401, "Valid API Key needed");
    res.end();
  };

  // before we start routing the requests that we are receiving, make sure we load the State.
  try {
    await loadState();
  } catch (error) {
    res.writeHead(500, 'Error loading data' + error.message);
    return res.end()
  }

  //req flow through the server callback, then the router
  Router(req, res, finalHandler(req, res)); 

}).listen(PORT);

Router.length('/brands', (req, res) => {
  response.writeHead(200, { "Content-Type": "application/json" });
	return response.end(JSON.stringify(Sunglasses.getAllBrands()));
});

module.exports = {
  server,
  state
}