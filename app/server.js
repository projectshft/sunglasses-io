var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const contentTypeJSON = {'Content-Type': 'application/json'}

//variables to act as a 'database'
let sunglasses = [];
let categories = [];
let user = [] //also may be the cart, unsure just yet

//read the files so I actually have data to work with

fs.readFile('./initial-data/products.json', 'utf-8', (error, data) => {
  if(error) throw error;
  sunglasses = JSON.parse(data)
});

fs.readFile('./initial-data/brands.json', 'utf-8', (error, data) => {
  if (error) throw error;
  categories = JSON.parse(data)
})
fs.readFile("./initial-data/users.json", "utf-8", (error, data) => {
  if (error) throw error;
  users = JSON.parse(data);
});

//set up the router

const PORT = 3001;

const myRouter = Router();
myRouter.use(bodyParser.json());

// This function is a bit simpler...
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, error => {

  console.log(`Running on port ${PORT}`);
});

myRouter.get('/', (req,res) => {
  res.end("hi")
})

myRouter.get('/v1/sunglasses', (req, res) => {
  res.writeHead(200, contentTypeJSON)
  res.end(JSON.stringify(sunglasses))  
})

myRouter.get('/v1/sunglasses/:id', (req,res) => {
  let { id } = req.params
  let product = sunglasses.find(products => {
    return products.id == id
  })
  if(product){
    res.writeHead(200, contentTypeJSON);
    res.end(JSON.stringify(product))
  } else {
    res.writeHead(404, 'Sorry, no product was found matching that ID')
    res.end()
  }  
})

myRouter.get('/v1/categories', (req,res) => {
  res.writeHead(200, contentTypeJSON);
  res.end(JSON.stringify(categories))
})
myRouter.get('/v1/categories/:id', (req,res) => {
  let { id } = req.params
  let category = categories.find(catObjs => catObjs.id === id)
  if(!category){
    res.writeHead(404 ,'The requested resource does not exist')
    res.end()
  } else {
    res.writeHead(200, contentTypeJSON)
    res.end(JSON.stringify(category))
  }
})

myRouter.get('/v1/categories/:id/products', (req, res) => {
  let { id } = req.params
  //to ensure it is a valid category
  let category = categories.find(catObjs => catObjs.id === id)
  if(!category){
    res.writeHead(404, 'The requested resource does not exist')
    res.end()
  }
  let filteredGlasses = sunglasses.filter(sunglasses => sunglasses.categoryId === id);
  if(filteredGlasses.length === 0 ){
    res.writeHead(200, "There are no sunglasses currently for that brand", contentTypeJSON)
    res.end(JSON.stringify(filteredGlasses))
  }
  res.writeHead(200, contentTypeJSON)
  res.end(JSON.stringify(filteredGlasses))

})

module.exports = server;