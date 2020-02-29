var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
// var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
// var uid = require('rand-token').uid;
const PORT = 8080;

// State Holding Variables
let brands = [];

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

// declare server so it can be exported to the testing file
const server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }

    // Load initial brands
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });

    console.log(`Server is listening on ${PORT}`);

});

// Notice how much cleaner these endpoint handlers are...
myRouter.get('/api/brands', function (request, response) {
    // Return all books in the db
    response.writeHead(200, {
        "Content-Type": "application/json"
    });
    return response.end(JSON.stringify(brands));
});

// Used for testing
module.exports = server;