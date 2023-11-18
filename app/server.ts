// Type imports
import { IncomingMessage, ServerResponse, Server } from "http";
import { Request, Response } from "express";
import { User, BrandObject, ProductObject } from "../types/type-definitions";
import { BrandsController } from "./controllers/brands";
import { ProductsController } from "./controllers/products";
import { UserController } from "./controllers/user";

// Module imports
const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");

// Controller imports
const brandsController: BrandsController = require("./controllers/brands.ts");
const productsController: ProductsController = require("./controllers/products.ts");
const userController: UserController = require("./controllers/user");

/**
 * Dummy brands data
 */
let brands: BrandObject[] = [];

/**
 * Dummy products data
 */
let products: ProductObject[] = [];

/**
 * Dummy users data
 */
let users: User[] = [];

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

    // Load dummy data
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

    fs.readFile(
      "initial-data/users.json",
      "utf8",
      (error: any, data: string) => {
        if (error) throw error;

        users = JSON.parse(data);
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
router.get("/api/sunglasses/brands", (request: Request, response: Response) =>
  brandsController.getBrands(request, response, brands)
);

// GET brand by id
router.get(
  "/api/sunglasses/brands/:brandId",
  (request: Request, response: Response) =>
    brandsController.getBrandById(request, response, brands)
);

// GET products
router.get("/api/sunglasses/products", (request: Request, response: Response) =>
  productsController.getProducts(request, response, products)
);

// GET product by id
router.get(
  "/api/sunglasses/products/:productId",
  (request: Request, response: Response) =>
    productsController.getProductById(request, response, products)
);

// GET products by brandId
router.get(
  "/api/sunglasses/brands/:brandId/products",
  (request: Request, response: Response) =>
    productsController.getProductByBrandId(request, response, products, brands)
);

// User routes

// GET user data
router.get("/api/user", (request: Request, response: Response) =>
  userController.getUser(request, response, users)
);

// POST user login
router.post("/api/user/login", (request: Request, response: Response) =>
  userController.postUserLogin(request, response, users)
);

// GET user cart
router.get("/api/user/cart", (request: Request, response: Response) =>
  userController.getUserCart(request, response, users)
);

// Exports
module.exports = server;
