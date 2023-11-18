import { Request } from "express";
import { ProductInCart, ProductObject, User } from "../types/type-definitions";

const urlParser = require("url");

/**
 * Retrieves a single product from a cart if productId exists in query or simply returns the entire cart
 * @param cart Cart property of user object
 * @param request Express server request
 * @returns Product in cart that matches productId in request query
 * @returns Null if no product in cart matches the productId
 * @returns All products in cart if productId does not exist in query
 */
const getCartContents = (
  cart: User["cart"],
  request: Request
): null | ProductInCart[] | ProductInCart => {
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

/**
 * Posts a product to cart
 * @param cart Cart property of user object
 * @param request Express server request
 */
const postProductToCart = (
  cart: User["cart"],
  products: ProductObject[],
  request: Request
): string | null | User["cart"] => {
  const parsedUrl = urlParser.parse(request.url, true);

  if (parsedUrl.query.productId) {
    const productInUserCart = cart.find(
      (item) => item.id == parsedUrl.query.productId
    );
    const productInProductsDatabase = products.find(
      (item) => item.id == parsedUrl.query.productId
    );

    if (productInUserCart) {
      return "Product exists in user cart";
    }

    if (productInProductsDatabase) {
      const newProductInCart = Object.assign({
        quantity: 1
      }, productInProductsDatabase,);
      const newCart = [...cart];

      newCart.push(newProductInCart);
      return newCart;
    }
  }

  return null;
};

export type GetCartContents = typeof getCartContents;
export type PostProductToCart = typeof postProductToCart;

module.exports.getCartContents = getCartContents;
module.exports.postProductToCart = postProductToCart;
