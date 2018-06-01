const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

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
//create execution of router
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
//create listening for errors
    if (error) {
        return console.log('Error on Server Startup: ', error)
      }
    
//read brands.json data and store it in variable on server
    fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });

//read products.json data and store it in variable on server
    fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });

//read users.json data and store it in variable on server
    fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });

})

//create handler for GET api/brands 
myRouter.get('/api/brands', function(request,response) {
    // return each brand

});
//create handler for GET api/brands/:id/products
myRouter.get('/api/brands', function(request,response) {
    // return products associated with target brand

});

//create handler for GET api/products
myRouter.get('/api/products', function(request,response) {
    // return products via a query search to return glasses by name

    // or if no query, return all products
});

//create handler for GET api/me/
myRouter.get('/api/me', function(request,response) {
    // return user non-sensitive information

});

//create handler for GET api/me/cart
myRouter.get('/api/me/cart', function(request,response) {
    // return user's cart

});

//create handler for POST api/me/cart
myRouter.get('/api/me/cart', function(request,response) {
    // add product to users cart

});

//create handler for POST api/me/cart/:productId
myRouter.post('/api/me/cart/:productId', function(request,response) {
    // update amount of product in user cart

});

//create handler for DELETE api/me/cart/:productId
myRouter.delete('/api/me/cart/:productId', function(request,response) {
    // delete product from user cart

});

//create handler for POST api/login
myRouter.post('/api/login', function(request,response) {
    // verify username and password with known users

    // set variable with value user

    // create login token for user

    // add token to list of accessTokens

    // if password fails, keep track of failed attempts

    // if failed attempts is more than 3, block user



});
