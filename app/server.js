var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
//parse request bodies
var bodyParser = require('body-parser');
//generate access tokens
var uid = require('rand-token').uid;

//variables to store data
var brands = [];
var products = [];
var users = [];
var accessTokens = [];
var failedLoginAttempts = {};

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, X-Authentication"
};

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
//api keys generated from uuidgenerator.net
const VALID_API_KEYS = ["a259e599-0293-49c9-a691-61a4d7a12392", "d0f3889f-67ff-4017-921a-4bc67eece8ed", "e4e4ee95-a298-4f8e-96b4-6461c42f64e7"];

//Set up router
const myRouter = Router();
myRouter.use(bodyParser.json());

http.createServer(function (request, response) {
    // handle initial OPTIONS request (Not sure if needed)
    if (request.method === 'OPTIONS') {
        response.writeHead(200, CORS_HEADERS);
        response.end();
    }
    // Verify that a valid API Key exists before we let anyone access our API
    if (!VALID_API_KEYS.includes(request.headers["x-authentication"])) {
        response.writeHead(401, "You need to have a valid API key to use this API", CORS_HEADERS);
        response.end();
    } else {
        response.writeHead(200, Object.assign(CORS_HEADERS, {
            'Content-Type': 'application/json'
        }));
    }
    // create execution of router
    myRouter(request, response, finalHandler(request, response))

}).listen(PORT, (error) => {
    // create listening for errors
    if (error) {
        return console.log('Error on Server Startup: ', error)
    }
    //Allow server to read data from the intital-data json files
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
}) 
//public routes

//Get list of product brands
myRouter.get('/api/brands', function (request, response) {
    response.writeHead(200, {
        'Context-Type': 'application/json'
    });
    response.end(JSON.stringify(brands));
});

//Get list of products
myRouter.get('/api/products', function (request, response) {
    response.writeHead(200, {
        'Context-Type': 'application/json'
    });
    response.end(JSON.stringify(products));
});

//Get individual products from brand selection
myRouter.get('/api/brands/:brandId/products', function (request, response) {
    brandProducts = brands.find(brand => brand.id === request.params.brandId);
    if (!brandProducts) {
        response.statusCode = 404;
        return response.end("No product with that brand was found.");
    }
    const productsByBrand = products.filter(product => {
        return product.categoryId === request.params.brandId;
    });
    response.writeHead(200, 'List of products for the given brand');
    response.end(JSON.stringify(productsByBrand));
});

//Get user profile
myRouter.get('/api/me', function (request, response) {
    response.writeHead(200, {
        'Context-Type': 'application/json'
    });
    response.end(JSON.stringify(users[i]));
});

// Helper method to process access token
var getValidTokenFromRequest = function (request) {
    var parsedUrl = require('url').parse(request.url, true)
    if (parsedUrl.query.accessToken) {
        // Verify the access token to make sure it is valid and not expired
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
};

//Get user cart
myRouter.get('/api/me/cart', function (request, response) {
    //Use helper function to validate/process access token
    let currentAccessToken = getValidTokenFromRequest(request);
    if (!currentAccessToken) {
        response.writeHead(401, "Session expired");
        response.end();
    } else {
         response.writeHead(200, Object.assign({
             'Content-Type': 'application/json'
    }));
        response.end(JSON.stringify(users[0].cart));
    }
});

//Post user login
myRouter.post('/api/login', function (request, response) {
    if (request.body.username && request.body.password) {
        let user = users.find((user) => {
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

//Post user cart
myRouter.post('/api/me/cart', function(request, response) {
    let selectedBody = request.body.id;
    if (users[i].cart = []) {
        response.writeHead(404, "No products have been selected.");
    } else {
    users[i].cart.push(request.selectedBody);
    response.end();
    }
})

//Post add product to user cart
myRouter.post('/api/me/cart/:productId', function(request, response){
    let product = products.find((id)=> {
        return product.id == request.params.productId
    })
    users[i].cart.push(productId)
    response.end();
});

//Delete remove product from user cart
myRouter.delete('/api/me/cart/:productId', function(request, response){
    let product = products.find((id)=> {
        return product.id == request.params.productId
    })
    users[i].cart.splice(users[i].cart[request.params.productId], 1)
    response.end();
})

//Post user logout
// myRouter.post('/api/logout', function (request, response) {
//     response.writeHead(200, "You have been logge out");
//     response.end();
// })