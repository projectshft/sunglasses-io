import { Request, Response } from "express";
import { ProductObject, User } from "../../types/type-definitions";
import { GetValidAccessToken, UpdateAccessToken } from "../login-methods";
import { ServerResponse } from "http";
import {
  GetCartContents,
  PostProductToCart,
  DeleteProductFromCart,
  ChangeProductQuantity,
} from "../cart-methods";

const fs = require("fs");

const getValidToken: GetValidAccessToken =
  require("../login-methods.ts").getValidToken;
const updateAccessToken: UpdateAccessToken =
  require("../login-methods.ts").updateAccessToken;
const getCartContents: GetCartContents =
  require("../cart-methods.ts").getCartContents;
const postProductToCart: PostProductToCart =
  require("../cart-methods.ts").postProductToCart;
const deleteProductFromCart: DeleteProductFromCart =
  require("../cart-methods.ts").deleteProductFromCart;
const changeProductQuantity: ChangeProductQuantity = require("../cart-methods.ts").changeProductQuantity;

// Response functions
/**
 * 404 users not found error
 * @param response Server response object
 */
const respondWith404UsersNotFound = (response: Response) => {
  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      responseCode: response.statusCode,
      responseMessage: "Users not found",
    })
  );
};

/**
 * 401 unauthorized request error
 * @param response Server response object
 */
const respondWith401Unauthorized = (response: Response) => {
  response.writeHead(401, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      responseCode: response.statusCode,
      responseMessage: "Unauthorized",
    })
  );
};

// Controller functions
/**
 * Retrieves current user profile data
 * @param request Client request to server
 * @param response Server response to client
 * @returns void or ServerResponse
 */
const getUser = (
  request: Request,
  response: Response,
  users: User[]
): void | ServerResponse => {
  // Check users exist
  if (users.length <= 0) {
    return respondWith404UsersNotFound(response);
  }

  /**
   * accessToken object containing username, time when last updated, and 16-character uid token
   */
  const accessToken = getValidToken(request);

  if (!accessToken) {
    return respondWith401Unauthorized(response);
  }

  /**
   * User connected to accessToken
   */
  const matchedUser = users.find(
    (user) => user.login.username == accessToken.username
  );

  if (!matchedUser) {
    return respondWith401Unauthorized(response);
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
};

/**
 * Logs user into website with username and password passed in the request body
 * @param request Client request to server
 * @param response Server response to client
 * @returns void or ServerResponse
 */
const postUserLogin = (
  request: Request,
  response: Response,
  users: User[]
): void | ServerResponse => {
  // Check users exist
  if (users.length <= 0) {
    respondWith404UsersNotFound(response);
  }

  const { username, password } = request.body;

  if (!username || !password) {
    return respondWith401Unauthorized(response);
  }

  /**
   * User connected to username
   */
  const matchedUser = users.find((user) => user.login.username == username);

  if (!matchedUser || matchedUser.login.password != password) {
    return respondWith401Unauthorized(response);
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
};

/**
 * Retrieves current contents of user's cart
 * @param request Client request to server
 * @param response Server response to client
 * @returns void or ServerResponse
 */
const getUserCart = (
  request: Request,
  response: Response,
  users: User[]
): void | ServerResponse => {
  // Check users exist
  if (users.length <= 0) {
    respondWith404UsersNotFound(response);
  }

  const accessToken = getValidToken(request);

  if (!accessToken) {
    return respondWith401Unauthorized(response);
  }

  /**
   * User connected to accessToken
   */
  const matchedUser = users.find(
    (user) => user.login.username == accessToken.username
  );

  if (!matchedUser) {
    return respondWith401Unauthorized(response);
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
};

/**
 * Posts product matching productId in search query to user's cart
 * @param request Client request to server
 * @param response Server response to client
 * @returns void or ServerResponse
 */
const postUserCart = (
  request: Request,
  response: Response,
  users: User[],
  products: ProductObject[]
): void | ServerResponse => {
  // Check users exist
  if (users.length <= 0) {
    respondWith404UsersNotFound(response);
  }

  const accessToken = getValidToken(request);

  if (!accessToken) {
    return respondWith401Unauthorized(response);
  }

  /**
   * User connected to accessToken
   */
  const matchedUser = users.find(
    (user) => user.login.username == accessToken.username
  );

  if (!matchedUser) {
    return respondWith401Unauthorized(response);
  }

  // Update accessToken lastUpdated time
  updateAccessToken(accessToken.username);

  const addedProductToCart = postProductToCart(
    matchedUser.cart,
    products,
    request
  );

  if (!addedProductToCart) {
    response.writeHead(400, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: "Bad request - productId missing",
      })
    );
  }

  if (
    typeof addedProductToCart === "string" &&
    addedProductToCart === "Product exists in user cart"
  ) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage:
          "Product already exists in user's cart. Nothing changed",
      })
    );
  }

  if (typeof addedProductToCart === "string") {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: "Product not found",
      })
    );
  }

  // If no return at this point, addedProductToCart is proven to be the cart with the added product
  const newCart = addedProductToCart;

  matchedUser.cart = newCart;

  const newUsers = users.filter(
    (user) => user.login.username != matchedUser.login.username
  );

  newUsers.push(matchedUser);

  fs.writeFile(
    "./initial-data/users2.json",
    JSON.stringify(newUsers),
    (err: any) => {
      if (err) throw err;
    }
  );

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      responseCode: response.statusCode,
      responseMessage: "Product successfully added to cart",
    })
  );
};

