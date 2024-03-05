let http = require("http");
let fs = require("fs");
const bodyParser = require("body-parser");
const queryString = require("querystring");
const url = require("url");
const finalHandler = require("finalhandler");
const Router = require("router");
// const jwt = require("jsonwebtoken");
const uid = require("rand-token").uid;
// const swaggerUi = require("swagger-ui-express");

// const YAML = require("yamljs");
// const swaggerDocument = YAML.load("./swagger.yaml");

const myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = process.env.port || 2121;

// Importing the data from JSON files
let users = require("../initial-data/users.json");
// let brands = require("../initial-data/brands.json");
const brands = require("../initial-data/brands.json");
const products = require("../initial-data/products.json");
let accessTokens = [
  {
    username: "yellowleopard753",
    lastUpdated: new Date(),
    token: "lUIzaixoK1Tr1A34",
  },
];
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

let signedInUser;

// UNABLE TO SERVE SWAGGER FILES DUE TO USING ROUTER AND HTTP INSTEAD OF EXPRESS FOR SERVER
// Swagger
// myRouter.use("/api-docs", () => {
//   swaggerUi.setup(swaggerDocument);
// });

// Starting the server
let server = http
  .createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`number of brands: ${brands.length}`);
    console.log(`number of products: ${products.length}`);
    console.log(`total users: ${users.length}`);
  });

myRouter.get("/brands", (request, response) => {
  if (brands.length === 0) {
    response.writeHead(404);
    response.end("no brands found");
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brands));
  }
});

myRouter.get("/brands/:brandId/products", (request, response) => {
  // get all products from a particular brand
  // filter only products with brand id of :id
  let brandProducts = products.filter((product) => {
    return product.categoryId == request.params.brandId;
  });

  if (brandProducts.length < 1) {
    response.writeHead(404, "Brand with that id does not exist");
    response.end("Not a valid brand");
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(brandProducts));
  }
});

myRouter.get("/products", (request, response) => {
  // filter products by name query if no query is provided all products will be listed
  const queryParams = queryString.parse(url.parse(request.url).query);
  let foundProducts;
  if (products.length === 0) {
    response.statusCode = 404;
    response.end("no found Products");
  } else if (queryParams.name) {
    foundProducts = products.filter((product) => {
      return product.name.includes(queryParams.name);
    });
    if (foundProducts < 1) {
      response.statusCode = 404;
      response.end("no matching products found");
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(foundProducts));
    }
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(products));
  }
});
//actually a post
myRouter.post("/login", (request, response) => {
  if (request.body.username && request.body.password) {
    let signedInUser = users.find((user) => {
      return (
        request.body.username == user.login.username &&
        request.body.password == user.login.password
      );
    });

    if (signedInUser) {
      response.writeHead(200, { "Content-type": "application/json" });
    } else {
      response.writeHead(401, "Invalid username or password");
      return response.end();
    }

    let currentAccessToken = accessTokens.find((tokenObject) => {
      return tokenObject.username == signedInUser.login.username;
    });
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();

      return response.end(JSON.stringify(currentAccessToken.token));
    } else {
      let newAccessToken = {
        username: signedInUser.login.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(newAccessToken);
      return response.end(JSON.stringify(newAccessToken.token));
    }
  } else {
    response.writeHead(400, "incorrectly formatted response");
    return response.end();
  }
});
const getValidTokenFromRequest = function (request) {
  let parsedUrl = require("url").parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure its valid and not expired
    let currentAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == parsedUrl.query.accessToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
    });
    if (currentAccessToken) {
      return currentAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

myRouter.get("/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401);
    response.end("user is not logged in");
  } else {
    response.writeHead(200, { "Content-type": "application/json" });
    // search for accessToken that matches and set them to the signed in user
    signedInUser = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });
    // respond with that user's cart
    response.end(JSON.stringify(signedInUser));
  }
});

myRouter.post("/me/cart", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401);
    response.end("user is not logged in");
  } else {
    signedInUser = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });

    let product = products.find((product) => {
      return product.id == request.body.id;
    });

    if (!product) {
      response.writeHead(404);
      response.end("product with that id not found");
    } else {
      response.writeHead(200, { "Content-type": "application/json" });

      let productInCart = signedInUser.cart.find((product) => {
        return product.id == request.body.id;
      });
      if (!productInCart) {
        response.writeHead(200, { "Content-type": "application/json" });
        signedInUser.cart.push({ productId: product.id, quantity: 1 });
      } else {
        productInCart.quantity += 1;
      }
      fs.writeFile(
        "./initial-data/users.json",
        JSON.stringify(users),
        (err) => {
          if (err) {
            throw err;
          } else {
            console.log("added to cart");
          }
        }
      );
    }

    response.end();
  }
});
//actually a delete
myRouter.delete("/me/cart/:productId", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401);
    response.end("user is not logged in");
  } else {
    signedInUser = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });

    let productToDelete = signedInUser.cart.find((product) => {
      return product.productId == request.params.productId;
    });

    if (!productToDelete) {
      response.writeHead(404);
      response.end("product not in cart");
    } else {
      response.writeHead(204);
      let productIndex = signedInUser.cart.indexOf(productToDelete);
      signedInUser.cart.splice(productIndex, 1);
      fs.writeFile(
        "./initial-data/users.json",
        JSON.stringify(users),
        (err) => {
          if (err) {
            throw err;
          } else {
            console.log("deleted from cart");
          }
        }
      );
      response.end();
    }
  }
});

//actually a post
myRouter.post("/me/cart/:productId", (request, response) => {
  let currentAccessToken = getValidTokenFromRequest(request);

  if (!currentAccessToken) {
    response.writeHead(401);
    response.end("user is not logged in");
  } else {
    signedInUser = users.find((user) => {
      return user.login.username == currentAccessToken.username;
    });

    let product = signedInUser.cart.find((product) => {
      return product.productId == request.params.productId;
    });
    if (!product) {
      response.writeHead(404);
      response.end("that product is not in your cart");
    } else {
      product.quantity = request.body.quantity;
      response.writeHead(200);
      fs.writeFile(
        "./initial-data/users.json",
        JSON.stringify(users),
        (err) => {
          if (err) {
            throw err;
          } else {
            console.log("added to cart");
          }
        }
      );

      response.end();
    }
  }
});

// Error handling
myRouter.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
module.exports = server;
