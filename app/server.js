const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const url = require('url');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
// const { getValidTokenFromRequest } = require('./authentication-helpers.js')
const path = require("path");

const PORT = 3001;

//initial data
let products = []
let users = []
let brands = []

//data for logged in user
let currentUser = {};
let accessTokens = [];

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

//Setup server
// let server = http.createServer(function (request, response) {
//     myRouter(request, response, finalHandler(request, response))
// }).listen(PORT);

// This function is a bit simpler...
let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
  }).listen(3001, () => {
    // Load dummy data into server memory for serving
    products = JSON.parse(fs.readFileSync(path.resolve('app', "../initial-data/products.json"), "utf-8"));
    // const file = fs.readFileSync(path.resolve('app', "../initial-data/products.json"));
    // Load all users into users array
    users = JSON.parse(fs.readFileSync(path.resolve('app', "../initial-data/users.json"), "utf-8"));
    
    // Load all brands from file
    brands = JSON.parse(fs.readFileSync(path.resolve('app', "../initial-data/brands.json"), "utf-8"));
  });


myRouter.get("/api/brands", (request, response) => {
    //for query parameters
    const queryParams = queryString.parse(url.parse(request.url).query);

    //check if parameters were sent with request
    if (Object.keys(queryParams).length === 0) {
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

myRouter.get("/api/brands/:brandId/products", (request, response) => {
    //for query parameters
    const queryParams = queryString.parse(url.parse(request.url).query);

    //check if parameters were sent with request
    if (Object.keys(queryParams).length === 0) {
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

myRouter.get("/api/products", (request, response) => {
    //for query parameters
    const queryParams = queryString.parse(url.parse(request.url).query);
    const queryKeys = Object.keys(queryParams);
    const validParams = ['query', 'something'];

    //check if parameter was sent
    if (queryKeys.length === 0) {
        //return all products if no parameters specified
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(products));

    } else {
        //check if request parameters are valid
        if (validParams.includes(...queryKeys)) {
            const searchTerm = queryParams.query.toLowerCase();

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

myRouter.get("/api/products/:productId", (request, response) => {
    //for query parameters
    const queryParams = queryString.parse(url.parse(request.url).query);
    const queryKeys = Object.keys(queryParams);

    //make sure no invalid parameters were sent
    if (queryKeys.length === 0) {
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

myRouter.post("/api/login", (request, response) => {
    //for query parameters
    const queryParams = queryString.parse(url.parse(request.url).query);
    const queryKeys = Object.keys(queryParams);
    const requiredParams = ['username', 'password'];

    if (queryKeys.length !== 0) {
        const existingUser = users.find(user => { user.login.username === queryParams.username })
        const currentPassword = queryParams.password;

        if (existingUser) {
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end();
        } else {
            response.writeHead(401, "Invalid username or password");
            response.end();
        }

    } else {
        response.writeHead(400, "Invalid request parameters: username & password are required");
        response.end();
    }


});

//   myRouter.get("/api/me/cart", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });

//   myRouter.post("/api/me/cart", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });

//   myRouter.delete("/api/me/cart/:productId", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });

//   myRouter.post("/api/me/cart/:productId", (request, response) => {
//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(JSON.stringify());
//   });


module.exports = server;