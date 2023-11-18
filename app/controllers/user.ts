import { Request, Response } from "express";
import { User } from "../../types/type-definitions";
import { GetValidAccessToken, UpdateAccessToken } from "../login-methods";
import { ServerResponse } from "http";
import { GetCartContents } from "../cart-methods";

const getValidToken: GetValidAccessToken =
  require("../login-methods.ts").getValidToken;
const updateAccessToken: UpdateAccessToken =
  require("../login-methods.ts").updateAccessToken;
const getCartContents: GetCartContents =
  require("../cart-methods.ts").getCartContents;

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
};

export interface UserController {
  getUser: typeof getUser;
  postUserLogin: typeof postUserLogin;
  getUserCart: typeof getUserCart;
}

module.exports = {
  getUser,
  postUserLogin,
  getUserCart,
};
