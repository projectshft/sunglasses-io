const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const querystring = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;
const url = require("url");
const { findObject } = require("./utils");


//state holding variables

let brands = [];
let user = {};
let products = [];
let product = {};
let users = [];
let accessToken = [];

const PORT = process.env.PORT || 3000;

//Router setup
const router = Router();
router.use(bodyParser.json());

//Server setup
const server = http.createServer((req, res) => {
    //res.writeHead(200);
    router(req, res, finalHandler(req, res))
})
.listen(PORT, err => {
    if (err) throw err;
    console.log(`server running on port ${PORT}`);
//populate brands
        brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));
//populate products
        products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));
        //hardcode product
        product = products[0];    
//populate users
        users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));
        user = users[0];
});

//Public Route ... all users of API can access
//view list of all sunglasses brand
router.get("/api/brands", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { query } = querystring.parse(parsedUrl.query);
    let brandsToReturn = [];
    if (query !== undefined) {
        brandsToReturn = brands.filter(brand => brand.name.includes(query));

        if(!brandsToReturn) {
            response.writeHead(404, "No products to return");
            return response.end();
        }
    } else {
        brandsToReturn = brands;
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end(JSON.stringify(brandsToReturn));
});

//Public route...all users of API can access
//View the brand of a particular pair of sunglasses

router.get("/api/brands/:id/products", (request, response) => {
    const { id } = request.params;
    const similarProducts = products.filter(product => product.categoryId === id);
    if(!similarProducts) {
        response.writeHead(404, "No products found that match your search");
        response.end();
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(JSON.stringify(similarProducts));
})

//Public route...all users of API can access
//View all the sunglasses

router.get("/api/products", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { query } = querystring.parse(parsedUrl.query);
    let productsToReturn = [];
    if (query !== undefined) {
        productsToReturn = products.filter(product => product.name.includes(query));

        if(!productsToReturn) {
            response.writeHead(404, "No products to return");
            return response.end();
        }
    } else {
        productsToReturn = products;
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end(JSON.stringify(productsToReturn));
});  

//login call
router.post("/api/login", (request, response) => {
    //check for username and password in request
    if(request.body.username && request.body.password) {
        //is there a user that matches the given username and password?
        let user = users.find((user) => {
            return user.login.username == request.body.username && user.login.password == request.body.password;
        });

        if(user) {
            response.writeHead(200, {"Content-Type": "application/JSON"});
            //checks for access token after successful login
            let currentAccessToken = accessToken.find((tokenObject) => {
                return tokenObject.username == user.login.username;
              });
        
              //update the last updated value so we get another time period
              if (currentAccessToken) {
                currentAccessToken.lastUpdated = new Date();
                response.end(JSON.stringify(currentAccessToken.token));
              } else {
                //create a new token with the user value and a "random" token
                let newAccessToken = {
                  username: user.login.username,
                  lastUpdated: new Date(),
                  token: uid(16)
                }
                accessToken.push(newAccessToken);
                response.end(JSON.stringify(newAccessToken.token));
              } 
            } else {
              //When a login fails, inform the client that either the username or password was wrong
              response.writeHead(401, "Invalid username or password");
              response.end();
            }
          } else {
            // If they are missing a parameter, inform the client that the response formatting is wrong
            response.writeHead(400, "Incorrectly formatted response");
            response.end();
          }
        });
router.get("/api/me", (request, response) => {
    if (!user) {
        response.writeHead(404, "That user does not exist");
        return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user));
 });

 //Add more pairs of the same sunglasses
 router.post("/api/me/cart/:productId", (request, response) => {
    const { productId } = request.params;
    const product = findObject(productId, products);
    if (!product) {
      response.writeHead(404, "That product does not exist");
      return response.end();
    }
    response.writeHead(200, {"Content-Type": "application/json"});
    return response.end();
  });


          

     

module.exports = server;