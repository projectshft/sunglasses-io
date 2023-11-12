// TypeScript types
import { IncomingMessage } from "http";
import { ServerResponse } from "http";
import { Server } from "http";

// Module imports
const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;

// Brands
let brands: object[] = [];
fs.readFileSync("initial-data/brands.json", "utf8", (error: any, data: string) => {
  if (error) throw error;

  brands = (JSON.parse(data));
});

// Products
const products: object[] = [];

// Users
const users: object[] = [];

const PORT = 3001;

// Router setup
const router = Router();
router.use(bodyParser.json());

// Create server
const server: Server = http
  .createServer(function (request: IncomingMessage, response: ServerResponse) {
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error: any) => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }

    // fs.readFile("initial-data/brands.json", "utf8", (error: any, data: string) => {
    //   if (error) throw error;

    //   brands = (JSON.parse(data));
    // });

    console.log(`Server is listening on ${PORT}`);
  });

// Routes
router.get("/api/", (request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify("Server is up and running"));
});

// Sunglasses
router.get("/api/sunglasses/brands", (request: IncomingMessage, response: ServerResponse) => {
  if (brands.length <= 0) {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(`${response.statusCode}: Brands not found`));
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(brands));
});

// Development routes (testing-specific)

// Remove brands
router.post("/dev/testing/remove-brands", (request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end();
});

// Exports
module.exports = server;