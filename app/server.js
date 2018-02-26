var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const VALID_API_KEYS = ["476b2e40-57d1-462c-a80e-37a778bfa335", "d1e9a4f4-7b40-4e69-b53e-d9b1f71714b3"];
const CORS_HEADERS = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication"};
const PORT = 3001;

// Container arrays for API information
var brands = [];
var products = [];
var users = [];
var accessTokens = [];
var failedLoginAttempts = {};

const myRouter = Router();
myRouter.use(bodyParser.json());

// Helper method to process access token
var getValidTokenFromRequest = (request) => {
    var parsedUrl = require('url').parse(request.url, true);
    const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    if (parsedUrl.query.accessToken) {
        // Verify the access token to make sure it's valid and not expired
        let currentAccessToken = accessTokens.find((accessToken) => {
            return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
        });
        if (currentAccessToken) {
            return currentAccessToken;
        } else {
            return null;
        }
    } else {
        return null;
    }
}

http.createServer(function (request, response) {
    if (request.method === 'OPTIONS') {
        response.writeHead(200, CORS_HEADERS);
        response.end();
    }
myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
    if (error) {
        return console.log('Error on Server Startup: ', error)
    }
    fs.readFile('./initial-data/brands.json', 'utf8', (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile('./initial-data/products.json', 'utf8', (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    fs.readFile('./initial-data/users.json', 'utf8', (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
});

// API call for all brands
myRouter.get('/api/brands', (request, response) => {
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    }
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    response.end(JSON.stringify(brands));
});

// API call for products specified by associated brand
myRouter.get('/api/brands/:id/products', (request, response) => {
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    }
    let productsByBrand = products.filter((product) => {
        return product.categoryId == request.params.id;
    });
    response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
    response.end(JSON.stringify(productsByBrand));
})

// API call for all products
myRouter.get('/api/products', (request, response) => {
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    } else {
        response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type':'application/json'}));
        // User can search for products by product's name
        var parsedUrl = require('url').parse(request.url,true);
        if (parsedUrl.query.search) {
            let searchedProducts = products.filter((product) => {
                if (product.name.toUpperCase().includes(parsedUrl.query.search.toUpperCase())) {
                    return product.name;
                };
            });
            response.end(JSON.stringify(searchedProducts));
        } else {
            response.end(JSON.stringify(products));
        };
    };
});

// User login
myRouter.post('/api/login', (request, response) => {
    if (!failedLoginAttempts[request.body.username]) {
        failedLoginAttempts[request.body.username] = 0;
    };
    // Make sure there is a username and password in the request
    if (request.body.username && request.body.password && failedLoginAttempts[request.body.username] < 3) {
        // See if there is a user that has that username and password
        let user = users.find((user) => {
            return user.login.username == request.body.username && user.login.password == request.body.password;
        });
        if (user) {
            // Reset our count of failed logins
            failedLoginAttempts[request.body.username] = 0;
            response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type':'application/json'}));
            let currentAccessToken = accessTokens.find((tokenObject) => {
                return tokenObject.username == user.login.username;
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
            failedLoginAttempts[request.body.username]++;
            response.writeHead(401, "Invalid username or password", CORS_HEADERS);
            response.end();
        }
    } else {
        if (request.body.username && request.body.password) {
            response.writeHead(401, "Too many failed login attempts", CORS_HEADERS);
            response.end();
        } else {
            response.writeHead(400, "Incorrectly formatted response", CORS_HEADERS);
            response.end();
        }
    }
});

myRouter.get('/api/me/cart', (request, response) => {
   let currentAccessToken = getValidTokenFromRequest(request);
   if (currentAccessToken) {
       let user = users.find((user) => {
           return user.login.username == currentAccessToken.username;
       });
       if (user.cart.length > 0) {
           response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
           response.end(JSON.stringify(user.cart));
       } else {
           response.writeHead(404, "Your cart is empty", CORS_HEADERS);
           response.end();
       }
   } else {
       response.writeHead(401, "You must be logged in to continue", CORS_HEADERS);
       response.end();
   }
});

myRouter.post('/api/me/cart', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (currentAccessToken) {
        let user = users.find((user) => {
            return user.login.username == currentAccessToken.username;
        });
        if (user.cart.length > 0) {
            user.cart.forEach((product) => {
                user.purchasedCart.push(product);
            });
            user.cart = [];
            response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
            response.end(JSON.stringify(user.purchasedCart));
        } else {
            response.writeHead(404, "Your cart is empty", CORS_HEADERS);
            response.end();
        }
    } else {
        response.writeHead(401, "You must be logged in to continue", CORS_HEADERS);
        response.end();
    }
});

myRouter.delete('/api/me/cart/:id', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (currentAccessToken) {
        let product = products.find((product) => {
            return product.id == request.params.id;
        });
        if (product) {
            let user = users.find((user) => {
                return user.login.username == currentAccessToken.username;
            });
            if (user.cart.includes(product)) {
                const index = user.cart.indexOf(product);
                if (user.cart[index].amount == 1) {
                    user.cart.splice(index, 1);
                } else {
                    user.cart[index].amount--;
                };
                response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
                response.end(JSON.stringify(user.cart));
            } else {
                response.writeHead(404, "That product cannot be found in your cart", CORS_HEADERS);
                response.end();
            }
        } else {
            response.writeHead(404, "That product cannot be found", CORS_HEADERS);
            response.end();
        }
    } else {
        response.writeHead(401, "You must be logged in to continue", CORS_HEADERS);
        response.end();
    }
});

myRouter.post('/api/me/cart/:id', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request);
    if (currentAccessToken) {
        let product = products.find((product) => {
            return product.id == request.params.id;
        });
        if (product) {
            let user = users.find((user) => {
                return user.login.username == currentAccessToken.username;
            });
            if (!user.cart.includes(product)) {
                product.amount = 1;
                user.cart.push(product);
            } else {
                let index = user.cart.indexOf(product);
                user.cart[index].amount++;
            }
            response.writeHead(200, Object.assign(CORS_HEADERS, {'Content-Type': 'application/json'}));
            response.end(JSON.stringify(product));
        } else {
            response.writeHead(404, "That product cannot be found", CORS_HEADERS);
            response.end();
        }
    } else {
        response.writeHead(401, "You must be logged in to continue", CORS_HEADERS);
        response.end();
    }
});