const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser = require('body-parser');
const url = require('url');
const { uid } = require('rand-token');

const PORT = process.env.PORT || 5000;

// token timeout after 15 minutes
const TOKEN_VALIDITY_TIMEOUT = 1440 * 60 * 1000;

// access tokens object array
const accessTokens = [];

// set varaibles to be accessed inside functions
let brands = [];
let products = [];
let cart = [];

const writeHead = { 'Content-Type': 'application/json' };

const router = Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// Create server
const server = http.createServer((req, res) => {
  router(req, res, finalHandler(req, res));
});

// server listening

if (!module.parent) {
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`Server running on http://localhost:${PORT}`);

    brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));
    products = JSON.parse(
      fs.readFileSync('initial-data/products.json', 'utf-8')
    );
    cart = JSON.parse(fs.readFileSync('initial-data/cart.json', 'utf-8'));
  });
}

// helper function for token in request and token timeout
const getValidTokenFromRequest = function (req) {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.query.validToken) {
    // Verify the access token to make sure it's valid and not expired
    const currentAccessToken = accessTokens.find(
      (accessToken) =>
        accessToken.token == parsedUrl.query.validToken &&
        new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
    );

    if (currentAccessToken) {
      return currentAccessToken;
    }
    return null;
  }
  return null;
};

router.get('/api', (request, response) => {
  response.writeHead(200).end('Hello World!');
});

// get all the brands
router.get('/api/brands', (req, res, err) => {
  let brandsToReturn = [];
  brandsToReturn = brands;

  if (!brandsToReturn) {
    res.writeHead(404, 'No brands found');
  } else {
    res.writeHead(200).end(JSON.stringify(brandsToReturn));
  }
});

// gets the products with the same brand id
// example will get all oakley products
router.get('/api/brands/:brandId/products', (req, res) => {
  const { brandId } = req.params;
  const productsForBrand = products.filter((pro) => pro.brandId === brandId);

  if (!brandId) {
    return res.writeHead(404, 'No products found with that brand Id').res.end();
  }
  return res
    .writeHead(200, 'Content-Type', 'application/json')
    .end(JSON.stringify(productsForBrand));
});

// gets all the products
router.get('/api/products', (req, res) => {
  let productsToReturn = [];
  productsToReturn = products;
  return res.writeHead(200, writeHead).end(JSON.stringify(productsToReturn));
});

// logins the user in after checking if they are in database
router.post('/api/login', (req, res) => {
  const users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));
  if (req.body.username && req.body.password) {
    const user = users.find(
      (userI) =>
        userI.login.username === req.body.username &&
        userI.login.password === req.body.password
    );

    // if there is a user and its true
    if (user) {
      // see if there is an access token already stored
      const currAccessToken = accessTokens.find(
        (tokenI) => tokenI.username == user.login.username
      );

      // if there is an existing access token just update the date
      if (currAccessToken) {
        currAccessToken.lastUpdated = new Date();
        return res
          .writeHead(200, writeHead, 'success')
          .end(JSON.stringify(currAccessToken.token));
      }

      const newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(newAccessToken);
      return res
        .writeHead(200, writeHead)
        .end(JSON.stringify(newAccessToken.token));
    }
    // else if the either fields do not match give a general error

    return res.writeHead(401, 'Incorrect username or password').end();
  }
  return res
    .writeHead(400, 'Invalid inputs please fill out inputs correctly')
    .end();
});

// gets the current cart
router.get('/api/me/cart', (req, res) => {
  const currentAccessToken = getValidTokenFromRequest(req);

  if (!currentAccessToken) {
    return res
      .writeHead(
        401,
        'You need to have a valid access token to access this call'
      )
      .end();
  }

  cart = JSON.parse(fs.readFileSync('initial-data/cart.json', 'utf-8'));

  return res.writeHead(200, writeHead).end(JSON.stringify(cart));
});

// adds a product to the cart with product id
router.post('/api/me/cart/:productId', (req, res) => {
  // runs helper function for access token
  const currentAccessToken = getValidTokenFromRequest(req);
  // checks the argument is false
  if (!currentAccessToken) {
    return res
      .writeHead(
        401,
        'You need to have a valid access token to access this call'
      )
      .end();
  }

  // grab the query parameter
  const { productId } = req.params;

  // gets the current cart
  const currentCart = JSON.parse(
    fs.readFileSync('initial-data/cart.json', 'utf-8')
  );

  // gets the products
  const products = JSON.parse(
    fs.readFileSync('initial-data/products.json', 'utf-8')
  );

  // finds our associated products
  const getProduct = products.find((i) => i.id == productId);

  // gets the correct item in the cart
  const updatedCart = currentCart.find((i) => i.id == getProduct.id);

  // if there is no item in the cart then add it and write it
  if (!updatedCart) {
    getProduct.quantity = 1;

    currentCart.push(getProduct);

    const jsonCart = JSON.stringify(currentCart);

    fs.writeFile('initial-data/cart.json', jsonCart, 'utf8', () => {});
    return res.writeHead(200, writeHead).end(JSON.stringify(currentCart));
  }

  // else there is an existing item in cart then update the quantity and send and write it to cart
  const changeItemInCartIndex = currentCart.findIndex(
    (i) => i.id == updatedCart.id
  );

  currentCart[changeItemInCartIndex].quantity += 1;

  const jsonCart = JSON.stringify(currentCart);

  fs.writeFile('initial-data/cart.json', jsonCart, 'utf8', () => {});

  return res.writeHead(200, writeHead).end(jsonCart);
});

// deletes an item from the cart
router.delete('/api/me/cart/:productId', (req, res) => {
  // runs helper function for access token
  const currentAccessToken = getValidTokenFromRequest(req);
  // checks if the argument is false
  if (!currentAccessToken) {
    return res
      .writeHead(
        401,
        'You need to have a valid access token to access this call'
      )
      .end();
  }

  // gets the query parameter
  const { productId } = req.params;

  // gets the current cart
  let currentCart = JSON.parse(
    fs.readFileSync('initial-data/cart.json', 'utf-8')
  );

  // gets the product of the current cart
  const getProduct = currentCart.find((pro) => pro.id == productId);
  // filters the cart without the product id we want to delete
  const filterCart = currentCart.filter((data) => data.id !== productId);

  // if there is a product that matches
  if (getProduct) {
    // make the current cart = to the filtered cart
    currentCart = filterCart;

    // make updated cart into json format
    const json = JSON.stringify(currentCart);

    // write the current cart to database
    fs.writeFile('initial-data/cart.json', json, 'utf8', () => {});

    return res.writeHead(200, writeHead).end(json);
  }

  return res.writeHead(400, writeHead).end('product not found');
});

module.exports = server;
