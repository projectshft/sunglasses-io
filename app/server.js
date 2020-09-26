const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const url = require("url");

const PORT = 8080;

let sunglasses = [];
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

    sunglasses = JSON.parse(fs.readFileSync("initial-data/products.json", "utf-8"));

    brands = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf-8"));

    users = JSON.parse(fs.readFileSync("initial-data/users.json", "utf-8"));

    user = users[0];
});

const saveCurrentUSer = (currentUser) => {
    users[0] = currentUser;
    fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
}

router.get("/v1/sunglasses", (request, response) => {
    const parsedUrl = url.parse(request.originalUrl);
    const { query, sort } = queryString.parse(parsedUrl.query);
    let glassesToReturn = [];
    if (query !== undefined) {
        glassesToReturn = sunglasses.filter(item => item.description.includes(query));

        if(!glassesToReturn) {
            response.writeHead(404, "There are no glasses that match your search");
            return response.end();
        }
    } else {
        glassesToReturn = sunglasses;
    }
    if (sort !== undefined) {
        glassesToReturn.sort((a, b) => a[sort] - b[sort]);
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(glassesToReturn));
});

router.get("/v1/me", (request, response) => {
    if(!user) {
        response.writeHead(404, "User not found");
        return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user));
});

// router.post("/me/add-to-cart", (request, response) => {
//     const {}
// })

module.exports = server;