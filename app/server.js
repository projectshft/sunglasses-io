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

// This is to ensure our tokens expire after 15 minutes 
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes


// Helper method to process access token
var getValidTokenFromRequest = function (request) {
    var parsedUrl = require('url').parse(request.url, true);
    var tokenInUrl = parsedUrl.query.token

    if (tokenInUrl) {
        // Verify the access token to make sure it's valid and not expired
        let currentAccessToken = accessTokens.find(accessToken => {
            return accessToken.token == tokenInUrl
                && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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
    console.log(`Server running on port ${PORT}`);
    //access to brands.json file 
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
    //access to products.json file 
    products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
    //access to users.json file 
    users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf-8"));
    // hardcode "logged in" user
    user = users[0];

});

// Route to return all brands  
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


// User login route 
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

    //If there is no token in request, alert user to sign in 
    if (!currentAccessToken) {

        response.writeHead(403, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify("Please sign in"));

    } else {

        //if there is a token in the request, check it against known users 
        let loggedInUser = users.find((user) => {
            return user.login.username == currentAccessToken.username
        })

        let product = products.find(product => product.id == request.body.id)

        // loggedInUser.cart.push(product)

        let productInCart = loggedInUser.cart.find(item => item.id == request.body.id || request.params.id)


        // If there is no product already in the shopping cart,
        // add product to cart along with quantity starting at 1 
        if (!productInCart) {

            loggedInUser.cart.push({ quantity: 1, product })
            // Object.assign(loggedInUser.cart, addedItem)

        } else {

            // If the product is in the cart already,
            // increment the quantity by 1 and return the cart
            productInCart.quantity++;

        }

        response.writeHead(200, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify(loggedInUser.cart));

    }


});

// Route for user to retrieve shopping cart 
router.get("/api/me/cart", (request, response) => {
    // Check for valid token in request 
    let currentAccessToken = getValidTokenFromRequest(request);

    //If there is not a token in the request, ask user to sign in 
    if (!currentAccessToken) {
        response.writeHead(403, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify("Please sign in"));

    } else {

        //if there is a token in the request, check it against known users 
        let loggedInUser = users.find((user) => {
            return user.login.username == currentAccessToken.username
        })

        //If user matches a user in database, return cart of user
        if (loggedInUser) {

            //needed to add this to clear cart for testing purposes, needs to be removed before implemented 
            loggedInUser.cart = []

            response.writeHead(200, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify(loggedInUser.cart));

        }
    }


});

// Route removing products from the cart
router.delete("/api/me/cart/:productId", (request, response) => {
    // Check for valid token in request 
    let currentAccessToken = getValidTokenFromRequest(request);

    //If there is not a token in the request, ask user to sign in 
    if (!currentAccessToken) {
        response.writeHead(403, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify("Please sign in"));

    } else {

        //if there is a token in the request, check it against known users 
        let loggedInUser = users.find((user) => {
            return user.login.username == currentAccessToken.username
        })

        // Match the product Id from params against the product Id in our JSON
        // product list

        let product = products.find((product) => {
            return product.id == request.params.productId
        })

        //If user matches a user in database, remove item from cart and return cart
        if (loggedInUser) {

            loggedInUser.cart.splice(product, 1)

            response.writeHead(200, { 'Content-Type': 'application/json' });
            return response.end(JSON.stringify(loggedInUser.cart));

        }
    }


});

// Route updating product quantity in the cart
router.post("/api/me/cart/:productId", (request, response) => {
    // Check for valid token in request 
    let currentAccessToken = getValidTokenFromRequest(request);

    //If there is not a token in the request, ask user to sign in 
    if (!currentAccessToken) {
        response.writeHead(403, { 'Content-Type': 'application/json' });
        return response.end(JSON.stringify("Please sign in"));

    } else {

        //if there is a token in the request, check it against known users 
        let loggedInUser = users.find((user) => {
            return user.login.username == currentAccessToken.username
        })

        // Match the product Id from params against the product Id in our JSON
        // product list

        let productToBeUpdated = products.find((product) => {
            return product.id == request.params.productId
        })

        let newQuantity = parseInt(request.body.quantity)

        //If user matches a user in database, update quantity 
        //and return cart of user

        if (loggedInUser) {

            loggedInUser.cart.push(productToBeUpdated)
            // Check to see if the product is currently in the cart 
            // If it is, then we should return an error
            let shoppingCartIndex = loggedInUser.cart.findIndex(product => {
                return product == productToBeUpdated
            })

            //If the cart has no items or theres no id in the request parameters 
            //we return an error message 
            if (shoppingCartIndex == -1 || request.params.productId == "" || request.params.productId == 0) {
                response.writeHead(404, { 'Content-Type': 'application/json' });
                return response.end(JSON.stringify("No products found in cart"));

            } else {

                //Update the quantity with the value coming back in the request 
                loggedInUser.cart[shoppingCartIndex].quantity = newQuantity

                response.writeHead(200, { 'Content-Type': 'application/json' });
                return response.end(JSON.stringify(loggedInUser.cart));
            }
        }
    }


});



module.exports = server