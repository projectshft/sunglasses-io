const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const url = require('url');

// State variables
let brands = [];
let products = [];
let users = [];
let accessTokens = [];

// setup router
let myRouter = Router();
myRouter.use(bodyParser.json());

const PORT = 3001;
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes

// setup server
let server =  http.createServer(function (request, response) {
  myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
  if (!error) {
    console.log(`Server running on ${PORT}`)
  } else {
    return console.log("Error on Server Startup: ", error);
  };

  // Load brands information into server
  fs.readFile("../initial-data/brands.json", "utf-8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
    console.log(`Server setup: ${brands.length} brands loaded successfully`);
  });

  // Load products information into server
  fs.readFile("../initial-data/products.json", "utf-8", (error, data) => {
    if (error) throw error;
    products = JSON.parse(data);
    console.log(`Server setup: ${products.length} products loaded successfully`);
  });

  // Load users information into server
  fs.readFile("../initial-data/users.json", "utf-8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
    console.log(`Server Setup: ${users.length} users loaded successfully`);
  });
});

// GET all the brands
myRouter.get("/brands", function(request, response) {
  if (!brands) {
    response.writeHead(404, "No Brands Found");
    return response.end();
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brands));
  }
})

// GET all products within a specific brand Id
myRouter.get("/brands/:id/products", function(request, response) {
  let brand = brands.find((brand) => {
    return brand.id == request.params.id
  });

  if (!brand) {
    response.writeHead(404, "No Brand Products Found");
    return response.end();
  };

  let productsByBrandId = products.filter((product) => {
    return product.categoryId == request.params.id
  });

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(productsByBrandId));
});

// GET all products
myRouter.get("/products", function(request, response) {
  if (!products) {
    response.writeHead(404, "No Products Found");
    return response.end();
  } else {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(products));
  }
});

// POST login
myRouter.post("/login", function(request, response) {
  if (request.body.username && request.body.password) {
    
    let user = users.find((user) => {
      return (
        (user.login.username == request.body.username) &&
        (user.login.password == request.body.password)
      );
    });
  
    if (user) {
      response.writeHead(200, { "Content-Type": "application/json" });
      let currentUserAccessToken = accessTokens.find((accessTokenUser) => {
        return accessTokenUser.username == user.login.username;
      });
  
      if (currentUserAccessToken) {
        currentUserAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(currentUserAccessToken.token));
      } else {
        let currentUserNewAccessToken = {
          username: user.login.username,
          lastUpdated: new Date(),
          token: uid(16)
        };
        accessTokens.push(currentUserNewAccessToken);
        return response.end(JSON.stringify(currentUserNewAccessToken));
      }
    } else {
      response.writeHead(401, "Unauthorized Login Username and/or Password");
      return response.end();
    }
  } else {
    response.writeHead(400, "Invalid Login Username and/or Password");
    return response.end();
  }
});

// function after valid login for access token
const getCurrentAccessToken = function(request) {
  const parsedUrl = require("url").parse(request.url, true);
  if (parsedUrl.query.accessToken) {
    let currentUserAccessToken = accessTokens.find((accessToken) => {
      return (
        accessToken.token == parsedUrl.query.accessToken && 
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
      );
    });

    if (currentUserAccessToken) {
      return currentUserAccessToken;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// GET login user's cart
myRouter.get("/me/cart", function(request, response) {
  let currentUserAccessToken = getCurrentAccessToken(request);
  
  if (!currentUserAccessToken) {
    response.writeHead(401, "Unauthorized Access, Login Required");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentUserAccessToken.username;
    });

    if (!user) {
      response.writeHead(401, "Unauthorized Access, Login Required");
      return response.end();
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  }
});

// POST product add to the login user's cart
myRouter.post("/me/cart", function(request, response) {
  let currentUserAccessToken = getCurrentAccessToken(request);
  
  if (!currentUserAccessToken) {
    response.writeHead(401, "Unauthorized Access, Login Required");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentUserAccessToken.username;
    });
    user.cart.push(request.body);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

// DELETE remove a product from the login user's cart
myRouter.delete("/me/cart/:productId", function(request, response) {
  let currentUserAccessToken = getCurrentAccessToken(request);

  if (!currentUserAccessToken) {
    response.writeHead(401, "Unauthorized Access, Login Required");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentUserAccessToken.username;
    });
    const { productId } = request.params;
    user.cart.filter((cart) => cart.id !=productId);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(user.cart));
  }
});

// POST edit and update product quantity in the login user's cart
myRouter.post("/me/cart/:productId", function(request, response) {
  let currentUserAccessToken = getCurrentAccessToken(request);

  if (!currentUserAccessToken) {
    response.writeHead(401, "Unauthorized Access, Login Required");
    return response.end();
  } else {
    let user = users.find((user) => {
      return user.login.username == currentUserAccessToken.username;
    });

    let product = products.find((product) => {
      const { productId } = request.params;
      return product.id == productId;
    });

    if (!product) {
      response.writeHead(404, "Product Not Found");
      return response.end();
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(user.cart));
    }
  }
});

module.exports = server;