var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');

const PORT = 3001;

//State holding variables
let brands = [];
let products = [];
let users = [];
let cart = [];

//setup router
const router = Router();
router.use(bodyParser.json());

//create server
const server = http.createServer(function (req, res) {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, err => {
  if (err) throw err;
  console.log(`server running on port ${PORT}`);

  //populate brands
  brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf-8'));

  //populate products
  products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf-8'));

  //populate users
  users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf-8'));

  //populate cart
  cart = JSON.parse(fs.readFileSync('initial-data/cart.json', 'utf-8'));
});

const saveCurrentUser = (currentUser) => {
  // set hardcoded "logged in" user
  users[0] = currentUser;
  fs.writeFileSync("initial-data/users.json", JSON.stringify(users), "utf-8");
}

/*
-PATHS-
/brands,
/brands/id/products,
/products,
/login
/me/cart
/me/cart/{productId}
*/

router.get('/api/brands', (req, res) => {
  if (!brands) {
    res.writeHead(404, 'That brand does not exist');
    return res.end();
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  return res.end(JSON.stringify(brands));
});

router.get('/api/brands/:id/products', (req, res) => {
  const brandProducts = products.filter(product => product.categoryId == req.params.id);
  if (!brandProducts) {
    res.writeHead(404, 'Brand not found')
    return res.end();
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  return res.end(JSON.stringify(brandProducts));
});

router.get('/api/products', (req, res) => {
  if(!products) {
    res.writeHead(404, 'Products not found');
    return res.end();
  }
  res.writeHead(200, {'Content-Type': 'application/json'});
  return res.end(JSON.stringify(products));
});

router.post('/api/login', (req, res) => {
  const {username, password} = req.body;
  
  if (!username || !password) {
    res.writeHead(400, {'Content-Type': 'application/json'});
    return res.end("Invalid Username/Password");
  };

  const userExists = users.find((user) => user.login.username === username && user.login.password === password);
  if (!userExists) {
    res.writeHead(401, {'Content-Type': 'application/json'});
    return res.end("Username/password doesn't match records")
  }
  if (userExists) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(`You have logged in, ${username}!`);
  }

  res.writeHead(400);
  return res.end('Invalid Username/Password');
});

router.get('/api/me/cart', (req, res) => {
  res.writeHead(200, {'Content-Type': 'application/json'});
  return res.end("Items in your cart");
});

router.post('/api/me/cart', (req, res) => {
  const { productId, userId} = req.params;
  const product = products.find(product => product.id == productId);
  const user = users.find(user => user.id == userId);

  if(!product) {
    res.writeHead(404, 'That product does not exist');
    return res.end();
  }
  if (!user) {
    res.writeHead(404, 'That user does not exist');
    res.end();
  }

  res.writeHead(200);
  user.cart.push(product);
  saveCurrentUser(user);
  res.end();
});

router.delete('/api/me/cart/{productId', (req, res) => {
  const { productId} = req.params;
  let userCart = JSON.parse(fs.readFileSync('initial-data/cart.json', 'utf-8'));
  const findProduct = userCart.find((product) => product.id == productId);
  const filteredCart = userCart.filter((data) => data.id !== productId);

  if (findProduct) {
    userCart = filteredCart;
    const newCart = JSON.stringify(userCart);
    fs.writeFile('initial-data/cart.json', newCart, 'utf-8', () => {});

    res.write(200, {'Content-Type': 'application/json'});
    return res.end('Item was removed from cart');
  }
  res.writeHead(404, 'Product not found');
  return res.end()
});

router.post('/api/me/cart/{productId}', (req, res) => {
  const { productId} = req.params;
  let userCart = JSON.parse(fs.readFileSync('initial-data/cart.json', 'utf-8'));
  const findProduct = userCart.find((product) => product.id == productId);
  const pushedCart = userCart.push(findProduct);

  if (findProduct) {
    userCart = pushedCart;
    const newCart = JSON.stringify(userCart);
    fs.writeFile('initial-data/cart.json', newCart, 'utf-8', () => {});

    res.write(200, {'Content-Type': 'application/json'});
    return res.end('Item was added to cart');
  }
  res.writeHead(404, 'Product not found');
  return res.end()
})


module.exports = server;