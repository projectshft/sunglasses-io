var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const url = require("url");

const PORT = process.env.PORT || 3000;

// State holding variables 
let brands = [];
let products = [];
let users = [];

// hard coded access token for testing purposes 
let accessTokens = [{
    username: 'yellowleopard753',
    token: '87987'
}];


// Helper method to process access token
var getValidTokenFromRequest = function (request) {
    var parsedUrl = require('url').parse(request.url, true);
    var tokenInUrl = parsedUrl.query.token

    if (tokenInUrl) {
        // Verify the access token to make sure it's valid and not expired
        let currentAccessToken = accessTokens.find(accessToken => {
            return accessToken.token == tokenInUrl
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


// const saveCurrentUser = (currentUser) => {
//     // set hardcoded "logged in" user
//     users[0] = currentUser;
//     fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
// };

// Setup router
const router = Router();
router.use(bodyParser.json());

//Setup server 
const server = http.createServer((req, res) => {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
});

//sever listening for json and errors 
server.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);
    //access to brands.json file 
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
    //access to products.json file 
    products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
    //access to users.json file 
    users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));
    // hardcode "logged in" user
    user = users[0];

});

// Route for just brands 
router.get("/api/brands", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brands));
});

// Route for products 
router.get("/api/products", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { query } = queryString.parse(parsedUrl.query);

    let productsToReturn = [];

    if (query == '' && query.length == 0) {
        response.writeHead(404, { "Content-Type": "application/json" });
        return response.end(JSON.stringify("Please enter a search"));

    } else {

        if (query !== undefined) {
            productsToReturn = products.filter(product => product.description.includes(query.toLowerCase()));

            if (productsToReturn.length == 0) {
                response.writeHead(404, { "Content-Type": "application/json" });
                return response.end(JSON.stringify("There are no products that fit your search"));
            }

        } else {
            response.writeHead(200, { "Content-Type": "application/json" });
            return response.end(JSON.stringify(products));
        }
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productsToReturn));
});

// Route for brand products 
router.get("/api/brands/:id/products", (request, response) => {
    const { id } = request.params;
    const brandSearch = brands.find(brand => brand.id == id);
    if (!brandSearch) {
        response.writeHead(404, { "Content-Type": "application/json" });
        return response.end(JSON.stringify("That brand does not exist"));
    }
    const relatedProducts = products.filter(
        products => products.categoryId == brandSearch.id
    );
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(relatedProducts));
});


// Login call
router.post('/api/login', function (request, response) {

    // Make sure there is a username and password in the request
    if (request.body.username && request.body.password) {
        // See if there is a user that has that username and password
        let user = users.find((user) => {
            return user.login.username == request.body.username && user.login.password == request.body.password;
        });
        if (user) {
            // Write the header because we know we will be returning successful at this point and that the response will be json
            response.writeHead(200, { 'Content-Type': 'application/json' });

            // We have a successful login, if we already have an existing access token, use that
            let currentAccessToken = accessTokens.find((tokenObject) => {
                return tokenObject.username == user.login.username;
            });

            // Update the last updated value so we get another time period
            if (currentAccessToken) {
                currentAccessToken.lastUpdated = new Date();
                return response.end(JSON.stringify(currentAccessToken.token));
            } else {
                // Create a new token with the user value and a "random" token
                let newAccessToken = {
                    username: user.login.username,
                    lastUpdated: new Date(),
                    token: uid(16)
                }
                accessTokens.push(newAccessToken);
                return response.end(JSON.stringify(newAccessToken.token));
            }
        } else {
            // When a login fails, tell the client in a generic way that either the username or password was wrong
            response.writeHead(401, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify("Invalid username or password"));
        }

    } else {
        // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify("Incorrectly formatted response"));
    }

});

router.post("/api/me/cart", (request, response) => {
    // Check for valid token in request 
    let currentAccessToken = getValidTokenFromRequest(request);

    let updatedCart = request.body

    //If there is no token in request, alert user to sign in 
    if (!currentAccessToken) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify("Please sign in"));
    } else {
        //if there is a token in the request, check it against known users 
        let loggedInUser = users.find((user) => {
            return user.login.username == currentAccessToken.username
        })
        //If user matches a user in database, add product to the cart 
        if (loggedInUser) {
            //When a user adds a product to the cart, it should update the current cart
            Object.assign(loggedInUser.cart, updatedCart)

            response.writeHead(200, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify(loggedInUser.cart));

        }


    }


});

// Route for our shopping cart  
router.get("/api/me/cart", (request, response) => {

    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
});



module.exports = server