const http = require('http');
const url = require('url');
const finalHandler = require('finalhandler');
const Router = require('router');
const bodyParser = require('body-parser');

const {
  validateLogin,
  getCurrentToken,
  getValidTokenFromRequest,
  getValidUserFromToken,
  brands,
  products
} = require('./helper.js');

const PORT = 3001;
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept, X-Authentication',
  'Content-Type': 'application/json'
};

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http
  .createServer((request, response) => {
    // Handle CORS Preflight request
    if (request.method === 'OPTIONS') {
      response.writeHead(200, HEADERS);
      response.end();
    }
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, error => {
    if (error) {
      return console.log('Error on Server Startup: ', error);
    }
    console.log(`Server is listening on port ${PORT}...`);
  });

// *** Brands GET
router.get('/api/brands', (request, response) => {
  if (!brands) {
    response.writeHead(404, 'Not found.', HEADERS);
    return response.end();
  }

  const URL = request.url;
  const { query } = url.parse(URL, true);
  const { limit } = query;

  if (!limit && limit !== undefined) {
    response.writeHead(400, 'Incorrectly formatted request', HEADERS);
    return response.end();
  }

  if (limit && !Number.isInteger(Number(limit))) {
    response.writeHead(400, 'Incorrectly formatted request', HEADERS);
    return response.end();
  }

  if (limit && Number.isInteger(Number(limit))) {
    const brandsRequested = brands.filter(brand => brands.indexOf(brand) < Number(limit));

    response.writeHead(200, HEADERS);
    return response.end(JSON.stringify(brandsRequested));
  }

  response.writeHead(200, HEADERS);
  response.end(JSON.stringify(brands));
});
// Brands GET products
router.get('/api/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;

  if (!brandId) {
    response.writeHead(400, 'Invalid request.', HEADERS);
    return response.end();
  }

  const result = products.filter(product => product.brandId === brandId);

  if (result.length === 0) {
    response.writeHead(404, 'No products with that brand ID found.', HEADERS);
    return response.end();
  }

  response.writeHead(200, HEADERS);
  response.end(JSON.stringify(result));
});
// *** Products GET
router.get('/api/products', (request, response) => {
  const URL = request.url;
  const { query } = url.parse(URL, true);
  const { search } = query;

  if (search) {
    let result = [];
    // check to see if search term is a brand name
    const brand = brands.find(b => b.name.toLowerCase() === search.toLowerCase());

    if (brand) {
      const resultFromBrandSearch = products.filter(product => product.brandId === brand.id);

      result = [...result, ...resultFromBrandSearch];

      response.writeHead(200, HEADERS);
      return response.end(JSON.stringify(result));
    }
    // Check to see if search term is in product name
    const resultFromNameSearch = products.filter(product =>
      product.name.toLowerCase().includes(search)
    );

    if (resultFromNameSearch.length !== 0) {
      result = [...result, ...resultFromNameSearch];
    }
    // Check to see if search term is in description
    const resultFromDescSearch = products.filter(product =>
      product.description.toLowerCase().includes(search)
    );

    if (resultFromDescSearch.length !== 0) {
      result = [...result, ...resultFromDescSearch];
    }

    if (!result) {
      response.writeHead(404, 'Unable to find products matching search criteria.', HEADERS);
    }

    response.writeHead(200, HEADERS);
    return response.end(JSON.stringify(result));
  }

  response.writeHead(200, HEADERS);
  response.end(JSON.stringify(products));
});
// *** Login POST
router.post('/api/login', (request, response) => {
  // Moved validation logic into a function
  const currentUser = validateLogin(request, response);

  // Write the header because we know we will be returning successful at this point and that the response will be json

  response.writeHead(200, 'Login successful', HEADERS);

  // If we already have an existing access token, use that

  const currentToken = getCurrentToken(currentUser);

  response.end(JSON.stringify({ token: currentToken.token }));
});

