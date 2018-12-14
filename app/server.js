const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

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
});


router.get("/api/brands", (req, res) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { query, sort } = querystring.parse(parsedUrl.query);
    let brandsToReturn = [];
    if (query !== undefined) {
        brandsToReturn = brands.filter(brand => brand.description.includes(query));

        if (!brandsToReturn) {
            res.writeHead(404, "There aren't any brands to return");
            return res.end();
        }
    } else {
        brandsToReturn = brands;
    }
    // if (sort !== undefined) {
    //     brandsToReturn.sort((a, b) => a[sort] - b[sort]);
    // }
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(brandsToReturn));
})

module.exports = server;