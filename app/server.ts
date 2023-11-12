// Type imports
import { IncomingMessage, ServerResponse, Server } from "http";
import { Request, Response } from "express";

// Module imports
const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;

// Type interfaces
interface BrandObject {
  id: string;
  name: string;
}

// Brands
let brands: BrandObject[] = [];

// Products
const products: object[] = [];

// Users
const users: object[] = [];


// Router setup
const PORT = 3001;

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

    fs.readFile(
      "initial-data/brands.json",
      "utf8",
      (error: any, data: string) => {
        if (error) throw error;

        brands = JSON.parse(data);
      }
    );

    console.log(`Server is listening on ${PORT}`);
  });

// Routes

// Root /api/
router.get("/api/", (request: Request, response: Response): void => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify("Server is up and running"));
});

// Sunglasses
router.get(
  "/api/sunglasses/brands",
  (
    request: Request,
    response: Response
  ): void | ServerResponse<IncomingMessage> => {
    if (brands.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify(`${response.statusCode}: Brands not found`)
      );
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brands));
  }
);

router.get(
  "/api/sunglasses/brands/:brandId",
  (
    request: Request,
    response: Response
  ): void | ServerResponse<IncomingMessage> => {
    if (brands.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify(`${response.statusCode}: Brands not found`)
      );
    }

    const brandId = request.params.brandId;

    if (isNaN(Number(brandId))) {
      response.writeHead(401, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({ [response.statusCode]: "Bad request" })
      );
    }

    const brand = brands.find((item) => item.id === brandId);

    if (!brand) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({ [response.statusCode]: "Brand not found" })
      );
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brand));
  }
);

// Development routes for testing

// Remove brands
router.post(
  "/dev/testing/remove-brands",
  (request: Request, response: Response) => {
    brands = [];
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end();
  }
);

// Add brands back
router.post(
  "/dev/testing/add-brands",
  (request: Request, response: Response) => {
    fs.readFile(
      "initial-data/brands.json",
      "utf8",
      (error: any, data: string) => {
        if (error) throw error;

        brands = JSON.parse(data);
      }
    );
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end();
  }
);

// Exports
module.exports = server;
