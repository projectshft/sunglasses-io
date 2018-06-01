const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

const CORS_HEADERS = {
    "Access-Control-Allow-Origin":"*"
  ,"Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"
  };
const PORT = 3001;
const myRouter = Router();

// initial validity constants
const VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const accessTokens = [];
const failedAttempts = []

//write function to check if token has expired
const hasTokenExpired = (user) => {
    const accessToken = accessTokens.find((accessToken) => {
        const timeDiff = (new Date) - accessToken.lastUpdated

        return (accessToken.token == user.login.uid && timeDiff < TOKEN_VALIDITY_TIMEOUT)
    })
    return accessToken
}
//write function to check if token has expired
const hasFailedAttemptsExpired = (user) => {
    // TODO:
}

// initialize data variables
let brands;
let products;
let users;

http.createServer(function (request, response) {
// handle initial OPTIONS request
    if (request.method === 'OPTIONS'){
        response.writeHead(200, CORS_HEADERS);
        response.end(200);
        }
// create execution of router
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
// create listening for errors
    if (error) {
        return console.log('Error on Server Startup: ', error)
      }
    
// read brands.json data and store it in variable on server
    fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });

// read products.json data and store it in variable on server
    fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });

// read users.json data and store it in variable on server
    fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
})

//create handler for GET api/brands 
myRouter.get('/api/brands', function(request,response) {
    response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
    // return each brand
    response.end(JSON.stringify(brands));
    
});
//create handler for GET api/brands/:id/products
myRouter.get('/api/brands/:id/products', function(request,response) {
    //find target brand
    const targetBrand = brands.find((brand)=>{
        return brand.id == request.params.id
    })
    // find products associated with target brand
    const targetProducts = products.filter(product => product.categoryId == targetBrand.id)

    // return products associated with target brand
    response.end(JSON.stringify(targetProducts));
});

//create handler for GET api/products
myRouter.get('/api/products', function(request,response) {
    response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
    // TODO: return products via a query search to return glasses by name

    // or if no query, return all products
    response.end(JSON.stringify(products));
});

//create handler for GET api/me/
myRouter.get('/api/me', function(request,response) {
    // TODO: return user non-sensitive information

});

//create handler for GET api/me/cart
myRouter.get('/api/me/cart', function(request,response) {
    // TODO: return user's cart

});

//create handler for POST api/me/cart
myRouter.get('/api/me/cart', function(request,response) {
    // TODO: add product to users cart

});

//create handler for POST api/me/cart/:productId
myRouter.post('/api/me/cart/:productId', function(request,response) {
    // TODO: update amount of product in user cart

});

//create handler for DELETE api/me/cart/:productId
myRouter.delete('/api/me/cart/:productId', function(request,response) {
    // TODO: delete product from user cart

});

//create handler for POST api/login
myRouter.post('/api/login', function(request,response) {
    // TODO: verify username and password with known users

    // TODO: set variable with value user

    // TODO: create login token for user

    // TODO: add token to list of accessTokens

    // TODO: if password fails, keep track of failed attempts

    // TODO: if failed attempts is more than 3, block user



});
