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

const products = [];

let server = http.createServer( (request, response) => {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile('../initial-data/products.json', "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} stores loaded`);
  });
});

//LOGIN

myRouter.get('/sunglasses', (req, res) => {
  res.writeHead(200)
  res.end()
})

module.exports = server;