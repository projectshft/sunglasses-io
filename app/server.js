var http = require('http');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
var brand = require('./routes/brand')
let product = require('./routes/product');
let users = require('./routes/user')
const PORT = 3001;

const router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
    res.writeHead(200);
    router(req, res, finalHandler(req, res));
});

server.listen(PORT, error => {
    if (error) throw error;
    console.log(`server running on port ${PORT}`);
});

router.get ("/", (request, response) => {
    response.writeHead(200, { "Content-Type" : "text/html" });
    return response.end('<div>Sunglasses.io API</div>');
});
router.get("/api/brands", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brand.getBrands()));
});
router.get("/api/brands/:id/products", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" }); 
    return response.end(JSON.stringify(brand.getProducts(request.params.id)));
});
router.get("/api/products", (request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(product.getProducts()));
});
router.post("/api/login", (request, response) => {
    if (request.body.email && request.body.password) {
        // See if there is a user that has that username and password
        let user = users.getUsers().find((user)=>{
          return user.email == request.body.email && user.login.password == request.body.password;
        });
        if (user) {
          // Write the header because we know we will be returning successful at this point and that the response will be json
            response.writeHead(200);
            return response.end();
        } else {
          // When a login fails, tell the client in a generic way that either the username or password was wrong
          response.writeHead(401, "Invalid username or password");
          return response.end();
        }
    
      } else {
        // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
        response.writeHead(400, "Incorrectly formatted response");
        return response.end();
      }
      return response.end();
})

module.exports = server;