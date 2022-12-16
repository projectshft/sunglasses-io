const http = require("http");
const finalHandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");
const port = 3001;
var myRouter = Router();
myRouter.use(bodyParser.json());
const fs = require("fs");

let products = [];
let users = []
let brands = [];
let accessTokens = ["a8be2a69c8c91684588f4e1a29442dd7"];

let server = http.createServer((request, response) => {
  myRouter(request, response, finalHandler(request, response));
}).listen(port, error => {
    if (error) {
      return constol.log("error on startup: ", error);
    }

    fs.readFile("products.json", "utf-8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`)
    });

    fs.readFile("users.json", "utf-8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });

    console.log(`Server is listening on port ${port}!`);

    
  })


myRouter.get("/products", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});










myRouter.post("/login", function (request, response) {
  let user = users.find((users) => users.login.username == request.body.username);

  if (user == null) {
    response.writeHead(404);
    response.end();
  }

  response.writeHead(200, {
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(user));
});








myRouter.get("/me/cart", function (request, response) {
  let user = users.find((users) => users.login.md5 == request.headers["auth"])
  
  if (!user) {
    response.writeHead(401);
    response.end("not logged in");
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});






myRouter.post("/me/cart", function (request, response) {
  let user = users.find((users) => users.login.md5 == request.headers["auth"]);
  if (!user) {
    response.writeHead(401);
    response.end("not logged in");
  }
  
  user.cart.push(request.body);

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});







myRouter.put("/me/cart/:id", function (request, response) {
  let user = users.find((users) => users.login.md5 == request.headers["auth"]);
  if (!user) {
    response.writeHead(401);
    response.end("not logged in");
  }

  let updatedItem = request.body;
  let item = user.cart.find((item) => item.pair.id == request.body.pair.id);
  Object.assign(item, updatedItem);

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(user.cart));
});





myRouter.delete("/me/cart/:id", function (request, response) {
  let user = users.find((users) => users.login.md5 == request.headers["auth"]);
  if (!user) {
    response.writeHead(401);
    response.end("not logged in");
  }

  user.cart.filter((item) => item.pair.id !== request.params.id)

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(user.cart));
});





myRouter.get("/brands", function (request, response) {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});





myRouter.get("/brands/:id/products", function (request, response) {
  const foundpairs = products.filter(
    (pair) => pair.brandId === request.params.id
  );

  if (!foundpairs) {
    response.writeHead(404);
    return response.end("pair Not Found");
  }

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(foundpairs));
});





module.exports = server;
