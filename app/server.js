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

let products = [];

let server = http.createServer( (req, res) => {
  myRouter(req, res, finalHandler(req, res))
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile('/Users/joshuacushing/code/Parsity/evals/sunglasses-io/initial-data/products.json', "utf8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded
    Listening on PORT ${PORT}`);
  });
});

//LOGIN

myRouter.get('/sunglasses', (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" })
  res.send(JSON.stringify(products))
})

module.exports = server;