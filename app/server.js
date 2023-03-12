const http = require('http');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const Brand = require('./models/brands');
const Product = require('./modles/products');
//Need other Models-------

const uid = require('rand-token').uid;

const myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer(function(request, response) {
  myRouter(request, response,
  finalHandler(request,response))
}).listen(8080);

//EndPoint handlers
//Get Put Post Delete Edit


module.exports = server;