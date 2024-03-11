var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
const url = require("url");

//state holding variables
let brands = [];
let products = [];
let users = [];

const API_KEYS = [
  "7abd95d6-aezx-5242-e1zw-5bbd58f0cd6d",
  "76531065-qmeh-5985-uzgw-7aa506f263be",
];
let accessTokens = [];

const PORT = 8000;
const hostname = "localhost";

let myRouter = Router();
myRouter.use(bodyParser.json());

let server = http
  .createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response));
  })
  .listen(PORT, () => {
    fs.readFile("./initial-data/brands.json", "utf8", function (error, data) {
      if (error) throw error;
      brands = JSON.parse(data);
    });
    fs.readFile("./initial-data/products.json", "utf8", function (error, data) {
      if (error) throw error;
      products = JSON.parse(data);
    });
    fs.readFile("./initial-data/users.json", "utf8", function (error, data) {
      if (error) throw error;
      users = JSON.parse(data);
    });
    console.log(`Server is listening on http://${hostname}:${PORT}`);
  });

myRouter.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brands));
});

myRouter.get("/api/brands/:id/products", (request, response) => {
  let brandId = request.params.id;

  let requestedProduct = products.find((item) => {
    return item.id == brandId;
  });

  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(requestedProduct));
});

myRouter.get("/api/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(products));
});

myRouter.post("/api/login", (request, response) => {
  if (request.body.username && request.body.password) {
    let user = users.find((user) => {
      return (
        user.login.username == request.body.username &&
        user.login.password == request.body.password
      );
    });
    if (user) {
      let presentAccessToken = accessTokens.find((tokenObject) => {
        return tokenObject.username == user.login.username;
      });

      response.writeHead(200, "You have sucessfully logged in!");
      console.log("access Tokens array:", accessTokens);
      if (presentAccessToken) {
        presentAccessToken.lastUpdated = new Date();
        return response.end(JSON.stringify(presentAccessToken.token));
      } else {
        let newAccessToken = {
          username: request.body.username,
          lastUpdated: new Date(),
          token: uid(16),
        };
        accessTokens.push(newAccessToken);
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      response.writeHead(401, "Username or password is incorrect");
      response.end();
    }
  } else {
    response.writeHead(400, "You must have both fields filled out");
    return response.end();
  }
});

myRouter.get("/api/me/cart", (request, response) => {
  if (request.body.token) {
    let presentToken = accessTokens.find((tokenObj) => {
      return tokenObj.token == request.body.token;
    });
    if (!presentToken) {
      response.writeHead(401, "Unauthorized! Please log in to view your cart.");
      response.end();
    } else {
      response.writeHead(200, "authToken recieved");
      let foundUser = users.find((user) => {
        return user.login.username == presentToken.username;
      });
      response.end(JSON.stringify(foundUser.cart));
    }
  } else {
    response.writeHead(401, "Unauthorized! Please log in to view your cart");
    return response.end();
  }
});

myRouter.post("/api/me/cart", (request, response) => {
  let reqParams = queryString.parse(url.parse(request.url).query);

  if (reqParams.accessToken) {
    let presentToken = accessTokens.find((tokenObj) => {
      return tokenObj.token == reqParams.accessToken;
    });
    if (!presentToken) {
      response.writeHead(
        401,
        "Unauthorized! Please log in to access your cart"
      );
      response.end();
    } else {
      response.writeHead(200, "You have added a new item to your cart!");

      let foundUser = users.find((user) => {
        return user.login.username == presentToken.username;
      });

      let requestedProduct = products.find((item) => {
        return request.body.id == item.id;
      });

      const newCart = foundUser.cart;
      newCart.push(requestedProduct);
      console.log(newCart);

      response.end(JSON.stringify(newCart));
    }
  }
});

myRouter.delete("/api/me/cart/:productId", (request, response) => {
  response.writeHead(200, {"Content-Type":"application/json"});

  if(request.body.accessToken){
    let presentToken = accessTokens.find((tokenObj) => {
      return tokenObj.token == request.body.accessToken
    })
    if(!presentToken){
      response.writeHead(401, "Unauthorized! Please log in to access your cart");
      response.end()
    } else {
      response.writeHead(200, "Auth token found! You may proceed to delete the selected item from your cart")

      let foundUser = users.find((user) => {
        return user.login.username == presentToken.username;
      });

      let updatedList = foundUser.cart.filter((item) => {
        return item.id !== request.params.productId
      })

      console.log(updatedList)

      return response.end(JSON.stringify(updatedList))
    }
  }
  response.end(); 
 });  

myRouter.put("/api/me/cart/:productId", (request, response) => {
  if(!request.body.accessToken){
    response.writeHead(401, "Unauthorized")
    response.end()
  }

  if(request.body.accessToken){
    let presentToken = accessTokens.find((tokenObj) => {
      return tokenObj.token == request.body.accessToken
    })
    if(!presentToken){
      response.writeHead(401, "Unauthorized! Please log in to access your cart");
      response.end()
    } else {
      response.writeHead(200, "Auth token found! You may proceed to update your cart")

      let foundUser = users.find((user) => {
        return user.login.username == presentToken.username;
      });//does foundUser find the proper user? [CHECK]
      // console.log(foundUser)
      
      //search cart and add one of the items from that selection

      let foundItem = foundUser.cart.find((item) => {
        return item.id == request.params.productId
      })// is this function returning the correct item?? [CHECK]
      console.log("update cart found item", foundItem)

      if(foundItem) {
        
      }
      // if(!foundItem){
      //   response.end("No items found")
      // } else {
      //   let newCart = foundUser.cart.push(foundItem)
      //   return response.end(JSON.stringify(newCart))
      // }


      // console.log(requestedItem)

      // let cart = foundUser.cart

      // cart.push(requestedItem)

      // response.end(JSON.stringify(updatedList)) updatedList is returning 1 instead of the array of items that we just fucking searched for...???
    }
  }

  response.end();
})

module.exports = server;