const deleteProductFromUserCart = (
  request: Request,
  response: Response,
  users: User[],
  products: ProductObject[]
): void | ServerResponse => {
  // Check users exist
  if (users.length <= 0) {
    respondWith404UsersNotFound(response);
  }

  /**
   * accessToken object containing username, time when last updated, and 16-character uid token
   */
  const accessToken = getValidToken(request);

  if (!accessToken) {
    return respondWith401Unauthorized(response);
  }

  /**
   * User connected to accessToken
   */
  const matchedUser = users.find(
    (user) => user.login.username == accessToken.username
  );

  if (!matchedUser) {
    return respondWith401Unauthorized(response);
  }

  // Update accessToken lastUpdated time
  updateAccessToken(accessToken.username);

  const deletedProductFromCart = deleteProductFromCart(
    matchedUser.cart,
    products,
    request
  );

  if (!deletedProductFromCart) {
    response.writeHead(400, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: "Bad request",
      })
    );
  }

  if (typeof deletedProductFromCart === "string") {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: "Product not found",
      })
    );
  }

  const newCart = deletedProductFromCart;

  matchedUser.cart = newCart;

  const newUsers = users.filter(
    (user) => user.login.username != matchedUser.login.username
  );

  newUsers.push(matchedUser);

  fs.writeFile(
    "./initial-data/users2.json",
    JSON.stringify(newUsers),
    (err: any) => {
      if (err) throw err;
    }
  );

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      responseCode: response.statusCode,
      responseMessage: "Product deleted from cart",
    })
  );
};

const putProductQuantity = (
  request: Request,
  response: Response,
  users: User[],
  products: ProductObject[]
): void | ServerResponse => {
  // Check users exist
  if (users.length <= 0) {
    respondWith404UsersNotFound(response);
  }

  /**
   * accessToken object containing username, time when last updated, and 16-character uid token
   */
  const accessToken = getValidToken(request);

  if (!accessToken) {
    return respondWith401Unauthorized(response);
  }

  /**
   * User connected to accessToken
   */
  const matchedUser = users.find(
    (user) => user.login.username == accessToken.username
  );

  if (!matchedUser) {
    return respondWith401Unauthorized(response);
  }

  // Update accessToken lastUpdated time
  updateAccessToken(accessToken.username);

  const changedQuantity = changeProductQuantity(
    matchedUser.cart,
    products,
    request
  );

  if (!changedQuantity) {
    response.writeHead(400, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: "Bad request",
      })
    );
  }

  if (typeof changedQuantity === "string") {
    response.writeHead(404, { "Content-Type": "application/json" });
    return response.end(
      JSON.stringify({
        responseCode: response.statusCode,
        responseMessage: "Product not found",
      })
    );
  }

  const newCart = changedQuantity;

  matchedUser.cart = newCart;

  const newUsers = users.filter(
    (user) => user.login.username != matchedUser.login.username
  );

  newUsers.push(matchedUser);

  fs.writeFile(
    "./initial-data/users2.json",
    JSON.stringify(newUsers),
    (err: any) => {
      if (err) throw err;
    }
  );

  // Respond with updated product data from user's cart
  const productChanged = matchedUser.cart.find(
    (item) => item.id == request.params.productId
  );

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(
    JSON.stringify({
      responseCode: response.statusCode,
      responseMessage: productChanged,
    })
  );
};

export interface UserController {
  getUser: typeof getUser;
  postUserLogin: typeof postUserLogin;
  getUserCart: typeof getUserCart;
  postUserCart: typeof postUserCart;
  deleteProductFromUserCart: typeof deleteProductFromUserCart;
  putProductQuantity: typeof putProductQuantity;
}

module.exports = {
  getUser,
  postUserLogin,
  getUserCart,
  postUserCart,
  deleteProductFromUserCart,
  putProductQuantity,
};
