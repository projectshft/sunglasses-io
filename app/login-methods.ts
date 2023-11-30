import { AccessToken, User } from "../types/type-definitions";
import { Request } from "express";

const urlParser = require("url");
const uid = require("rand-token").uid;

/**
 * Array of accessTokens - hard-coded for testing
 */
let accessTokensList: AccessToken[] = [
  {
    username: "yellowleopard753",
    lastUpdated: new Date(),
    token: "O0WnZSZ8hWlLOLX9",
  },
  {
    username: "lazywolf342",
    lastUpdated: new Date("November 14, 2023 03:24:00"),
    token: "zBC4odxxvEiz0iuO",
  },
  {
    username: "greenlion235",
    lastUpdated: new Date(),
    token: "eE6AanctxgKg9emy"
  },
  {
    username: "expireduser",
    lastUpdated: new Date("November 14, 2023 03:24:00"),
    token: "YG9IGRuNKc7fkZlt"
  }
];

/**
 * Time in milliseconds until accessToken expires == 15 minutes
 */
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

/**
 * Retrieves a valid accessToken object that matches accessToken in query
 * @param {Request} request Express server request
 * @returns {null} null if no accessToken is found
 * @returns {AccessToken} matchedAccessToken if accessToken is present in accessTokensList and has not expired
 */
const getValidToken = (request: Request): null | AccessToken => {
  const parsedUrl = urlParser.parse(request.url, true);

  if (!parsedUrl.query.accessToken) {
    return null;
  }

  const matchedAccessToken = accessTokensList.find((accessToken) => {
    return (
      accessToken.token == parsedUrl.query.accessToken &&
      Number(new Date()) - Number(accessToken.lastUpdated) < SESSION_TIMEOUT
    );
  });

  if (!matchedAccessToken) {
    return null;
  }

  return matchedAccessToken;
};

/**
 * Updates the lastUpdated property of a user's accessToken to the current time
 * @param {string} username
 */
const updateAccessToken = (username: string): AccessToken => {
  const newAccessTokensList = accessTokensList.filter(
    (accessToken) => accessToken.username != username
  );
  const oldAccessToken = accessTokensList.find(
    (accessToken) => accessToken.username == username
  );

  if (oldAccessToken) {
    const updatedAccessToken = {
      username: username,
      lastUpdated: new Date(),
      token: oldAccessToken.token,
    };

    newAccessTokensList.push(updatedAccessToken);
    accessTokensList = newAccessTokensList;

    return updatedAccessToken;
  }

  // Create a new accessToken if no old one exists for user
  const newAccessToken = {
    username: username,
    lastUpdated: new Date(),
    token: uid(16),
  };

  newAccessTokensList.push(newAccessToken);
  accessTokensList = newAccessTokensList;

  return newAccessToken;
};

module.exports.getValidToken = getValidToken;
module.exports.updateAccessToken = updateAccessToken;

export type GetValidAccessToken = typeof getValidToken;
export type UpdateAccessToken = typeof updateAccessToken;
