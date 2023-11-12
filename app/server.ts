// TypeScript types
import { IncomingMessage } from "http";
import { ServerResponse } from "http";
import { Server } from "http";

// Module imports
const http = require("http");
const fs = require("fs");
const finalHandler = require("finalhandler");
const queryString = require("querystring");
const Router = require("router");
const bodyParser = require("body-parser");
const uid = require("rand-token").uid;

const PORT = 3001;

// Router setup
const router = Router();
router.use(bodyParser.json());

// Create server
const server: Server = http
  .createServer(function (request: IncomingMessage, response: ServerResponse) {
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error: any) => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }

    console.log(`Server is listening on ${PORT}`);
  });

// Routes
router.get("/", (request: IncomingMessage, response: ServerResponse) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end("Server is up and running");
});

// Exports
module.exports = server;
