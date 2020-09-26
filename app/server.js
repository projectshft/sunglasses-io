const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const url = require("url");

const PORT = 8080;

let products = [];
let brands = [];
let user = {};
let users = [];

const router = Router();
router.use(bodyParser.json());


const server = http.createServer((req, res) => {
    res.writeHead(200)
    router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
    if(err) throw err;
    // console.log(`server running on port ${PORT}`);

    products = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));

    brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

    users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));

    user = users[0];
});

const saveCurrentUser = (currentUser) => {
    users[0] = currentUser;
    fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
}

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

router.get("/api/brands", (request, response) => {
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

router.get("/api/me", (request, response) => {
    if(!user) {
        response.writeHead(404, "User not found");
        return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user));
});

//ADD A PRODUCT TO USER CART
router.post("/api/me/products/:productId/add-to-cart", (request, response) => {
    const { productId } = request.params;
    const product = products.find(item => item.id == productId);
    if(!product) {
        response.writeHead(404, "Product not Found");
        return response.end();
    }
    response.writeHead(200);
    user.cart.push(product);
    saveCurrentUser(user);
    return response.end();
});

module.exports = server;