var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
var url = require("url");
const header = { "Content-Type": "application/json" };
const PORT = 3001;
let accessTokens = [
  { email: "natalia.ramos@example.com", token: "Qr2vWo9yEcJxFUm6" },
  { email: "salvador.jordan@example.com", token: "j39dcl12mdksd365" }
];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

http
  .createServer(function(request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, error => {
    if (error) {
      return console.log("Error on Server Startup: ", error);
    }
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
      if (error) throw error;
      brands = JSON.parse(data);
      console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
      if (error) throw error;
      products = JSON.parse(data);
      console.log(`Server setup: ${products.length} products loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
  });

//Returning all brands
myRouter.get("/api/brands", function(request, response) {
  response.writeHead(200, "Successful operation", header);
  response.end(JSON.stringify(brands));
});

//Returning all products based on brandId
myRouter.get("/api/brands/:brandId/products", function(request, response) {
  requestedId = parseInt(request.params.brandId);
  //All valid ids should be capable of being parsed to an int. If the input is NaN we know it's bad input.
  if (isNaN(requestedId) || requestedId < 1) {
    response.writeHead(400, "Invalid brandId supplied");
    response.end();
  }
  //Checking brands data to see if brandId exists.
  requestedBrandProducts = products.filter(
    product => product.categoryId === request.params.brandId
  );
  if (requestedBrandProducts.length != 0) {
    response.writeHead(200, "Successful operation", header);
    response.end(JSON.stringify(requestedBrandProducts));
  } else {
    response.writeHead(404, "Brand id not found");
    response.end();
  }
});

//Returning all products if no query string. If query exists then we search brands and products for a match.
myRouter.get("/api/products", function(request, response) {
  const queryData = url.parse(request.url).query;
  searchString = queryString.parse(queryData);
  if (Object.keys(searchString).length === 0) {
    response.writeHead(200, "Successful operation", header);
    response.end(JSON.stringify(products));
  }
  //Since call has query data, check to see if length is as specified.
  if (searchString.query.length >= 1 && searchString.query.length <= 50) {
    //Search brands to get relevant brandId
    brandId = brands.find(
      brand => brand.name.toLowerCase() == searchString.query.toLowerCase()
    );
    //Search products for results
    if (brandId) {
      results = products.filter(product => product.categoryId == brandId.id);
      response.writeHead(200, "successful operation", header);
      response.end(JSON.stringify(results));
    } else {
      results = products.filter(
        product =>
          product.name.toLowerCase() == searchString.query.toLowerCase()
      );
      if (results.length > 0) {
        response.writeHead(200, "successful operation", header);
        response.end(JSON.stringify(results));
      } else {
        response.writeHead(404, "No results found.");
        response.end();
      }
    }
    //query length was not valid
  } else {
    response.writeHead(400, "Invalid search");
    response.end();
  }
});

myRouter.post("/api/login", function(request, response) {
  if (request.body.email && request.body.password) {
    let user = users.find(user => {
      return (
        user.email == request.body.email &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      // Write the header because we know we will be returning successful at this point and that the response will be json
      response.writeHead(200, "Login successful", header);

      // We have a successful login, if we already have an existing access token, use that
      let currentAccessToken = accessTokens.find(tokenObject => {
        return tokenObject.email == user.email;
      });

      // If token already exists, return it
      if (currentAccessToken) {
        response.end(JSON.stringify({ token: currentAccessToken.token }));
      } else {
        // Create a new token with the user value and a "random" token
        let newAccessToken = {
          email: user.email,
          token: uid(16)
        };
        accessTokens.push(newAccessToken);
        response.end(JSON.stringify({ token: newAccessToken.token }));
      }
    } else {
      response.writeHead(401, "Invalid username or password");
      response.end();
    }
  }
});

myRouter.get("/api/me/cart", function(request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(403, "Not authorized. User must login to view cart.");
    response.end();
  } else {
    const currentUser = users.find(
      user => user.email == currentAccessToken.email
    );
    response.writeHead(200, "Successful operation", header);
    response.end(JSON.stringify(currentUser.cart));
  }
});

myRouter.post("/api/me/cart", function(request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(403, "Not authorized. User must login to update cart.");
    response.end();
  }
  requestedId = parseInt(request.body.productId);
  requestedQuantity = parseInt(request.body.quantity);
  if (
    isNaN(requestedId) ||
    requestedId < 1 ||
    isNaN(requestedQuantity) ||
    requestedQuantity < 1
  ) {
    response.writeHead(400, "Invalid productId or quantity", header);
    response.end();
  } else {
    targetIndex = users.findIndex(
      user => user.email == currentAccessToken.email
    );
    targetCart = users[targetIndex].cart.findIndex(
      product => request.body.productId == product.productId
    );
    if (targetCart != -1) {
      users[targetIndex].cart[targetCart] = request.body;
      response.writeHead(200, "Successful operation", header);
      response.end(JSON.stringify(users[2].cart[0]));
    } else {
      response.writeHead(404, "ProductId not found in cart", header);
      response.end();
    }
  }
});

myRouter.delete("/api/me/cart/:productId", function(request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(
      403,
      "Not authorized. User must login to delete items from the cart."
    );
    response.end();
  }

  requestedId = parseInt(request.params.productId);
  //All valid ids should be capable of being parsed to an int. If the input is NaN we know it's bad input.
  if (isNaN(requestedId) || requestedId < 1) {
    response.writeHead(400, "Invalid prouctdId supplied");
    response.end();
  }
  //Checking product data to see if productId exists.
  requestedProduct = products.find(
    product => product.id === request.params.productId
  );
  if (requestedProduct) {
    targetIndex = users.findIndex(
      user => user.email == currentAccessToken.email
    );
    checkExistingCartItem = users[targetIndex].cart.findIndex(
      item => item.productId == request.params.productId
    );
    if (checkExistingCartItem != -1) {
      //productId found, delete array element
      users[targetIndex].cart.splice(checkExistingCartItem, 1);
      response.writeHead(200, "Successful operation", header);
      response.end(JSON.stringify(users[targetIndex].cart));
    } else {
      //productId not found in cart
      response.writeHead(404, "ProductId not found", header);
      response.end();
    }
  } else {
    //productId not found in db
    response.writeHead(404, "ProductId not found");
    response.end();
  }
});

myRouter.post("/api/me/cart/:productId", function(request, response) {
  let currentAccessToken = getValidTokenFromRequest(request);
  if (!currentAccessToken) {
    // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
    response.writeHead(
      403,
      "Not authorized. User must login to add items to cart."
    );
    response.end();
  }

  requestedId = parseInt(request.params.productId);
  //All valid ids should be capable of being parsed to an int. If the input is NaN we know it's bad input.
  if (isNaN(requestedId) || requestedId < 1) {
    response.writeHead(400, "Invalid prouctdId supplied");
    response.end();
  }
  //Checking product data to see if productId exists.
  requestedProduct = products.find(
    product => product.id === request.params.productId
  );
  if (requestedProduct) {
    targetIndex = users.findIndex(
      user => user.email == currentAccessToken.email
    );
    checkExistingCartItem = users[targetIndex].cart.findIndex(
      item => item.productId == request.params.productId
    );
    if (checkExistingCartItem == -1) {
      users[targetIndex].cart.push({
        productId: requestedProduct.id,
        quantity: "1"
      });
      response.writeHead(200, "Successful operation", header);
      response.end(JSON.stringify(users[targetIndex].cart));
    } else {
      //item already in cart, increment quantity. Should fix numbers to be actual numbers if i have time...
      currentQuantity = parseInt(
        users[targetIndex].cart[checkExistingCartItem].quantity
      );
      newQuantity = currentQuantity += 1;
      users[targetIndex].cart[
        checkExistingCartItem
      ].quantity = currentQuantity.toString();
      response.writeHead(200, "Successful operation", header);
      response.end(JSON.stringify(users[targetIndex].cart));
    }
  } else {
    response.writeHead(404, "Product id not found in cart");
    response.end();
  }
});

// Helper method to process access token
var getValidTokenFromRequest = function(request) {
  var parsedUrl = require("url").parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    // Verify the access token to make sure it's valid and not expired
    let currentAccessToken = accessTokens.find(accessToken => {
      return accessToken.token == parsedUrl.query.accessToken;
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
