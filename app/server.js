var http = require("http");
var fs = require("fs");
var finalHandler = require("finalhandler");
var queryString = require("querystring");
var Router = require("router");
var bodyParser = require("body-parser");
var uid = require("rand-token").uid;
const url = require("url");

let brands = [];
let products = [];
let users = [];

let accessTokens = ["nZQ3lxORlCvXbLcE","cdH7Xhjw9tjwwXvz"];

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
      let newToken = uid(16)
      user.login.accessToken = newToken;
      accessTokens.push(newToken)
      response.writeHead(200, "You have sucessfully logged in!"); 
      response.end()
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
let user = users.find((user) => {
  let match = accessTokens.find((token) => {
    return token == user.login.accessToken
  })
  return match
})

if(user){
  response.writeHead(200, { 'Content-Type':'application/json' })
  response.end(JSON.stringify(user.cart))
} else {
  response.writeHead(401, "You need to be logged in to access this")
  response.end()
}
});

myRouter.post("/api/me/cart", (request, response) => {
  let user = users.find((user) => {
    let match = accessTokens.find((token) => {
      return token == user.login.accessToken
    })
    return match
  })

  if(user){
    response.writeHead(200, { 'Content-Type':'application/json' });
    let foundItem = products.find((item) => {
      return item.id == request.body.productId
    })
    user.cart.push(foundItem)
    response.end(JSON.stringify(user.cart))
  }else {
    response.writeHead(401, "You need to be logged in to access this")
    response.end()
  }
});

myRouter.delete("/api/me/cart/:productId", (request, response) => {
  response.writeHead(200, {'Content-Type':'application/json'})
  let user = users.find((user) => {
    let match = accessTokens.find((token) => {
      return token == user.login.accessToken
    })
    return match
  })

  user.cart.push(products[1]);
  user.cart.push(products[2]);
  user.cart.push(products[3]);
  
  let newCart = user.cart.filter((item) => {
    return item.id !== request.params.productId
  })

  response.end(JSON.stringify(newCart)); 
});  

myRouter.put("/api/me/cart/:productId", (request, response) => {
  response.writeHead(200, {'Content-Type':'application/json'})
  let user = users.find((user) => {
    let match = accessTokens.find((token) => {
      return token == user.login.accessToken
    })
    return match
  })

  if(user){
    response.writeHead(200, { 'Content-Type':'application/json' });
    let foundItem = products.find((item) => {
      return item.id == request.body.productId
    })
    let qty = request.body.qty
    for(let i = 0; i < qty; i++) {
      user.cart.push(foundItem)
    }
    response.end(JSON.stringify(user.cart))
  }else {
    response.writeHead(401, "You need to be logged in to access this")
    response.end()
  }

  response.end();
})

module.exports = server;
