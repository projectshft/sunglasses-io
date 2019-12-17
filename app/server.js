var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;


const PORT = 3001;
let brands = [];
let users = [];
let user = {};
let accessTokens = [];
let products = [];

var myRouter = Router();
myRouter.use(bodyParser.json());

//Server Data Setup and Router
const server = module.exports = http.createServer( (request, response) => {
    myRouter(request, response, finalHandler(request, response))
})
.listen(PORT,error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    //brands = JSON.parse(fs.readFile('initial-data/brands.json','utf-8'));
    
    fs.readFile('initial-data/brands.json','utf-8', (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });
    //users = JSON.parse(fs.readFileSync('initial-data/users.json','utf-8'));
    
    fs.readFile('initial-data/users.json','utf-8', (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        user = users[0];
        console.log(`Server setup: ${users.length} users loaded`);
    });

    
    // products = JSON.parse(fs.readFileSync('initial-data/products.json','utf-8'));
    
    fs.readFile('initial-data/products.json','utf-8', (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
});

myRouter.get('/api/brands', (request,response) => {
//should return all brands in database
    console.log(request.params);
    response.writeHead(200,{'Content-Type': 'application/json'});
    return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', (request,response) => {
//should return all products of a certain brand
    console.log(request.params)
    const brandId = request.params.id;
    const brand = brands.find(b=> b.id == brandId);
    console.log(brand);
    if (!brand) {
      console.log('brand id:',brand);
        response.writeHead(404, "That brand does not exist");
        return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    const productsOfBrand = products.filter(
        p => p.categoryId == brandId
    );
    return response.end(JSON.stringify(productsOfBrand))
        
});

myRouter.get('/api/products', (request,response)=>{
//should return all products
console.log(request.params);
    response.writeHead(200,{'Content-Type': 'application/json'});
    return response.end(JSON.stringify(products));
});

myRouter.post('/api/login', (request,response)=>{
//authentication
if (!failedLoginAttempts[request.body.username]){
    failedLoginAttempts[request.body.username] = 0;
  }
  if (request.body.username && request.body.password && failedLoginAttempts[request.body.username] < 3) {
      let user = users.find((user)=>{
          return user.login.username == request.body.username && user.login.password == request.body.password;
      });
      if (user) {
        // Reset our counter of failed logins
        failedLoginAttempts[request.body.username] = 0;
        response.writeHead(200);

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find((currentAccessToken) => {
        return currentAccessToken.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentAccessToken.token));
      } 
      else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        }
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } 
    else {
      let numFailedForUser = failedLoginAttempts[request.body.username];
      if (numFailedForUser) {
        failedLoginAttempts[request.body.username]++;
      } 
      else {
        failedLoginAttempts[request.body.username] = 1
      }
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } 
  else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }   
});

myRouter.get('/api/me/cart', (request,response)=>{
//cart content of authenticated user    
});

myRouter.post('/api/me/cart', (request,response)=>{
//add item(s) to cart of authenticated user    
});

myRouter.delete('/api/me/cart/:productId', (request,response)=>{
//removes item(s) from cart    
});

myRouter.post('/api/me/cart/productId', (request,response)=>{
//update quantity of item(s) in cart 
});