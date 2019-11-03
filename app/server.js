var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const url = require("url");

const PORT = process.env.PORT || 3001;

// State holding variables 
let brands = [];
let products = [];
let users = [];

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
            // const { query } = parsedQuery;
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
    const relatedBrands = products.filter(
        products => products.categoryId == brandSearch.id
    );
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(relatedBrands));
});




module.exports = server