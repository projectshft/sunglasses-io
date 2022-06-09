var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
let Products = require('./models/products');
let Brands = require('./models/brands');


const PORT = 3001;

let products = [];
let brands = [];
let users = [];
let accessTokens = [{username: 'lazywolf342', lastUpdated: Infinity, token: '4923292892791171'}, {username: 'yellowleopard753', lastUpdated: Infinity, token: '9720471039174304'}];

const router = Router();
router.use(bodyParser.json());

const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};

const TOKEN_VALIDITY_TIMEOUT = 30 * 60 * 1000; 

const getValidTokenFromRequest = function(request) {
    const parsedUrl = require('url').parse(request.url, true);
    if (parsedUrl.query.token) {
      let currentAccessToken = accessTokens.find((accessToken) => {
        let tokenExists = accessToken.token == parsedUrl.query.token;
        let tokenHasntExpired = ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
        return tokenExists && tokenHasntExpired;
      });
  
    if (currentAccessToken) {
        return currentAccessToken;
      } else {
        return null;
      }
    } else {
        return null;
    }
};


let server = http.createServer(function (request, response) {
    if(request.method === 'OPTIONS') {
        response.writeHead(200, CORS_HEADERS);
        return response.end();
    }
    router(request, response, finalHandler(request, response));
}).listen(PORT, error => {
    if(error) {
        return console.log(`Error on Server Startup`, error);
    }

    fs.readFile("initial-data/products.json", (error, data) => {
        if(error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });

    fs.readFile("initial-data/brands.json", (error, data) => {
        if(error) throw error;
        brands = JSON.parse(data);
        console.log(`Server set up: ${brands.length} brands loaded`);
    });

    fs.readFile("initial-data/users.json", (error, data) => {
        if(error) throw error;
        users = JSON.parse(data);
        users[0].cart = [{...products[0], count: 2}]
        console.log(`Server set up: ${users.length} users loaded`);
    });
});

router.get('/brands', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"},  CORS_HEADERS);
    return response.end(JSON.stringify(Brands.getAll(brands)));
});

router.get('/brands/:id/products', function(request, response) {
    if(request.params.id < brands.length) {
        response.writeHead(200, {"Content-Type": "application/json"}, CORS_HEADERS);
        return response.end(JSON.stringify(Brands.getProductsByBrandID(request.params.id, products)));
    } else {
        response.writeHead(404);
        return response.end('Brand not found');
    }
});

router.get('/products', function(request, response) {
    response.writeHead(200, {"Content-Type": "application/json"}, CORS_HEADERS);
    return response.end(JSON.stringify(Products.getAll(products)));
});

router.post('/login', function(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    if(request.body.username && request.body.password) {
        let user = users.find(user => user.login.password === password && user.login.username === username);
        if(user) {
            response.writeHead(200, {'Content-Type': 'application/json'});
            let currentAccessToken = accessTokens.find((tokenObject) => {
                return tokenObject.username === username;
            });

            if(currentAccessToken) {
                currentAccessToken.lastUpdated = new Date();
                return response.end(JSON.stringify(currentAccessToken.token));
            } else {
                let newAccessToken = {
                    username: username,
                    lastUpdated: new Date(),
                    token: uid(16)
                }
                accessTokens.push(newAccessToken);
                return response.end(JSON.stringify(newAccessToken.token));
            }
        } else {
            response.writeHead(401, "Invalid username or password");
            return response.end();
        }
    } else {
        response.writeHead(400, "Username and password are required");
        return response.end();
    }
});

router.get('/me/cart', function(request, response) {
    let foundToken = getValidTokenFromRequest(request);
    if(!foundToken) {
        response.writeHead(401, 'You have to be logged in to continue');
        return response.end();
    }
    let username = foundToken.username;
    let loggedInUser = users.find(user => user.login.username === username);
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(loggedInUser.cart));
});

router.post('/me/cart', function(request, response) {
    let foundToken = getValidTokenFromRequest(request);
    if(!foundToken) {
        response.writeHead(401, 'You have to be logged in to continue');
        return response.end();
    }
    let username = foundToken.username;
    let loggedInUser = users.find(user => user.login.username === username);
    let addedItemIndex = loggedInUser.cart.findIndex(item => item.id === request.body.id);
    let newCart = loggedInUser.cart.slice();
    if(addedItemIndex > -1) {
        newCart[addedItemIndex].count++
    } else {
        newCart.push({...request.body, count: 1});
        addedItemIndex = newCart.length - 1;
    }
    users = users.map(user => {
        if(user.login.username === loggedInUser.username) {
            user.cart = newCart;
        } 
        return user;
    });
    response.writeHead(200, {'Content-Type': 'application/json'});
    return response.end(JSON.stringify(newCart[addedItemIndex]));
});

router.delete('/me/cart/:productId', function(request, response) {
    let foundToken = getValidTokenFromRequest(request);
    if(!foundToken) {
        response.writeHead(401, 'You have to be logged in to continue');
        return response.end();
    }
    let username = foundToken.username;
    let loggedInUser = users.find(user => user.login.username === username);
    let addedItemIndex = loggedInUser.cart.findIndex(item => item.id === request.params.productId);
    let newCart = loggedInUser.cart.slice();
    if(addedItemIndex > -1) {
        newCart.splice(addedItemIndex, 1);
        users = users.map(user => {
            if(user.login.username === loggedInUser.username) {
                user.cart = newCart;
            } 
            return user;
        });
        response.writeHead(200, {'Content-Type': 'application/json'});
        return response.end(JSON.stringify(newCart));
    } else {
        response.writeHead(404, 'The item to be deleted is not in the cart');
        return response.end();
    }
});

router.post('/me/cart/:productId', function(request, response) {
    let foundToken = getValidTokenFromRequest(request);
    if(!foundToken) {
        response.writeHead(401, 'You have to be logged in to continue');
        return response.end();
    }
    let username = foundToken.username;
    let loggedInUser = users.find(user => user.login.username === username);
    let updatedItemIndex = loggedInUser.cart.findIndex(item => item.id === request.params.productId);
    let newCart = loggedInUser.cart.slice();
    if(updatedItemIndex > -1) {
        let countChange = request.body.action === 'increment' ? 1 : -1;
        newCart[updatedItemIndex].count += countChange;
        users = users.map(user => {
            if(user.login.username === loggedInUser.username) {
                user.cart = newCart;
            }
            return user;
        });
        response.writeHead(200, {'Content-Type': 'application/json'});
        return response.end(JSON.stringify(newCart));
    } else {
        response.writeHead(404, 'Item not found');
        return response.end();
    }
});


module.exports = server;