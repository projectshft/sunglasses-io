const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser   = require("body-parser");
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

router.get("/api/brands", (req, res) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { query } = querystring.parse(parsedUrl.query);

    if(!brands) {
        res.writeHead(404, "That brand cannot be found")
        return res.end();
    }
    
    let brandsToReturn = [];
    if (query !== undefined) {
        brandsToReturn = brands.filter(brand => brand.name.includes(query));

        if (!brandsToReturn) {
            res.writeHead(404, "That brand does not exist");
            return res.end();
        }
    } else {
        brandsToReturn = brands;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(brandsToReturn));
    });

     

module.exports = server;