var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var accessTokens = [];
const PORT = 3001;
var brands = [];
var products = [];
var users = {};

fs.readFile("./initial-data/brands.json", 'utf8', (err, data) => {
    if (err) throw err;
    brands = JSON.parse(data);
  });
  
  fs.readFile("./initial-data/products.json", 'utf8', (err, data) => {
    if (err) throw err;
    products = JSON.parse(data);
  });
  
  fs.readFile("./initial-data/users.json", 'utf8', (err, data) => {
    if (err) throw err;
    users = JSON.parse(data);
  });

var myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT);

myRouter.get('/api/brands', function(request, response){
    response.writeHead(200, {'Context-Type':'application/json'});
    response.end(JSON.stringify(brands));
});

myRouter.get('/api/products', function(request, response){
    response.writeHead(200, {'Context-Type':'application/json'});
    response.end(JSON.stringify(products));
});

myRouter.get('/api/me/cart', function(request, response){
    response.writeHead(200, {'Context-Type':'application/json'});
    response.end(JSON.stringify(users[0].cart));
});

myRouter.get('/api/brands/:brandId/products', function(request, response){
    response.writeHead(200, {'Context-Type':'application/json'});
    brandProducts = brands.find( brand => brand.id === request.params.brandId);
    if (!brandProducts) {
        response.statusCode = 400;
        return response.end("No product with that brand was found.");    
   }
    const productsByBrand = products.filter( product => {
     return product.categoryId === request.params.brandId;
   });
   response.writeHead(200, 'List of products for a given brand');
   response.end(JSON.stringify(productsByBrand));
  });

myRouter.post('/api/login', function(request, response){
    if (request.body.username && request.body.password) {
        let user = users.find((user)=> {
            return user.login.username == request.body.username && user.login.password == request.body.password;
        });
    if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.end(JSON.stringify(currentAccessToken.token));
    } else {
        let newAccessToken = {
            username: user.login.username,
            lastUpdated: new Date(),
            token: uid(16)
            }
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify(newAccessToken.token));
     }
    } else {
          response.writeHead(401, "Invalid username or password");
          response.end();
    }
});

myRouter.post('/api/me/cart', function(request, response) {
    let selectedBody = request.body.id;
    if (users[0].cart = []) {
        response.writeHead(404, "No products have been selected.");
    } else {
    users[0].cart.push(request.selectedBody);
    response.end();
    }
})

myRouter.post('/api/me/cart/:productId', function(request, response){
    let product = products.find((id)=> {
        return product.id == request.params.productId
    })
    user[0].cart.push(productId)
    response.end();
});

myRouter.delete('/api/me/cart/:productId', function(request, response){
    let product = products.find((id)=> {
        return product.id == request.params.productId
    })
    user[0].cart.splice(user.cart[request.params.productId], 1)
    response.end();
})