router.get('/api/me/cart', (request, response) => {
  const currentToken = getValidTokenFromRequest(request);

  if (!currentToken) {
    response.writeHead(401, 'Must be logged in to access the cart', HEADERS);
    return response.end();
  }
  // Find user with the provided token
  const currentUser = getValidUserFromToken(currentToken);

  if (!currentUser) {
    response.writeHead(401, 'Must be logged in to access the cart', HEADERS);
    return response.end();
  }

  const currentCart = currentUser.cart;

  response.writeHead(200, HEADERS);
  response.end(JSON.stringify(currentCart));
});

router.post('/api/me/cart/edit', (request, response) => {
  const URL = request.url;
  const { query } = url.parse(URL, true);
  const { productId, quantity } = query;

  if (!productId) {
    response.writeHead(400, 'Incorrectly formatted request', HEADERS);
    response.end();
  }
  if (!quantity) {
    response.writeHead(400, 'Incorrectly formatted request', HEADERS);
    response.end();
  }

  const currentToken = getValidTokenFromRequest(request);

  if (!currentToken) {
    response.writeHead(401, 'Must be logged in to access the cart', HEADERS);
    return response.end();
  }
  // Find user with the provided token
  const currentUser = getValidUserFromToken(currentToken);

  if (!currentUser) {
    response.writeHead(401, 'Must be logged in to access the cart', HEADERS);
    return response.end();
  }

  const currentCart = currentUser.cart;

  // Check if currentCart contains the productId
  const cartItem = currentCart.find(item => item.product.id === productId);

  if (!cartItem) {
    response.writeHead(404, 'Product not found', HEADERS);
    return response.end();
  }

  cartItem.quantity = parseInt(quantity);

  response.writeHead(200, 'Quantity successfully updated', HEADERS);
  response.end(JSON.stringify(currentCart));
});

router.post('/api/me/cart/:productId/add', (request, response) => {
  const { productId } = request.params;
  // Check if product ID exists
  if (!productId) {
    response.writeHead(400, 'Incorrectly formatted request', HEADERS);
    return response.end();
  }
  const productToAdd = products.find(product => product.id === productId);

  if (!productToAdd) {
    response.writeHead(404, 'Product not found', HEADERS);
    return response.end();
  }

  const currentToken = getValidTokenFromRequest(request);

  if (!currentToken) {
    response.writeHead(401, 'Must be logged in to access the cart', HEADERS);
    return response.end();
  }
  // Find user with the provided token
  const currentUser = getValidUserFromToken(currentToken);

  if (!currentUser) {
    response.writeHead(401, 'Must be logged in to access the cart', HEADERS);
    return response.end();
  }

  const currentCart = currentUser.cart;

  // See if item is in the cart already and update the quantity else add the item to the cart
  let cartItem = currentCart.find(item => item.product.id === productToAdd.id);

  if (cartItem) {
    cartItem.quantity += 1;
  }

  if (!cartItem) {
    cartItem = {
      quantity: 1,
      product: productToAdd
    };
    currentCart.push(cartItem);
  }

  response.writeHead(200, 'Product successfully added', HEADERS);
  response.end(JSON.stringify(currentCart));
});

router.delete('/api/me/cart/:productId/delete', (request, response) => {
  const { productId } = request.params;
  // Check if product ID exists
  if (!productId) {
    response.writeHead(400, 'Incorrectly formatted request', HEADERS);
    return response.end();
  }

  const currentToken = getValidTokenFromRequest(request);

  if (!currentToken) {
    response.writeHead(401, 'Must be logged in to access the cart', HEADERS);
    return response.end();
  }
  // Find user with the provided token
  const currentUser = getValidUserFromToken(currentToken);

  if (!currentUser) {
    response.writeHead(401, 'Must be logged in to access the cart', HEADERS);
    return response.end();
  }

  let currentCart = currentUser.cart;

  // Check if productId is in the user's cart
  const productToDelete = currentCart.find(item => item.product.id === productId);
  if (!productToDelete) {
    response.writeHead(404, 'Product not found', HEADERS);
    response.end();
  }

  // Filter the item from the cart
  currentCart = currentCart.filter(item => item.product.id !== productId);

  response.writeHead(200, 'Item successfully deleted', HEADERS);
  response.end(JSON.stringify(currentCart));
});

module.exports = { server, HEADERS };
