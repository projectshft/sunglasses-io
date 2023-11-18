import { Request, Response } from "express";
import { ProductObject } from "../types/type-definitions";
import { ServerResponse } from "http";

const urlParser = require("url");

/**
 * Retrieves list of all products
 * @param request Client request to server
 * @param response Server response to client
 * @returns void or ServerResponse
 */
const getProducts = (
  request: Request,
  response: Response,
  products: ProductObject[]
): void | ServerResponse => {
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
};

export interface ProductsController {
  getProducts: typeof getProducts;
}

module.exports = {
  getProducts,
};
