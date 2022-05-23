var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
const Router = require('router')
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

let brands = [];
let products = [];
let users = [];

var myRouter = Router();

myRouter.use(bodyParser.json())

const PORT = 3001;

const server = http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  }

  fs.readFile('initial-data/brands.json', 'utf8', (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded`);
  });
  
  fs.readFile('initial-data/users.json', 'utf8', (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server setup: ${users.length} users loaded`);
  });

  fs.readFile('initial-data/products.json', 'utf8', (err, data) => {
    if (error) throw error;
    products = JSON.parse(data)
    console.log(`Server setup: ${products.length} products loaded`)
  })

  console.log(`Server is listening on ${PORT}`);
});;

// GET all products
myRouter.get('/api/products', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(products));
});

// GET all brands
myRouter.get('/api/brands', (request, response) => {
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brands));
})

// GET products by brand id 
myRouter.get('/api/brands/:id/products', (request, response) => {
  const { id } = request.params
  if(!id) {
    response.writeHead(404, 'Brand not found');
    response.end()
  }
  let productsToReturn = products.filter(product => product.categoryId == id)
  response.writeHead(200, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(productsToReturn))
})

// POST login
myRouter.post("/api/login", (request, response) => {
	const userLogin = queryString.parse(request._parsedUrl.query)

  if(userLogin.username && userLogin.password) {
    let user = users.find((user) => {
      return user.login.username === userLogin.username && user.login.password === userLogin.password;
    })

    if(user) {
      if(users.find(user => user.currentUser === true)){
        const otherUser = users.find(user => user.currentUser === true);
        otherUser.currentUser = false;
        user.currentUser = true;
      }
      user.currentUser = true;
      response.writeHead(200, { 'Content-Type': 'text/plain' })
      return response.end(`successfully logged in ${user.login.username}`)
    } else {
      response.writeHead(401, 'Invalid username or password')
      return response.end();
    }
  } else {
    response.writeHead(400, 'Incorrectly formatted response')
    return response.end();
  }
});

// GET current user's cart
myRouter.get('/api/me/cart', (request, response) => {
  const currentUser = users.find(user => user.currentUser == true)
  if(!currentUser){
    response.writeHead(401, 'Please Login')
    response.end();
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(currentUser.cart))
})

module.exports = server;
