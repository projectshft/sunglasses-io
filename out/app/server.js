"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Module imports
const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;
// Brands
let brands = [];
// Products
const products = [];
// Users
const users = [];
const PORT = 3001;
// Router setup
const router = Router();
router.use(bodyParser.json());
// Create server
const server = http
    .createServer(function (request, response) {
    router(request, response, finalHandler(request, response));
})
    .listen(PORT, (error) => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
        if (error)
            throw error;
        brands = (JSON.parse(data));
    });
    console.log(`Server is listening on ${PORT}`);
});
// Routes
router.get("/api/", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify("Server is up and running"));
});
// Sunglasses
router.get("/api/sunglasses/brands", (request, response) => {
    if (brands.length <= 0) {
        response.writeHead(404, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(`${response.statusCode}: Brands not found`));
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brands));
});
// Development routes (testing-specific)
// Remove brands
router.post("/dev/testing/remove-brands", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end();
});
// Exports
module.exports = server;
//# sourceMappingURL=server.js.map