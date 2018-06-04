var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

var brands = [];
var products = [];
var users = [];
var accessTokens = [];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

http.createServer(function (request, response) {
    if (request.url.includes('api')) {
        myRouter(request, response, finalHandler(request, response))
    } else {
        serve(request, response, finalHandler(request, response))
    }

}).listen(PORT);

//Reading in the data files
fs.readFile("initial-data/brands.json", "utf8", function (err, data) {
    if (err) {
        throw err;
    }
    brands = JSON.parse(data);
});
fs.readFile("initial-data/products.json", "utf8", function (err, data) {
    if (err) {
        throw err;
    }
    products = JSON.parse(data);
});
fs.readFile("initial-data/users.json", "utf8", function (err, data) {
    if (err) {
        throw err;
    }
    users = JSON.parse(data);
});

// Helper method to process access token
var getValidTokenFromRequest = function (request) {
    var currentAccessToken = accessTokens.find(function (token) {
        return token.token == request.headers["authorization"];
    })
    if (currentAccessToken) {
        if (((new Date) - currentAccessToken.lastUpdated) > TOKEN_VALIDITY_TIMEOUT) {
            return null;
        }
        return currentAccessToken;
    } else {
        return null;
    }
};

myRouter.get("/api/products", function (request, response) {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(products));
})

myRouter.get("/api/brands", function (request, response) {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(brands));
})

myRouter.get("/api/brands/:brandId/products", function (request, response) {
    let brandProducts = products.filter(function (product) {
        return product.categoryId == request.params.brandId;
    });
    if (brandProducts.length != 0) {
        response.setHeader("Content-Type", "application.json");
        response.end(JSON.stringify(brandProducts));
    }
    else {
        response.writeHeader(404, "No products found with this brand ID");
        response.end();
    }

});

// Takes in "username" and "password" properties in request.body
myRouter.post("/api/login", function (request, response) {
    if (!request.body.username || !request.body.password) {
        response.writeHead(401, "Please enter a username and password.");
        return response.end();
    }
    let user = users.find((user) => {
        return (user.login.username == request.body.username);
    });
    if (!user) {
        response.writeHead(401, "Invalid username/password combination");
        return response.end();
    }
    if (user.login.password != request.body.password) {
        if (user.login.failedAttempts) {
            user.login.failedAttempts += 1;
            if (user.login.failedAttempts > 3) {
                response.writeHead(401, "Too many unsuccessful login attempts");
                return response.end();
            }
        }
        else {
            user.login.failedAttempts = 1;
        }
        response.writeHead(401, "Invalid username/password combination");
        return response.end();
    }
    else {
        user.login.failedAttempts = 0;
        // We have a successful login, if we already have an existing access token, use that
        let currentAccessToken = accessTokens.find((tokenObject) => {
            return tokenObject.username == user.login.username && ((new Date) - tokenObject.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
        });

        // Update the last updated value so we get another time period
        if (currentAccessToken) {
            currentAccessToken.lastUpdated = new Date();
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(currentAccessToken.token));
        } else {
            // Create a new token with the user value and a "random" token
            let newAccessToken = {
                username: user.login.username,
                lastUpdated: new Date(),
                token: uid(16)
            }
            accessTokens.push(newAccessToken);
            response.writeHead(200, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify(newAccessToken.token));
        }
    }
});

//Takes in a token in request.headers["authorization"]
myRouter.get("/api/me/cart", function (request, response) {
    var token = getValidTokenFromRequest(request);
    if (token) {
        var user = users.find(function (u) {
            return u.login.username == token.username;
        });
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(user.cart));
    } else {
        response.writeHead(401, "You must be logged in to perform this action.")
        response.end();
    }
});

//takes in a token in the header, and a product id in request.body
myRouter.post("/api/me/cart", function (request, response) {
    var token = getValidTokenFromRequest(request);
    if (token) {
        var user = users.find(function (u) {
            return u.login.username == token.username;
        });
        var alreadyInCart = user.cart.find(function (item) {
            return item.product.productId == request.body.productId;
        });
        if (alreadyInCart) {
            response.writeHeader(400, "Item already in cart");
            return response.end();
        } else {
            var product = products.find(function (item) {
                return item.id == request.body.productId;
            });
            var cartItem = {
                product: product,
                quantity: 1
            }
            user.cart.push(cartItem);
            response.end();
        }
    } else {
        response.writeHead(401, "You must be logged in to perform this action.")
        response.end();
    }
});

//takes in a token in the header and a quantity in the body
myRouter.post("/api/me/cart/:productId", function(request, response){
    var token = getValidTokenFromRequest(request);
    if(token){
        var user = users.find(function(u){
            return u.login.username == token.username;
        });
        var cartItem = user.cart.find(function(item){
            return item.product.id == request.params.productId;
        });
        if(cartItem){
            cartItem.quantity = request.body.quantity;
            response.end();
        } else {
            response.writeHead(400, "Item not found in cart.")
            response.end();
        }
    } else {
        response.writeHead(401, "You must be logged in to perform this action.");
        response.end();
    }
});

myRouter.delete("/api/me/cart/:productId", function(request, response){
    var token = getValidTokenFromRequest(request);
    if(token){
        var user = users.find(function(u){
            return u.login.username == token.username;
        });
        user.cart = user.cart.filter(function(item){
            return item.product.id != request.params.productId;
        });
        response.end();
    } else {
        response.writeHead(401, "You must be logged in to perform this action.");
        response.end();
    }
});