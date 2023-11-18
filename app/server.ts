// Type imports
import { IncomingMessage, ServerResponse, Server } from "http";
import { Request, Response } from "express";
import {
  User,
  BrandObject,
  ProductObject,
  //AccessToken,
} from "../types/type-definitions";
import { GetValidAccessToken, UpdateAccessToken } from "./login-methods";
import { GetCartContents } from "./cart-methods";

// Module imports
const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
//const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
//const uid = require("rand-token").uid;
const urlParser = require("url");
const getValidToken: GetValidAccessToken =
  require("./login-methods.ts").getValidToken;
const updateAccessToken: UpdateAccessToken =
  require("./login-methods.ts").updateAccessToken;
const getCartContents: GetCartContents =
  require("./cart-methods.ts").getCartContents;
const sunglassesController = require("./sunglasses.ts");

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
  sunglassesController.getBrands(request, response, brands)
);

// GET brand by id
router.get(
  "/api/sunglasses/brands/:brandId",
  (request: Request, response: Response) =>
    sunglassesController.getBrandById(request, response, brands)
);

// router.get(
//   "/api/sunglasses/brands/:brandId",
//   (request: Request, response: Response): void | ServerResponse => {
//     if (brands.length <= 0) {
//       response.writeHead(404, { "Content-Type": "application/json" });
//       return response.end(
//         JSON.stringify({
//           responseCode: response.statusCode,
//           responseMessage: "Brands not found",
//         })
//       );
//     }

//     const brandId = request.params.brandId;

//     if (isNaN(Number(brandId))) {
//       response.writeHead(400, { "Content-Type": "application/json" });
//       return response.end(
//         JSON.stringify({
//           responseCode: response.statusCode,
//           responseMessage: "Bad request",
//         })
//       );
//     }

//     const brand = brands.find((item) => item.id === brandId);

//     if (!brand) {
//       response.writeHead(404, { "Content-Type": "application/json" });
//       return response.end(
//         JSON.stringify({
//           responseCode: response.statusCode,
//           responseMessage: "Brand not found",
//         })
//       );
//     }

//     response.writeHead(200, { "Content-Type": "application/json" });
//     response.end(
//       JSON.stringify({
//         responseCode: response.statusCode,
//         responseMessage: brand,
//       })
//     );
//   }
// );

// GET products


router.get(
  "/api/sunglasses/products",
  (request: Request, response: Response): void | ServerResponse => {
    // Check products exist
    if (products.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Products not found",
        })
      );
    }

    // Get URL params
    const parsedUrl = urlParser.parse(request.url, true);
    const { limit, search } = parsedUrl.query;

    if (limit && isNaN(limit)) {
      response.writeHead(400, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Bad request",
        })
      );
    } else if (limit && !isNaN(limit)) {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: products.slice(0, Number(limit)),
        })
      );
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

      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: filteredProducts,
        })
      );
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: products,
      })
    );
  }
);

// GET product by id
router.get(
  "/api/sunglasses/products/:productId",
  (request: Request, response: Response): void | ServerResponse => {
    // Check products exist
    if (products.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Products not found",
        })
      );
    }

    // Get productId from search params
    const productId = request.params.productId;

    if (isNaN(Number(productId))) {
      response.writeHead(400, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Bad request",
        })
      );
    }

    // Find product
    const product: ProductObject | undefined = products.find(
      (item: ProductObject) => item.id == productId
    );

    if (!product) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Product not found",
        })
      );
    }

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: product,
      })
    );
  }
);

// GET products by brandId
router.get(
  "/api/sunglasses/brands/:brandId/products",
  (request: Request, response: Response): void | ServerResponse => {
    // Check brands and products exist
    if (products.length <= 0 || brands.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Brands or products not found",
        })
      );
    }

    // Find products by brandId
    const brandId = request.params.brandId;

    if (isNaN(Number(brandId))) {
      response.writeHead(400, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Bad request",
        })
      );
    }

    const matchingProducts: ProductObject[] = products.filter(
      (item) => item.categoryId == brandId
    );

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: matchingProducts,
      })
    );
  }
);

// User routes

// GET user data
router.get(
  "/api/user",
  (request: Request, response: Response): void | ServerResponse => {
    // Check users exist
    if (users.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Users not found",
        })
      );
    }

    /**
     * accessToken object containing username, time when last updated, and 16-character uid token
     */
    const accessToken = getValidToken(request);

    if (!accessToken) {
      response.writeHead(401, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Unauthorized",
        })
      );
    }

    /**
     * User connected to accessToken
     */
    const matchedUser = users.find(
      (user) => user.login.username == accessToken.username
    );

    if (!matchedUser) {
      response.writeHead(401, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Unauthorized",
        })
      );
    }

    // Update accessToken lastUpdated time
    updateAccessToken(accessToken.username);

    response.writeHead(200, {
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: matchedUser,
      })
    );
  }
);

router.post(
  "/api/user/login",
  (request: Request, response: Response): void | ServerResponse => {
    // Check users exist
    if (users.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Users not found",
        })
      );
    }

    const { username, password } = request.body;

    if (!username || !password) {
      response.writeHead(401, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Unauthorized",
        })
      );
    }

    /**
     * User connected to username
     */
    const matchedUser = users.find((user) => user.login.username == username);

    if (!matchedUser || matchedUser.login.password != password) {
      response.writeHead(401, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Unauthorized",
        })
      );
    }

    /**
     * accessToken object containing username, time when last updated, and 16-character uid token
     */
    const accessToken = updateAccessToken(username);

    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: accessToken,
      })
    );
  }
);

router.get(
  "/api/user/cart",
  (request: Request, response: Response): void | ServerResponse => {
    // Check users exist
    if (users.length <= 0) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Users not found",
        })
      );
    }

    const accessToken = getValidToken(request);

    if (!accessToken) {
      response.writeHead(401, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Unauthorized",
        })
      );
    }

    /**
     * User connected to accessToken
     */
    const matchedUser = users.find(
      (user) => user.login.username == accessToken.username
    );

    if (!matchedUser) {
      response.writeHead(401, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Unauthorized",
        })
      );
    }

    /**
     * Array of all products in cart, single product in cart if productId is included in query, or null if no product is found matching productId
     */
    const cart = getCartContents(matchedUser.cart, request);

    if (!cart) {
      response.writeHead(404, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify({
          responseCode: response.statusCode,
          responseMessage: "Product not found",
        })
      );
    }

    // Update accessToken lastUpdated time
    updateAccessToken(accessToken.username);

    response.writeHead(200, {
      "Content-Type": "application/json",
    });
    response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: cart,
      })
    );
  }
);

// Exports
module.exports = server;
