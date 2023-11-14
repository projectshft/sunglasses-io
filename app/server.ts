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
const urlParser = require('url');

// Type interfaces
interface BrandObject {
  id: string;
  name: string;
}

interface ProductObject {
  id: string,
  categoryId: string,
  name: string,
  description: string,
  price: number,
  imageUrls: Array<string>
}

// interface ResponseObject extends Response {
//   _parsedUrl: any;
// }
// Brands
let brands: BrandObject[] = [];

// Products
let products: ProductObject[] = [];

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

    fs.readFile(
      "initial-data/products.json",
      "utf8",
      (error: any, data: string) => {
        if (error) throw error;

        products = JSON.parse(data);
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

// GET list of brands
router.get(
  "/api/sunglasses/brands",
  (request: Request, response: Response): void | ServerResponse => {
    if (brands.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Brands not found",
        })
      );
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: brands,
      })
    );
  }
);

// GET brand by id
router.get(
  "/api/sunglasses/brands/:brandId",
  (request: Request, response: Response): void | ServerResponse => {
    if (brands.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Brand not found",
        })
      );
    }

    const brandId = request.params.brandId;

    if (isNaN(Number(brandId))) {
      response.writeHead(401, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Bad request",
        })
      );
    }

    const brand = brands.find((item) => item.id === brandId);

    if (!brand) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Brand not found",
        })
      );
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: brand,
      })
    );
  }
);

// GET products
router.get(
  "/api/sunglasses/products",
  (request: Request, response: Response): void | ServerResponse => {
    // Get URL params
    const parsedUrl = urlParser.parse(request.url, true);
    const { limit, search } = parsedUrl.query;

    if (limit) {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify({ responseCode: response.statusCode, responseMessage: products.slice(Number(limit)) }))
    }

    if (search) {
      const filteredProducts: ProductObject[] = [];
      const regex = search.toLowerCase();

      for (let i = 0; i < products.length; i++) {
        const description = products[i].description.toLowerCase();
        const found = description.match(regex);
        if (found !== null) {
          filteredProducts.push(products[i]);
        }
      }
      //const filteredProducts = products.filter((prod) => prod.description.match(regex));
      //const filteredProducts = products.filter((product) => product.description.toLowerCase().includes(search.toLowerCase()));

      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify({ responseCode: response.statusCode, responseMessage: filteredProducts }))
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ responseCode: response.statusCode, responseMessage: products }));
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
