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
let clear;

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

    clear = () => user.cart = [];
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

});

//GET USER CART
router.get("/api/me/cart", (request, response) => {     ///////NEEDS TO RETURN CART FOR A USER
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
    response.writeHead(200);
    clear();
    user.cart.push(product);
    saveCurrentUser(user);
    return response.end();
});

//DELETE PRODUCT FROM USER CART
router.delete("/api/me/cart/:productId", (request, response) => {
    const { productId } = request.params;
    const product = products.find(item => item.id == productId);
    if(!product) {
        response.writeHead(404, "Product not Found");
        return response.end();
    }

    let filteredCart = user.cart.filter(item => item !== product) 
    response.writeHead(200);
    user.cart = filteredCart;
    saveCurrentUser(user);
    return response.end();
})

router.post("/api/me/cart/:productId", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { add, remove } = queryString.parse(parsedUrl.query);
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
    response.writeHead(200);
    saveCurrentUser(user);
    return response.end();
})

module.exports = server;