const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const url = require('url');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const path = require("path");

const PORT = 3001;

//initial data
let products = []
let users = []
let brands = []

//data for logged in user
let accessTokens = [];
let failedLoginAttempts = {};

//for query parameters
const queryParams = (request) => queryString.parse(url.parse(request.url).query);
const queryKeys = (request) => Object.keys(queryParams(request));
const bodyKeys = (request) => Object.keys(request.body);

// Helpers to get/set our number of failed requests per username
const getNumFailedLogins = (username) => {
    let currentNumberOfFailedRequests = failedLoginAttempts[username];
    if (currentNumberOfFailedRequests) {
        return currentNumberOfFailedRequests;
    } else {
        return 0;
    }
}
const setNumFailedLogins = function (username, numFails) {
    failedLoginAttempts[username] = numFails;
}

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// Helper method to process access token
const getValidTokenFromRequest = (request) => {
    const parsedUrl = require('url').parse(request.url, true);
    const sentToken = parsedUrl.query.accessToken;

    if (sentToken) {
        // Verify the access token to make sure its valid and not expired
        let currentAccessToken = accessTokens.find((accessToken) => {
            return accessToken.token == sentToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

//Helper method to find user
const findUser = (currentValidToken) => users.find(user => {
    return user.login.username === currentValidToken.username;
});

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

//Setup server
let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(3001, (error) => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    // Load all products into products array
    products = JSON.parse(fs.readFileSync(path.resolve('app', "../initial-data/products.json"), "utf-8", error => {
        if (error) throw error;
    }));
    console.log(`Server setup: ${products.length} products loaded`);

    // Load all users into users array
    users = JSON.parse(fs.readFileSync(path.resolve('app', "../initial-data/users.json"), "utf-8", error => {
        if (error) throw error;
    }));
    console.log(`Server setup: ${users.length} users loaded`);

    // Load all brands into brands array
    brands = JSON.parse(fs.readFileSync(path.resolve('app', "../initial-data/brands.json"), "utf-8", error => {
        if (error) throw error;
    }));
    console.log(`Server setup: ${brands.length} brands loaded`);

});

//for getting list of brands
myRouter.get("/api/brands", (request, response) => {
    //check if parameters were sent with request
    if (queryKeys(request).length === 0) {
        if (brands) {
            //return all brands
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(brands));
        } else {
            response.writeHead(404, "No brands found")
            response.end();
        }
    } else {
        response.writeHead(400, "Invalid request parameters")
        response.end();
    }
});

//for getting products by brand
myRouter.get("/api/brands/:brandId/products", (request, response) => {
    //check if parameters were sent with request
    if (queryKeys(request).length === 0) {
        //check if brand exists
        let brandFound = brands.filter(brand => {
            return brand.id === request.params.brandId;
        });

        if (brandFound.length !== 0) {
            //find all products with selected brand
            let brandedProducts = products.filter(product => {
                return product.categoryId === request.params.brandId;
            });

            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(brandedProducts));

        } else {
            response.writeHead(404, "Brand was not found");
            response.end();
        }
    } else {
        response.writeHead(400, "Invalid request parameters")
        response.end();
    }
});

//for getting all products or searching with query
myRouter.get("/api/products", (request, response) => {
    const validParams = ['query'];

    //check if parameter was sent
    if (queryKeys(request).length === 0) {
        //return all products if no parameters specified
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(products));

    } else {
        //check if request parameters are valid
        if (validParams.includes(...queryKeys(request))) {
            const searchTerm = queryParams(request).query.toLowerCase();

            //filter products according to search term
            let searchResults = products.filter(product => {
                return product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
            });

            //return products matching search term
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(searchResults));

        } else {
            //send error if request parameters were invalid
            response.writeHead(400, "Invalid request parameters")
            response.end();
        }
    }
});

//for finding product by id
myRouter.get("/api/products/:productId", (request, response) => {
    //make sure no invalid parameters were sent
    if (queryKeys(request).length === 0) {
        //find requested product
        const productWithMatchingId = products.find(product => {
            return product.id === request.params.productId;
        });

        //check if product was found
        if (productWithMatchingId) {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(productWithMatchingId));

        } else {
            response.writeHead(404, "Product was not found");
            response.end();
        }
    } else {
        response.writeHead(400, "Invalid request parameters");
        response.end();
    }
});

