var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;

const PORT = 3001;

const state = {
  brands: [],
  products: [],
  users: [],
  accessTokens: [],
};

//Setup Initial State
fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
  if (error) throw error;
  state.brands = JSON.parse(data);
});

fs.readFile("initial-data/products.json", "utf8", (error, data) => {
  if (error) throw error;
  state.products = JSON.parse(data);
});

fs.readFile("initial-data/users.json", "utf8", (error, data) => {
  if (error) throw error;
  state.users = JSON.parse(data);
});

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }

    console.log(`Server is listening on ${PORT}`);
  });

myRouter.get("/api/brands", (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(state.brands));
});

myRouter.get("/api/brands/:id/products", (req, res) => {
  const id = req.params.id;

  if (!state.brands.some((brand) => brand.id === id)) {
    res.writeHead(404, "Brand not found");
    res.end();
  }

  const productsForBrand = state.products.filter(
    (product) => product.categoryId === id
  );

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(productsForBrand));
});

myRouter.get("/api/products", (req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(state.products));
});

myRouter.post("/api/login", (req, res) => {
  if (req.body.username && req.body.password) {
    let user = state.users.find((user) => {
      return (
        user.login.username == req.body.username &&
        user.login.password == req.body.password
      );
    });
    if (user) {
      res.writeHead(200, { "Content-Type": "application/json" });

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = state.accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      // Update the last updated value so we get another time period
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return res.end(JSON.stringify(currentAccessToken.token));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        state.accessTokens.push(newAccessToken);
        return res.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      res.writeHead(401, "Invalid username or password");
      return res.end();
    }
  } else {
    // If they are missing one of the parameters, tell the client that something was wrong in the formatting of the response
    res.writeHead(400, "Incorrectly formatted response");
    return res.end();
  }
});

module.exports = server;
