const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const querystring = require('querystring');
const url = require("url");
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;

const { findObject } = require("./utils");

// State holding variables
let brands = [];
let users = [];
let products = [];
let accessTokens = [];

const PORT = 3001;

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
}).listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);

    //populate brands
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));

    //populate products
    products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf8"));

    //populate users
    users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
    //hardcoded user
    user = users[2];
});


//GET list of all brands
router.get("/api/brands", (req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(brands));
})

//GET list of all sunglasses made by that brand (by brand id)
router.get("/api/brands/:id/products", (req, res) => {
    //get id parameter (product.brandId = brand.id)
    const { id } = req.params;
    const items = [];

    //get all products with that brandId
    products.forEach(function (product) {
        if (id == product.brandId) {
            items.push(product);
        }
    })
    res.writeHead(200, { "Content-Type": "application/json" });

    return res.end(JSON.stringify(items));
});

//GET list of all products from query
router.get("/api/products", (req, res) => {
    //get query parameter 
    const parsedUrl = url.parse(req.originalUrl);
    const { query } = querystring.parse(parsedUrl.query);
    let itemsToReturn = [];

    if (query !== undefined) {
        itemsToReturn = products.filter(product => product.name.includes(query));

        if (!itemsToReturn) {
            res.writeHead(404, "Product not found");
            return res.end();
        }
    } else {
        itemsToReturn = products;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(itemsToReturn));
});

//POST username and password
router.post("/api/login", (req, res) => {
    //make sure the username and password are in the request
    if (req.body.username && req.body.password) {

        //check that user with those exists
        let user = users.find((user) => {
            return user.login.username === req.body.username && user.login.password === req.body.password;
        })

        if (user) {
            res.writeHead(200);
            
            //if we already have an existing access token, use that
            let currentAccessToken = accessTokens.find((tokenObject) => {
                return tokenObject.username == user.login.username;
            });

            // Update the last updated value so we get another time period
            if (currentAccessToken) {
                currentAccessToken.lastUpdated = new Date();
                res.end(JSON.stringify(currentAccessToken.token));
            } else {
                // Create a new token with the user value and a "random" token
                let newAccessToken = {
                    username: user.login.username,
                    lastUpdated: new Date(),
                    token: uid(16)
                }
                accessTokens.push(newAccessToken);
                res.end(JSON.stringify(newAccessToken.token));
            }
        } else {
            res.writeHead(401, "Unauthorized user");
            return res.end();
        }
    }
})

//GET cart
router.get("/api/me/cart", (req, res) => {
    const getValidTokenFromRequest = function (req) {
        const parsedUrl = url.parse(req.url, true)
        if (parsedUrl.query.accessToken) {
            // Verify the access token to make sure it's valid and not expired
            let currentAccessToken = accessTokens.find((accessToken) => {
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
    };
    res.writeHead(200);
    return res.end();
})





module.exports = server;