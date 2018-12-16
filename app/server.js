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
let product = {};
let products = [];
let users = [];
//i think you need to add a user object that hold the login info for a specific user. This will probably be necessary when it comes to authorization

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

     

module.exports = server;