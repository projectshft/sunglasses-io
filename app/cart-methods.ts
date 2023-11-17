import { Request } from "express";
import { ProductInCart, User } from "../types/type-definitions";

const urlParser = require("url");

const getCartContents = (cart: User["cart"], request: Request): null | ProductInCart[] | ProductInCart => {
  const parsedUrl = urlParser.parse(request.url, true);

  if (parsedUrl.query.productId) {
    const product = cart.find((item) => item.id == parsedUrl.query.productId);

    if (!product) {
      return null;
    } else {
      return product;
    }
  }

  return cart;
};

export type GetCartContents = typeof getCartContents;

module.exports.getCartContents = getCartContents;