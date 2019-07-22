const http = require("http");
const finalHandler = require("finalhandler");
const Router = require("router");
const bodyParser = require("body-parser");
const brand = require("./routes/brand");
const product = require("./routes/product");
const users = require("./routes/user");
const accessToken = require("./routes/access-token");
const PORT = 3001;

//Initial router setup
const router = Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded());
router.use(bodyParser.urlencoded({
  extended: true
}))

//Inital server setup
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
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

//Route to get all the available brands
router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(brand.getBrands()));
});

//Route to get all the products associated with a provided brand ID
router.get("/api/brands/:id/products", (request, response) => {
  const currentProducts = product.getProducts(request.params.id);
  if (currentProducts.length > 0) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(currentProducts));
  }
  response.writeHead(400, "Invalid request");
  return response.end();
});

//Route to get all the available products
router.get("/api/products", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  return response.end(JSON.stringify(product.getProducts()));
});

//Route to login and provide a token
router.post("/api/login", (request, response) => {
  console.log(request.body)
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

//Route to get a user's cart
router.get("/api/me/cart", (request, response) => {
  let currentToken = request.body.token;
  if (currentToken) {
    const currentUser = users.findUserByEmail(
      accessToken.findUserByToken(currentToken)
    );
    if (currentUser) {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(currentUser.cart));
    }
    response.writeHead(401, "Invalid token");
    return response.end();
  }
  response.writeHead(400, "Incorrectly formatted response");
  return response.end();
});

// Route to update the quantity of an item in a user's cart
router.post("/api/me/cart", (request, response) => {
  let currentToken = request.body.token;
  let currentCartId = request.body.cartId;
  let quantity = request.body.quantity;
  if (currentToken && currentCartId && quantity) {
    const currentUser = users.findUserByEmail(
      accessToken.findUserByToken(currentToken)
    );
    if (currentUser) {
      if (!isNaN(currentCartId) && !isNaN(quantity)) {
        const updatedItem = users.changeQuantityOfCartItem(
          currentUser,
          currentCartId,
          quantity
        );
        if (updatedItem) {
          response.writeHead(200, { "Content-Type": "application/json" });
          return response.end(JSON.stringify(updatedItem));
        }
        response.writeHead(400, "Cart Item Does Not exist");
        return response.end();
      }
      response.writeHead(400, "Cart ID or Quantity are not numbers");
      return response.end();
    }
    response.writeHead(401, "Invalid token");
    return response.end();
  }
  response.writeHead(400, "Incorrectly formatted response");
  return response.end();
});

//Route to remove an item from a user's cart
router.delete("/api/me/cart/:productId", (request, response) => {
  let productId = request.params.productId;
  let currentToken = request.body.token;
  if (currentToken && productId) {
    let currentUser = users.findUserByEmail(
      accessToken.findUserByToken(currentToken)
    );
    if (currentUser) {
      if (!isNaN(productId)) {
        let cartItem = currentUser.cart.find(item => {
          return item.productId == productId || null;
        });
        if (cartItem) {
          let updatedCart = users.deleteCartItem(currentUser, cartItem);
          response.writeHead(200, { "Content-Type": "application/json" });
          return response.end(JSON.stringify(updatedCart));
        }
        response.writeHead(400, "Cart item does not exist");
        return response.end();
      }
      response.writeHead(400, "Product Id is not a number");
      return response.end();
    }
    response.writeHead(401, "Invalid token");
    return response.end();
  }
  response.writeHead(400, "Incorrectly formatted response");
  return response.end();
});

//Route to add an item to a user's cart
router.post("/api/me/cart/:productId", (request, response) => {
  let productId = request.params.productId;
  let currentToken = request.body.token;
  if (currentToken && productId) {
    let currentUser = users.findUserByEmail(
      accessToken.findUserByToken(currentToken)
    );
    if (currentUser) {
      if (!isNaN(productId)) {
        let cartItem = currentUser.cart.find(item => {
          return item.productId == productId || null;
        });
        if (!cartItem) {
          let productItem = product.getProducts(productId);
          if (productItem) {
            let updatedCart = users.addItemToCart(currentUser, productId);
            response.writeHead(200, { "Content-Type": "application/json" });
            return response.end(JSON.stringify(updatedCart));
          }
          response.writeHead(400, "Product does not exist");
          return response.end();
        }
        response.writeHead(400, "Item is already in cart");
        return response.end();
      }
      response.writeHead(400, "Product Id is not a number");
      return response.end();
    }
    response.writeHead(401, "Invalid token");
    return response.end();
  }
  response.writeHead(400, "Incorrectly formatted response");
  return response.end();
});

module.exports = server;
