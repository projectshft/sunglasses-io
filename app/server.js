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

const readFileAsync = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (error, data) => {
      if(error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

const isStateFinished = async (req, res, next) => {
  try {
    if (state.products.length === 0) {
      let productData = await readFileAsync("./initial-data/products.json");
      state.products = JSON.parse(productData);
    }

    if (state.users.length === 0) {
      let userData = await readFileAsync("./initial-data/users.json");
      state.users = JSON.parse(userData);
    }

    if (state.brands.length === 0) {
      let brandData = await readFileAsync("./initial-data/brands.json");
      state.brands = JSON.parse(brandData);
    }

    next();

  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: 'Error occurred while reading file paths' }));
  }
};

const finishState = (req, res, next) => {
  Sunglasses.setState(state)
  next();
}

myRouter.use(bodyParser.json());

let server = http.createServer(async (req, res) => {
  
  if(!VALID_API_KEYS.includes(req.headers['api-key']) || req.headers['api-key'] == undefined) {
    console.log('apikey', req.headers)
    res.writeHead(401, "Valid API Key needed")
    res.end();
  };

  myRouter(req, res, finalHandler(req, res));

}).listen(PORT, error => {
  if (error) {
    return console.log("Error on Server Startup: ", error);
  };

  console.log(`Server is listening on ${PORT}`);
});


myRouter.use(isStateFinished);
myRouter.use(finishState);


//Routes

myRouter.get('/brands', (req, res) => {
  
  const brands = Sunglasses.getAllBrands();
  
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

  let brand = Sunglasses.findBrand(id);

  if(!brand) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'Brand not Found'}));
  } else {
      let brandProducts = Sunglasses.filterProducts(id);

      if(!brandProducts) {
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({error: 'Products not Found'}));
      }

      res.writeHead(200, { "Content-Type": "application/json" });
	    return res.end(JSON.stringify(brandProducts));
  };
});

myRouter.get('/products', (req, res) => {
  const allProducts = Sunglasses.getProducts()

  res.writeHead(200, { "Content-Type": "application/json" });
  return res.end(JSON.stringify(allProducts));
});

myRouter.get('/user/:username/cart', (req, res) => {

  if(!VALID_AUTH_TOKENS.includes(req.headers.authorization) || req.headers.authorization == undefined) {

    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'Unauthorized, need Auth Token'}));
  };

  let userName = req.params.username;

  const currentUser = Sunglasses.findUser(userName);

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

  let user = Sunglasses.findUser(userName);

  if(!user) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({error: 'User not found'}));
  }

 let cart = Sunglasses.addToCart(user, product);

  res.writeHead(201, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({success: `${cart}`}))
});

myRouter.put('/product/:username/cart', (req, res) => {
  const token = req.headers.authorization
  if(!VALID_AUTH_TOKENS.includes(token) || token == undefined) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'Unauthorized, need Auth Token'}));
  };

  let userName = req.params.username;
  let productToUpdate = req.body.product;
  let updatedQuantity = req.body.updatedQuantity

  const userCheck = Sunglasses.findUser(userName);
  const productCheck = Sunglasses.filterProducts(productToUpdate.id);

  if(!userCheck || productCheck.length === 0) {
    res.writeHead(404, { 'Content-Type':'application/json' });
    return res.end(JSON.stringify({error: 'User not found'}));
  }

  const currentProductInCart = Sunglasses.filterProductInCart(userName, productToUpdate);

  const differenceToApply = currentProductInCart.length - updatedQuantity

  if(differenceToApply <= 0) {
    let quantityToAdd = Math.abs(differenceToApply);
    const updatedCartAdd = Sunglasses.updateCartAdd(userName, quantityToAdd, productToUpdate);

    const cartToCompare = updatedCartAdd.filter((item) => {
      return item.id == productToUpdate.id;
    });

    if(cartToCompare.length === updatedQuantity) {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(updatedCartAdd));
    }
    
  } else {
    let quantityToSubtract = differenceToApply;
    
    const updatedCartSub = Sunglasses.updateCartSub(userName, updatedQuantity, productToUpdate);

    cartToCompare = updatedCartSub.filter((item) => {
      return item.id == productToUpdate.id;
    });

    if(cartToCompare.length === updatedQuantity) {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(updatedCartSub));
    }

  }
});

myRouter.delete('/product/:username/cart', (req, res) => {
  const token = req.headers.authorization
  if(!VALID_AUTH_TOKENS.includes(token) || token == undefined) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'Unauthorized, need Auth Token'}));
  };

  let productToRemove = req.body;
  let userName = req.params.username;

  const user = Sunglasses.findUser(userName);

  if(!user) {
    res.writeHead(404, { 'Content-Type':'application/json' });
    return res.end(JSON.stringify({error: 'User not found'}));
  }

  const newCart = Sunglasses.removeCartItems(user, productToRemove);

  const validateRemoval = Sunglasses.validateRemoval(newCart, productToRemove);

  if(!validateRemoval) {
    res.writeHead(500, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({error: 'Unable to delete, try again'}));
  } 

  res.writeHead(204, { "Content-Type": "application/json" });
  res.end(JSON.stringify(newCart));

});



module.exports = server



