var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const newAccessToken = uid(32);

// stand in variables for dummy api values
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

// setup router
var myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = 3001;


let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
    products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
    users = JSON.parse(fs.readFileSync("./initial-data/users.json","utf-8"));
   
    
});

myRouter.get('/brands', function(request,response) {    
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brands));
}); 

myRouter.get('/products', function(request,response) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(products));
});


// Multiple params destructured in order based on URL
myRouter.get('/brands/:id/products', function(request,response) {
    // const {ID1, ID2} = request.params  with a URL of brands/:ID1/products/:ID2
    const { id } = request.params;  //Will this pull the ":id" from the url?
    const product = products.find(product => product.id == id);

    if (!product) {
        response.writeHead(404, "That product does not exist");
        return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });  //Content-Type = [headers]
    return response.end(JSON.stringify(product));
});

myRouter.post('/login', (request,response) => {
    // See if there is a user that has that name and password
    if (request.body.username && request.body.password) {
        let user = users.find((user) => {
            return user.login.username == request.body.username && user.login.password == request.body.password;
        });
        if (user) {
            response.writeHead(200, { "Content-Type": "application/json" });
            let currentAccessToken = accessTokens.find((tokenObject) => {
                return tokenObject.username == user.login.username;
            });

            if (currentAccessToken) {
                currentAccessToken.lasUpdated = new Date();
                return response.end(JSON.stringify(currentAccessToken.token));
            } else {
                let newAccessToken = {
                    username: user.login.username,
                    lastUpdated: new Date(),
                    token: uid(32)                 
                }
                accessTokens.push(newAccessToken);
                return response.end(JSON.stringify(newAccesstoken.token));
            }
        } else {
            response.writeHead(401, "Invalid username or password");
            return response.end();
        }    
    } else {
        response.writeHead(400, "One or more parameters are missing");
        return response.end();
    }    
});



module.exports = server;