import { AccessToken, User } from "../types/type-definitions"
import { Request } from "express";

const urlParser = require("url");
const uid = require("rand-token").uid;

const accessTokensList: AccessToken[] = [{
  username: "yellowleopard753",
  lastUpdated: new Date(),
  token: "O0WnZSZ8hWlLOLX9"
}]; // hard code example data for now

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

const getValidToken = (
  request: Request
  // accessTokensList: AccessToken[]
): null | AccessToken => {
  const parsedUrl = urlParser.parse(request.url, true);

  if (!parsedUrl.query.accessToken) {
    return null;
  }

  const matchedAccessToken = accessTokensList.find((accessToken) => {
    return accessToken.token == parsedUrl.query.accessToken && (Number(new Date) - Number(accessToken.lastUpdated)) < SESSION_TIMEOUT;
  });

  if (!matchedAccessToken) {
    return null;
  }

  return matchedAccessToken;
};

module.exports.getValidToken = getValidToken;
export type GetValidAccessToken = typeof getValidToken