//for user to login
myRouter.post("/api/login", (request, response) => {
    const requiredParams = ['username', 'password'];
    //get user
    const sentUsername = request.body.username;
    //get password
    const sentPassword = request.body.password;

    //make sure no invalid parameters sent
    if (queryKeys(request).length === 0) {

        //check if username and password are in body of request &
        //make sure username and password are filled out
        if (bodyKeys(request).sort().join('') === requiredParams.sort().join('') &&
            sentUsername && sentPassword) {
            //find user
            const existingUser = users.find(user => {
                return user.login.username.toLowerCase() === sentUsername.toLowerCase();
            });

            //check number of failed login attempts
            numFailedLogins = getNumFailedLogins(sentUsername);

            if (numFailedLogins < 3) {
                //check if user exists and password is correct
                if (existingUser && (existingUser.login.password === sentPassword)) {

                    // If we found a user, reset our counter of failed logins
                    setNumFailedLogins(sentUsername, 0);

                    // login successful
                    response.writeHead(200, { "Content-Type": "application/json" });

                    //  check for existing access token
                    let currentAccessToken = accessTokens.find(token => {
                        return token.username == existingUser.login.username;
                    });

                    // update timestamp to reset time until expiration
                    if (currentAccessToken) {
                        currentAccessToken.lastUpdated = new Date();
                        response.end(JSON.stringify(currentAccessToken));

                    } else {
                        // create new token for user if one doesn't exist
                        let newAccessToken = {
                            username: existingUser.login.username,
                            lastUpdated: new Date(),
                            token: uid(16)
                        }
                        //add to tokens array
                        accessTokens.push(newAccessToken);

                        //send access token
                        response.end(JSON.stringify(newAccessToken));
                    }

                } else {
                    //send back error message
                    response.writeHead(401, "Too many login attempts.");
                    response.end();
                }
            } else {
                //update number of failed login attempts
                setNumFailedLogins(sentUsername, numFailedLogins++)

                //send back error message
                response.writeHead(401, "Invalid username or password");
                response.end();
            }
        } else {
            response.writeHead(400, "Username and password are required");
            response.end();
        }
    } else {
        response.writeHead(400, "Invalid request parameters");
        response.end();
    }
});

myRouter.get("/api/me/cart", (request, response) => {
    //check if token was sent && is valid
    const currentValidToken = getValidTokenFromRequest(request)

    if (currentValidToken) {
        //find user
        const currentUser = findUser(currentValidToken);

        //send cart
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(currentUser.cart));

    } else {
        response.writeHead(401, "Invalid authorization");
        response.end();
    }
});

myRouter.post("/api/me/cart", (request, response) => {
    const requiredParams = ['accessToken', 'productId'];
    const sentParams = queryParams(request);

    //check if token is valid
    const currentValidToken = getValidTokenFromRequest(request)
    if (currentValidToken) {

        //check for required parameters were sent and not empty and no invalid parameters sent
        if (queryKeys(request).sort().join('') === requiredParams.sort().join('') &&
            sentParams.accessToken && sentParams.productId) {

            //check if product exists
            productToAdd = products.find(product => {
                return product.id === sentParams.productId;
            });

            if (productToAdd) {
                //successful request
                response.writeHead(200, { "Content-Type": "application/json" });

                //get user
                const currentUser = findUser(currentValidToken);

                //check if item already exists in cart
                const productAlreadyInCart = currentUser.cart.find(cartItem => {
                    return cartItem.product.id === productToAdd.id;
                })

                if (productAlreadyInCart) {
                    productAlreadyInCart.quantity++;
                    response.end(JSON.stringify(currentUser.cart));

                } else {
                    const addedProduct = {
                        product: productToAdd,
                        quantity: 1
                    }
                    //add to cart
                    currentUser.cart.push(addedProduct);
                    response.end(JSON.stringify(currentUser.cart));
                }
            } else {
                response.writeHead(404, "Product not found");
                response.end();
            }
        } else {
            response.writeHead(400, "Invalid request parameters");
            response.end();
        }
    } else {
        response.writeHead(401, "Invalid authorization");
        response.end();
    }
});

myRouter.delete("/api/me/cart/:productId", (request, response) => {
    const sentToken = queryParams(request).accessToken
    const queryKey = queryKeys(request).join('');
    const requiredParam = 'accessToken';

    //check if token is valid
    const currentValidToken = getValidTokenFromRequest(request)
    if (currentValidToken) {

        //check for required parameters were sent and not empty and no invalid parameters sent
        if (queryKey === requiredParam && sentToken) {
            //find user
            const currentUser = findUser(currentValidToken);

            //check if product exists in cart
            productToDelete = currentUser.cart.find(cartItem => {
                return cartItem.product.id === request.params.productId;
            });

            if (productToDelete) {
                //successful request
                response.writeHead(200, { "Content-Type": "application/json" });

                //remove product from cart
                const productIndex = currentUser.cart.indexOf(productToDelete);
                currentUser.cart.splice(productIndex, 1);
                response.end(JSON.stringify(currentUser.cart));

            } else {
                response.writeHead(404, "Product not found");
                response.end();
            }
        } else {
            response.writeHead(400, "Invalid request parameters");
            response.end();
        }
    } else {
        response.writeHead(401, "Unauthorized access");
        response.end();
    }
});

myRouter.post("/api/me/cart/:productId", (request, response) => {

    //check if token is valid
    const currentValidToken = getValidTokenFromRequest(request);
    if (currentValidToken) {

        //check for required parameters were sent and not empty and no invalid parameters sent
        if (bodyKeys(request).join('') === 'quantity' && typeof request.body.quantity === 'number'
            && queryKeys(request).length === 1) {
            //find user
            const currentUser = findUser(currentValidToken);

            //check if product exists in cart
            productToUpdate = currentUser.cart.find(cartItem => {
                return cartItem.product.id === request.params.productId;
            });

            if (productToUpdate) {
                //successful request
                response.writeHead(200, { "Content-Type": "application/json" });

                //edit quantity of product in cart
                productToUpdate.quantity = request.body.quantity;
                response.end(JSON.stringify(currentUser.cart));

            } else {
                response.writeHead(404, "Product not found");
                response.end();
            }
        } else {
            response.writeHead(400, "Invalid request parameters");
            response.end();
        }
    } else {
        response.writeHead(401, "Unauthorized access");
        response.end();
    }
});


module.exports = server;