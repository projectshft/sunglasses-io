const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router')
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const Sunglasses = require('./sunglasses.model')
const Reader = require('./reader.model')

const VALID_API_KEYS = ['xyz', 'abc']

const PORT = 3001;

const myRouter = Router();

const state = {
  products: [],
  users: [],
  brands: []
}

async function loadState() {
  try {
    state.products = await Reader.readJSONFile("./initial-data/products.json");
    state.users = await Reader.readJSONFile("./initial-data/users.json");
    state.brands = await Reader.readJSONFile("./initial-data/brands.json");
  } catch(error) {
    console.log("error loading the page:", error)
  }
} ;

myRouter.use(bodyParser.json()); // parse each req body into js object

let server = http.createServer(async (req, res) => {

  if(!VALID_API_KEYS.includes(req.headers['api-key']) || req.headers['api-key'] == undefined) {
    console.log('apikey', req.headers)
    res.writeHead(401, "Valid API Key needed");
    res.end();
  };

  try {
    await loadState();
  } catch (error) {
    res.writeHead(500, 'Error loading data' + error.message);
    return res.end();
  }

  Sunglasses.setState(state);

  myRouter(req, res, finalHandler(req, res)); 

}).listen(PORT);

myRouter.get('/brands', (req, res) => {
  const brands = Sunglasses.getAllBrands();
  
  res.writeHead(200, { "Content-Type": "application/json" });
	return res.end(JSON.stringify(brands));
});


module.exports = {
  server
}