import { Request, Response } from "express";
import { BrandObject } from "../types/type-definitions";
import { ServerResponse } from "http";

/**
 * GET list of brands
 * @param request Client request to server
 * @param response Server response to client
 * @returns void or ServerResponse
 */
const getBrands = (
  request: Request,
  response: Response,
  brands: BrandObject[]
): void | ServerResponse => {
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

/**
 * GET brand by id
 */
const getBrandById = (
  request: Request,
  response: Response,
  brands: BrandObject[]
): void | ServerResponse => {
  if (brands.length <= 0) {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: "Brands not found",
      })
    );
  }

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
};

module.exports = {
  getBrands,
  getBrandById
};
