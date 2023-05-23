const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router')
const bodyParser   = require('body-parser');
const uid = require('rand-token').uid;
const Sunglasses = require('./sunglasses.model')

const VALID_API_KEYS = ['xyz', 'abc'];
const VALID_AUTH_TOKENS = ['Bearer your-auth-token', 'Bearer my-auth-token']

const PORT = 3001;

const myRouter = Router();

const state = {
  products: [],
  users: [],
  brands: []
}

myRouter.use(bodyParser.json());

let server = http.createServer(async (req, res) => {
  
  if(!VALID_API_KEYS.includes(req.headers['api-key']) || req.headers['api-key'] == undefined) {
    console.log('apikey', req.headers)
    res.writeHead(401, "Valid API Key needed")
    res.end();
  };

  createStateObject();

  myRouter(req, res, finalHandler(req, res));

}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  };

  

  console.log(`Server is listening on ${PORT}`);
});


//Routes

myRouter.get('/brands', isStateFinished, (req, res) => {
  
  const brands = Sunglasses.getAllBrands(state);
  
  res.writeHead(200, { "Content-Type": "application/json" });
	return res.end(JSON.stringify(brands));
});

myRouter.get('/brand/:brandId/products', (req, res) => {
  let id = req.params.brandId;

  if(isNaN(id)) {
    const errorRes = {
      error: 'Invalid Brand ID'
    };
    res.writeHead(400, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(errorRes));
  }

  let brand = Sunglasses.findBrand(state, id);

  if(!brand) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'Brand not Found'}));
  } else {
      let brandProducts = Sunglasses.filterProducts(state, id);

      if(!brandProducts) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({error: 'Products not Found'}));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
	    return res.end(JSON.stringify(brandProducts));
  };
});

myRouter.get('/products', (req, res) => {
  const allProducts = Sunglasses.getProducts(state)

  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(allProducts));
});

myRouter.get('/user/:username/cart', (req, res) => {

  if(!VALID_AUTH_TOKENS.includes(req.headers.authorization) || req.headers.authorization == undefined) {

    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'Unauthorized, need Auth Token'}));
  };

  let userName = req.params.username;

  const currentUser = Sunglasses.findUser(state, userName);

  if(!currentUser) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'User does not exist'}))
  }
  
  let cart = currentUser.cart
  
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(cart));
});

myRouter.post('/product/:username/cart', (req, res) => {
  const token = req.headers.authorization
  if(!VALID_AUTH_TOKENS.includes(token) || token == undefined) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'Unauthorized, need Auth Token'}));
  };

  let product = req.body

  let userName = req.params.username;

  let user = Sunglasses.findUser(state, userName);

  if(!user) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({error: 'User not found'}));
  }

 let cart = Sunglasses.addToCart(user, product);

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({success: `${cart}`}))
});

// myRouter.put()


module.exports = server;



// const createStateObject = () => {
//   fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
//     if (error) throw error;
//     state.products = JSON.parse(data);
//   });
  
//   fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
//     if (error) throw error;
//     state.users = JSON.parse(data);
//   });

//   fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
//     if (error) throw error;
//     state.brands = JSON.parse(data);
//   });
// };

// const isStateFinished = (req, res, next) => {
//   let retryCount = 0;
//   let retryWait = 1000;

//   if(state.brands.length === 5) {
//     Sunglasses.setState(state);
//     next();
//   } else if(retryCount < 10) {
//     retryCount++;

//     this.setTimeout(() => {
//       isStateFinished(req, res, next);
//     }, retryWait);

//   } else {
//     console.log('not ye')
//   }
// };