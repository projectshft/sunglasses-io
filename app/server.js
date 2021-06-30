const http = require("http");
const finalHandler = require("finalhandler");
const url = require("url");
const Router = require("router");
const bodyParser = require("body-parser");

const Sunglasses = require("./models/sunglasses-store");
const Login = require("./models/login");
const brandData = require("./initial-data/brands.json");

let accessTokens = [];
let failedLoginAttempts = {};

const PORT = 3001;

const router = Router();
router.use(bodyParser.json());

const server = http
  .createServer((request, response) => {
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, (err) => {});

router.get("/api/brands", (request, response) => {
  response.writeHead(200, { "Content-Type": "application/json" });
  const getBrands = Sunglasses.getBrands();
  return response.end(JSON.stringify(getBrands));
});

router.get("/api/brands/:id/products", (request, response) => {
  const { id } = request.params;
  const brandId = brandData.find((brand) => brand.id == id);

  if (!brandId) {
    response.writeHead(404);
    return response.end("Brand Not Found");
  } else {
    const getBrandProducts = Sunglasses.getBrandProducts(id);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(getBrandProducts));
  }
});

router.get("/api/products", (request, response) => {
  const parsedUrl = url.parse(request.url, true);
  const query = parsedUrl.query.q;

  if (query.length === 0) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(Sunglasses.getAllProducts()));
  } else {
    let queryResults = Sunglasses.getProducts(query);
    if (queryResults.length > 0) {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(JSON.stringify(queryResults));
    } else {
      response.writeHead(404);
      return response.end("No Products Found");
    }
  }
});

router.post("/api/login", (request, response) => {
  let { username, password } = request.body;
  if (!username || !password) {
    response.writeHead(400);
    return response.end("Incorrectly formatted response");
  }

  if (
    username &&
    password &&
    Login.getNumOfFailedLoginRequestsForUsername(
      username,
      failedLoginAttempts
    ) < 3
  ) {
    let user = Login.findUserWithUsernameAndPassword(username, password);

    if (user) {
      failedLoginAttempts[username] = 0;
      let currentAccessToken = Login.findAccessToken(username, accessTokens);

      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(currentAccessToken.token));
      } else {
        let newAccessToken = Login.createNewAccessToken(username);
        accessTokens.push(newAccessToken);
        response.writeHead(200, { "Content-Type": "application/json" });
        return response.end(JSON.stringify(newAccessToken.token));
      }
    } else {
      let numFailedAttemptsForUser =
        Login.getNumOfFailedLoginRequestsForUsername(
          username,
          failedLoginAttempts
        );
      let increase = Login.increaseNumFailedAttemptsForUser(
        numFailedAttemptsForUser
      );
      failedLoginAttempts[username] = increase;

      response.writeHead(401);
      return response.end("Invalid username or password");
    }
  } else {
    if (
      Login.getNumOfFailedLoginRequestsForUsername(
        username,
        failedLoginAttempts
      ) >= 3
    ) {
      response.writeHead(401);
      return response.end("Too many failed attempts");
    }
  }
});

router.get("/api/me/cart", (request, response) => {
  let currentAccessToken = Login.getValidTokenFromRequest(
    request,
    accessTokens
  );
  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    let { username } = currentAccessToken;
    let cart = Sunglasses.getCart(username);
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(cart));
  }
});

router.post("/api/me/cart", (request, response) => {
  let currentAccessToken = Login.getValidTokenFromRequest(
    request,
    accessTokens
  );

  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    const userCart = Sunglasses.getCart(currentAccessToken.username);
    const product = Sunglasses.findProduct(request.body.id);

    if (!product) {
      response.writeHead(404);
      return response.end("Product Not Found");
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify(Sunglasses.addProduct(product, userCart))
      );
    }
  }
});

router.delete("/api/me/cart/:productId", (request, response) => {
  let currentAccessToken = Login.getValidTokenFromRequest(
    request,
    accessTokens
  );

  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    let { productId } = request.params;
    let userCart = Sunglasses.getCart(currentAccessToken.username);
    if (!Sunglasses.findProductInCart(productId, userCart)) {
      response.writeHead(404);
      return response.end("Product Not In Your Cart");
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify(Sunglasses.deleteProduct(productId, userCart))
      );
    }
  }
});

router.post("/api/me/cart/:productId", (request, response) => {
  let currentAccessToken = Login.getValidTokenFromRequest(
    request,
    accessTokens
  );
  let { quantity } = request.body;

  if (!currentAccessToken) {
    response.writeHead(401, "Authentication error");
    return response.end("Please log in again");
  } else {
    let userCart = Sunglasses.getCart(currentAccessToken.username);
    const { productId } = request.params;
    if (!Sunglasses.findProductInCart(productId, userCart)) {
      response.writeHead(404);
      return response.end("Product Not In Cart");
    } else {
      response.writeHead(200, { "Content-Type": "application/json" });
      return response.end(
        JSON.stringify(Sunglasses.updateProduct(productId, quantity, userCart))
      );
    }
  }
});

module.exports = server;
