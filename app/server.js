var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

const PORT = 3001;
//state variables
let brands = [];
let products = [];
let users = [];

// router setup
var myRouter = Router();
myRouter.use(bodyParser.json());


http.createServer((request, response) =>{
    router(request, response, finalHandler(request, response));
})
.listen(PORT, error =>{
    if (error) {
        return console.log("Error on Server Startup: ", error);
      }
      console.log(`Server is listening on ${PORT}`);
});

router.get("/", (request, response) =>{
    response.end("Nothing to see here")
});

//have to configure routes

// get /api/brands
router.get("/api/brands", (request, response) =>{
    fs.readFile("initial-data/brands.json", (error, data) =>{
        if(error) throw error;
        brands = JSON.parse(data);
        response.end(JSON.stringify(brands));
    });
});
