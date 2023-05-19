const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router')
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const Sunglasses = require('./sunglasses.model')

const VALID_API_KEYS = ['xyz', 'abc']

const PORT = 3001;

const myRouter = Router();

const state = {
  products: [],
  users: [],
  brands: []
}

myRouter.use(bodyParser.json());

let server = http.createServer(async (req, res) => {
  
  if(!VALID_API_KEYS.includes(req.headers['api-key']) || req.headers['api-key'] == undefined) {
    console.log('apikey', req.headers)
    res.writeHead(401, "Valid API Key needed")
    res.end();
  };

  myRouter(req, res, finalHandler(req, res)); 

}).listen(PORT);

myRouter.get('/brands', (req, res) => {
  const brands = Sunglasses.getAllBrands(state);

  if(brands.length === 0) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(brands));
  }
  
  res.writeHead(200, { "Content-Type": "application/json" });
	return res.end(JSON.stringify(brands));
});


module.exports = {
  server
}