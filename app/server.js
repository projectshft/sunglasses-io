var http = require("http");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var brand = require("./routes/brand");
let product = require("./routes/product");
let users = require("./routes/user");
let accessToken = require("./routes/access-token")
const PORT = 3001;

//Initial router setup
const router = Router();
router.use(bodyParser.json());

//Inital server setup
const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, error => {
  if (error) throw error;
  console.log(`server running on port ${PORT}`);
});

//Root route displaying the name of the API
router.get("/api", (request, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });
  return response.end("<div>Sunglasses.io API</div>");
});

//Route to get
router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brand.getBrands()));
});
router.get("/api/brands/:id/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(product.getProducts(request.params.id)));
});
router.get("/api/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(product.getProducts()));
});
router.post("/api/login", (request, response) => {
  if (request.body.email && request.body.password) {
    let user = users.getUsers().find(user => {
      return (
        user.email == request.body.email &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });
      let currentToken = accessToken.findToken(user);
      if (!currentToken) {
        currentToken = accessToken.addToken(user);
      }
      return response.end(JSON.stringify(currentToken.token));
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Incorrectly formatted response");
    return response.end();
  }
});

module.exports = server;
