import { Request, Response } from "express";
import {
  BrandObject,
  ProductObject,
  User,
  ProductInCart,
} from "../../types/type-definitions";
import { GetValidAccessToken, UpdateAccessToken } from "../login-methods";
import { ServerResponse } from "http";

const getValidToken: GetValidAccessToken =
  require("../login-methods.ts").getValidToken;
const updateAccessToken: UpdateAccessToken =
  require("../login-methods.ts").updateAccessToken;

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

export interface UserController {
  getUser: typeof getUser;
}

module.exports = {
  getUser,
};
