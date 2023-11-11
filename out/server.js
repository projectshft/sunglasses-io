"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const PORT = 3001;
// Router setup
const router = Router();
router.use(bodyParser.json());
http.createServer(function (request, response) {
    router(request, response, finalHandler(request, response));
}).listen(PORT, (error) => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    console.log(`Server is listening on ${PORT}`);
});
router.get("/", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end("Server is up and running");
});
//# sourceMappingURL=server.js.map