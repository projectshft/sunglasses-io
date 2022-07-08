const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;


const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

let server = http.createServer( (request, response) => {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

//LOGIN

myRouter.get('/sunglasses', (req, res) => {
  res.writeHead(200)
  res.end()
})

module.exports = server;