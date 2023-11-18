import { Request, Response } from "express";
import { BrandObject } from "../types/type-definitions";
import { ServerResponse } from "http";

/**
 * GET list of brands
 * @param request Client request to server
 * @param response Server response to client
 * @returns void or ServerResponse
 */
const getBrands = (request: Request, response: Response, brands: BrandObject[]): void | ServerResponse => {
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
};

module.exports = {
  getBrands
}