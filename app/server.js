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
    // users = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
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
        itemsToReturn = products.filter(product => product.description.includes(query));

        if (!itemsToReturn) {
            res.writeHead(404, "Product not found");
            return res.end();
        }
    } else {
        itemsToReturn = products;
    }
    console.log("itemsToReturn are: ", itemsToReturn);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(itemsToReturn));
});





module.exports = server;