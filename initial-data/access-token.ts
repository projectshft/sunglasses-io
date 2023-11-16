import { AccessToken } from "../types/type-definitions";

const uid = require("rand-token").uid;

const createNewAccessToken = (): AccessToken => {
  return {
    username: "yellowleopard753",
    lastUpdated: new Date(),
    token: uid(16)
  }
};


module.exports = createNewAccessToken;