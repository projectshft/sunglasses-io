const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
// const swaggerDocument = YAML.load('../swagger.yaml');
const app = express();
const path = require('path');

// ABSOLUTE PATHS TO SERVER
const swaggerPath = path.resolve(__dirname, '../swagger.yaml');
const swaggerDocument = YAML.load(swaggerPath);

// PARSE JSON MIDDLEWARE
app.use(express.json())
app.use(bodyParser.json());

// JSON FILES
const users = require('../initial-data/users.json');
const brands = require('../initial-data/brands.json');
const products = require('../initial-data/products.json');

// CORS MIDDLEWARE
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Authentication, X-Username, X-Password, X-ApiKey",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
};

// BASIC MIDDLEWARE
app.use((req, res, next) => {
  console.log('Basic Middleware Stuff...');
  res.set(CORS_HEADERS);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ERROR HANDLING
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// SWAGGER
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// STATIC PUBLIC DIRECTORY
app.use('/initial-data', express.static(path.join(__dirname, '../initial-data')));

// ROUTE TO ROOT
app.get('/', (req, res) => {
  console.log('hello');
  res.status(200).send('Are you ready to shop?');
});

// NON-AUTHENTICATED ROUTES
app.get('/brands', (req, res) => {
  const brandNames = brands.map(brand => brand.name);
  brandNames.sort();
  res.json( { 'All Brand Names': brandNames });
});

app.get('/brands/:name', (req, res) => {
  // NO SYMBOLS & NO SPACE
  const brandName = req.params.name;
  const brand = brands.find(brand => brand.name.toUpperCase === brandName.toUpperCase);

  if (brand) {
    const brandId = brand.id;

    const productsByBrand = products.filter(product => product.categoryId === brandId);
    
    productsByBrand.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return a.price - b.price;
    });
    
    res.json({ [brandName]: productsByBrand });
  } else {
    res.status(401).send('Brand name not found');
  };
});

app.get('/products', (req, res) => {
  try {
    const capitalizeNames = (name) => {
      if (!name) return '';
  
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    const productNames = products
      .map(product => capitalizeNames(product.name))
      .sort()

    res.json({ 'All Product Names': productNames });
  } catch (error) {
    console.error('Error in /products route: ', error);
    res.status(500).json({ error: 'Internal server error or something something'})
  }

});

app.get('/products/:name', (req, res) => {
  // NO SYMBOLS & NO SPACE
  const productName = req.params.name.toLowerCase();
  const product = products.find(product => product.name.toLowerCase() === productName);

  if (product) {
    const productDetails = {
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrls: product.imageUrls
    };
    res.json({ 'Product Details': productDetails });
  } else {
    res.status(401).send('Product not found');
  };
});

// JWT_SECRET
const JWT_SECRET = '9527e3a06a598251710743aa74e29e3681762684a01b184762469005a26afef3';

// LOGIN
app.post('/login', (req, res) => {
  console.log('LOGIN...');
  authHeader = req.headers.authorization;
  console.log('AuthHeader: ', authHeader);
  if(!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).send({ error: 'Unauthorized' });
  }
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  // const { username, password } = req.body;
  const user = users.find(user => user.login.username === username);
  console.log('Username: ', username);
  console.log('Password: ', password);

  if (user &&  password === user.login.password) {
    // GENERATES TOKEN
    const token = jwt.sign({ username: user.login.username }, JWT_SECRET, {expiresIn: '1d' });

    console.log('Token: ', token);

    // ROUTE to (/{user.name.first})
    const redirectUrl =`/${user.name.first}`;
    console.log('ReDirectUrl: ', redirectUrl);

    res.status(200).json({ token, redirectUrl: `/${user.name.first}`});
  } else {
    res.status(401).send('Username or password is incorrect');
  }
});

// AUTHENTICATION MIDDLEWARE
const authenticateJWT = (req, res, next) =>  {
  let authHeader = req.headers['authorization'];
  console.log('AUTHENTICATION');
  console.log('AuthHeader: ', authHeader);

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    console.log('AuthHeader Deconstructed: ', token);

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header missing'  });
  }
};

// AUTHENTICATED ROUTES
app.get('/users', authenticateJWT, (req, res) => {
  const userNames = users.map(user => user.name.first);
  res.status(200).json({ users: userNames });
});

app.get('/:name', authenticateJWT, (req, res) => {
  const userName = req.params.name.toLowerCase();
  const user = users.find(user => user.name.first.toLowerCase() === userName);

  if (user) {
    const userCart = user.cart;
    res.status(200).json({ userCart: userCart });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }; 
});

app.post('/:name', authenticateJWT, (req, res) => {
  const userName = req.params.name.toLowerCase();
  const user = users.find(user => user.name.first.toLowerCase() === userName);

  if (!user) {
    return res.status(401).json({ error: 'User not found.' });
  };

  if (!user.cart) {
    user.cart = { items: [], total: 0 };
  };

  const newItem= {
    product: req.body.product || 'glas',
    quantity: req.body.quantity || 1,
    price: req.body.price || 50,
  };

  user.cart.items.push(newItem);
  user.cart.total = user.cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity), 0
  );

  res.status(200).json({ userCart: user.cart });
});

app.delete('/:name', authenticateJWT, (req, res) => {
  const userName = req.params.name.toLowerCase();
  const user = users.find(user => user.name.first.toLowerCase() === userName);

  if (!user) {
    return res.status(401).json({ error: 'User not found'});
  }

  user.cart = { items: [], total: 0 };

  res.status(200).json({ message: 'Cart was successfully deleted' });
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

module.exports = app;