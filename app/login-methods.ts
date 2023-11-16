import { AccessToken, User } from "../types/type-definitions"
import { Request } from "express";

const urlParser = require("url");
const uid = require("rand-token").uid;

let accessTokensList: AccessToken[] = [{
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

const updateAccessToken = (username: string): void => {
  const newAccessTokensList = accessTokensList.filter((accessToken) => accessToken.username != username);
  const oldAccessToken = accessTokensList.find((accessToken) => accessToken.username == username);

  if (oldAccessToken) {
    const newAccessToken = {
      username: username,
      lastUpdated: new Date(),
      token: oldAccessToken.token
    };

    newAccessTokensList.push(newAccessToken)
    accessTokensList = newAccessTokensList;
  }
};

module.exports.getValidToken = getValidToken;
module.exports.updateAccessToken = updateAccessToken;

export type GetValidAccessToken = typeof getValidToken;
export type UpdateAccessToken = typeof updateAccessToken;
