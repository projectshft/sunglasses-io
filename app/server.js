const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const url = require("url");
const ShoppingCart = require('./models/shopping-cart')

const PORT = 8080;

let failedLogins = 0;
let accessTokens = [];
let products = [];
let brands = [];
let users = [];
let user = {};

const router = Router();
router.use(bodyParser.json());


const server = http.createServer((req, res) => {
    res.writeHead(200)
    router(req, res, finalHandler(req, res));

    // myRouter(request, response, finalHandler(request, response));
});

server.listen(PORT, err => {
    if(err) {
        return console.log("Error loading Server", err);
    }
    fs.readFile("initial-data/users.json", "utf8", (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    })
    fs.readFile("initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    })
    fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    })
    console.log(`Server listening on port ${PORT}`);
    user = users[0];
});

const saveCurrentUser = (currentUser) => {
    users[0] = currentUser;
    fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
}

const getValidToken = (request) {
    const parsedUrl = require('url').parse(request.url, true);
    if (parsedUrl.query.accessToken) {
        let currentAccessToken = accessTokens.find(accessToken => {
            return accessToken.token == parsedUrl.query.accessToken;
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

router.get("/", (request, response) => {
    response.end("Please visit /api/products")
})

router.get("/api/products", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { query, sort } = queryString.parse(parsedUrl.query);
    let glassesToReturn = [];
    if (query !== undefined) {
        let queryLowerCase = query.toLowerCase();

        glassesToReturn = products.filter(item => {
            let descLowerCase = item.description.toLowerCase();

            return descLowerCase.includes(queryLowerCase)
        });

        products.filter(item => {
            let nameLowerCase = item.name.toLowerCase();

            if(nameLowerCase.includes(queryLowerCase) && !glassesToReturn.includes(item)) {
                glassesToReturn.push(item)
            }
        });

        if(!glassesToReturn) {
            response.writeHead(404, "There are no glasses that match your search");
            return response.end();
        }
    } else {
        glassesToReturn = products;
    }

    if (sort !== undefined) {
        glassesToReturn.sort((a, b) => a[sort] - b[sort]);
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(glassesToReturn));
});

router.get("/api/brands", (request, response) => {                           /////add a limit parameter
    const parsedUrl = url.parse(request.originalUrl);
    const { query, sort } = queryString.parse(parsedUrl.query);
    let brandsToReturn = [];
    if (query !== undefined) {
       let queryLowerCase = query.toLowerCase();

        brandsToReturn = brands.filter(item => {
           let nameLowerCase = item.name.toLowerCase();

            return nameLowerCase.includes(queryLowerCase)
        });

        if (!brandsToReturn) {
            response.writeHead(404, "No brands match query");
            return response.end();
        }
    } else {
        brandsToReturn = brands;
    }
    if (sort !== undefined) {
        brandsToReturn.sort((a, b) => a[sort] - b[sort]);
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brandsToReturn));
})

router.get("/api/brands/:id/products", (request, response) => {
    // const parsedUrl = url.parse(request.originalUrl);            /////IF SEARCH QUERY ENABLED YOULL NEED THIS
    // const { query } = queryString.parse(parsedUrl.query);
    const { id } = request.params;
    const brand = brands.find(item => item.id == id)
    let productsToReturn = [];

    if (!brand) {
        response.writeHead(404, "Brand not Found");
        return response.end();
    }

    productsToReturn = products.filter(item => {
        return item.categoryId == brand.id
    });
    
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(productsToReturn));
});

router.post("/api/login", (request, response) => {
    loginCounter = failedLogins[request.body.username]
    if (!loginCounter) {
        loginCounter = 0;
    }
    if (request.body.username && request.body.password && loginCounter < 3) {
        let user = users.find((user) => {
            return user.login.username == request.body.username && 
            user.login.password == request.body.password;
        });
        if (user) {
            loginCounter = 0;
            response.writeHead(200, {"Content-Type": "application/json"});
            let currentAccessToken = accessTokens.find(token => {
                return token.username == user.login.username;
            });
            if (currentAccessToken) {
                correntAccessToken.lastUpdated = new Date();
                return response.end(JSON.stringify(currentAccessToken.token));
            } else {
                let newAccessToken = {
                    username: user.login.username,
                    lastUpdated: new Date(),
                    token: uid(16)
                }
                accessTokens.push(newAccessToken);
                return response.end(JSON.stringify(newAccessToken.token));
            }
        } else {
            let numFailed = loginCounter;
            if (numFailed) {
                loginCounter++;
            } else {
                loginCounter = 1;
            }
            response.writeHead(401, "Invalid username or password");
            return response.end();
        }
    } else {
        response.writeHead(400, "Incorrectly formatted response");
        return response.end();
    }
});

//GET USER CART
router.get("/api/me/cart", (request, response) => {  
    if(!user) {
        response.writeHead(404, "User not found");
        return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
});

//ADD A PRODUCT TO USER CART
router.post("/api/me/cart", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { productId } = queryString.parse(parsedUrl.query);
    const product = products.find(item => item.id == productId);
    
    if(!product) {
        response.writeHead(404, "Product not Found");
        return response.end();
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    user.cart.push(product);
    saveCurrentUser(user);
    return response.end(JSON.stringify(user.cart));
});

//DELETE PRODUCT FROM USER CART
router.delete("/api/me/cart/:productId", (request, response) => {
    const { productId } = request.params;
    const product = products.find(item => item.id == productId);
    if(!product) {
        response.writeHead(404, "Product not Found");
        return response.end();
    }

    let filteredCart = user.cart.filter(item => item.id !== productId) 
    response.writeHead(200, {"Content-Type": "application/json"});
    user.cart = filteredCart;
    saveCurrentUser(user);
    return response.end(JSON.stringify(user.cart));
})

//CHANGE ITEM QUANTITY
router.post("/api/me/cart/:productId", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { add, remove } = queryString.parse(parsedUrl.query);         //////add can be 0 so it can be pased as required parameter with remove
    const { productId } = request.params;
    const product = products.find(item => item.id == productId);
    if(!product) {
        response.writeHead(404, "product not Found");
        return response.end();
    }
    if (add) {
        for (let i = 1; i < add; i++) {
            user.cart.push(product)
        };
    }
    if (remove) {
        let productIndex = user.cart.indexOf(product)

        for (let j = 1; j < remove; j++) {
            user.cart.splice(productIndex, 1);
        }
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    saveCurrentUser(user);
    return response.end(JSON.stringify(user.cart));
})

module.exports = server;