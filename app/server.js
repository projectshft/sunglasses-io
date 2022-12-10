var http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const Router = require('router');
const bodyParser = require('body-parser');
const uid = require('rand-token').uid;
const finalhandler = require('finalhandler');

const PORT = 3001;

const products = JSON.parse(fs.readFileSync('initial-data/products.json', 'utf8'));
const brands = JSON.parse(fs.readFileSync('initial-data/brands.json', 'utf8'));
const users = JSON.parse(fs.readFileSync('initial-data/users.json', 'utf8'));
const accessTokens = [{
    username: 'yellowleopard753',
    password: 'jonjon',
    accessToken: 'qwertyuiopasdfgh'
}];

const cart = [{
    id: "1",
    categoryId: "1",
    name: "Superglasses",
    description: "The best glasses in the world",
    price:150,
    imageUrls:["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
}];

const router = Router();

router.get('/brands', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(brands));
});

router.get('/products/:id', (req, res) => {
    try{
  const productId = req.params.id;
  const product = products.find(p => p.id === productId);
  if (!product) {
    throw new Error('Product simply does not exist');
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(product));
    }
    catch(error) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: error.message }));

    }
});

router.get('/products', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(products));
});

router.use(bodyParser.json());


router.post('/login', (req, res) => {
    try{
  const { username, password } = req.body;
  const user = users.find(u => u.login.username === username && u.login.password === password);
  if (!user) {
    throw new Error('Could not find either that user name or password. Maybe it is my fault. But maybe it is yours?');
  }
    let newAccessToken = {
        username: user.username,
        password: user.password,
        accessToken: uid(16)
    }
    accessTokens.push(newAccessToken)
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newAccessToken.accessToken));
  } 
  catch(error){
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: error.message }));
  }
});


//get items in cart
router.get('/cart', (req, res) => {
    try {
      const accessToken = req.headers['access-token'];
      const userInfo = accessTokens.find(token => token.accessToken === accessToken);
      if (!userInfo) {
        throw new Error('You have no face. How can a man with no face have a cart?');
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cart));
    } catch (error) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: error.message }));
    }
  });


//add an item to cart 
router.post('/cart', (req, res) => {
    try {
      const accessToken = req.headers['access-token'];
      const userInfo = accessTokens.find(token => token.accessToken === accessToken);
      if (!userInfo) {
        throw new Error('A man has no face. A man with no face cannot add to a cart.');
      }
   
      const product = products.find(product => product.id === req.body.productId);
      if (!product) {
        throw new Error('that item simply does not exist');
      }
      cart.push(product)
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cart));
    } catch (error) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: error.message }));
    }
  });


const server = http.createServer((req, res) => {
  router(req, res, finalhandler(req, res));
});

module.exports = server.listen(PORT);

