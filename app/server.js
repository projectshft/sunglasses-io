let http = require('http');
let fs = require('fs');
let finalHandler = require('finalhandler');
let queryString = require("querystring");
const url = require("url");

let Router = require('router');
let bodyParser   = require('body-parser');
let uid = require('rand-token').uid;

const contentTypeJSON = {'Content-Type': 'application/json'}

//variables to act as a 'database'
let sunglasses = [];
let categories = [];
let user = [] //also may be the cart, unsure just yet
let activeTokens = []

//read the files so I actually have data to work with

fs.readFile('./initial-data/products.json', 'utf-8', (error, data) => {
  if(error) throw error;
  sunglasses = JSON.parse(data)
});

fs.readFile('./initial-data/brands.json', 'utf-8', (error, data) => {
  if (error) throw error;
  categories = JSON.parse(data)
})
fs.readFile("./initial-data/users.json", "utf-8", (error, data) => {
  if (error) throw error;
  users = JSON.parse(data);
});

//set up the router

const PORT = 3001;

const myRouter = Router();
myRouter.use(bodyParser.json());

// This function is a bit simpler...
const server = http.createServer((req, res) => {
  res.writeHead(200);
  myRouter(req, res, finalHandler(req, res));
});

server.listen(PORT, error => {

  console.log(`Running on port ${PORT}`);
});

myRouter.get('/v1/sunglasses', (req, res) => {
  res.writeHead(200, contentTypeJSON)
  return res.end(JSON.stringify(sunglasses))  
})

myRouter.get('/v1/sunglasses/:id', (req,res) => {
  let { id } = req.params
  let product = sunglasses.find(products => {
    return products.id == id
  })
  if(product){
    res.writeHead(200, contentTypeJSON);
    return res.end(JSON.stringify(product))
  } else {
    res.writeHead(404, 'Sorry, no product was found matching that ID')
    return res.end()
  }  
})

myRouter.get('/v1/categories', (req,res) => {
  res.writeHead(200, contentTypeJSON);
  return res.end(JSON.stringify(categories))
})
myRouter.get('/v1/categories/:id', (req,res) => {
  let { id } = req.params
  let category = categories.find(catObjs => catObjs.id === id)
  if(!category){
    res.writeHead(404 ,'The requested resource does not exist')
    return res.end()
  } else {
    res.writeHead(200, contentTypeJSON)
    return res.end(JSON.stringify(category))
  }
})

myRouter.get('/v1/categories/:id/products', (req, res) => {
  let { id } = req.params
  //to ensure it is a valid category
  let category = categories.find(catObjs => catObjs.id === id)
  if(!category){
    res.writeHead(404, 'The requested resource does not exist')
    return res.end()
  }
  let filteredGlasses = sunglasses.filter(sunglasses => sunglasses.categoryId === id);
  if(filteredGlasses.length === 0 ){
    res.writeHead(200, "There are no sunglasses currently for that brand", contentTypeJSON)
    return res.end(JSON.stringify(filteredGlasses))
  }
  res.writeHead(200, contentTypeJSON)
  return res.end(JSON.stringify(filteredGlasses))
})

myRouter.post('/v1/me/login', (req, res) =>{
  let {username, password} = req.body;
  if(username && password){
    let user = users.find((user) => {
      return user.login.username == username && user.login.password == password;
    });
    if(user){
      res.writeHead(200, contentTypeJSON)

      let userToken = activeTokens.find(tokens => tokens.user === username)

      //first check to see if the user has a token in their name
      if(userToken){
        userToken.issued = new Date()
        return res.end(JSON.stringify(userToken))
        //refresh their token and return a new one
      } else {
      //make a new token
      let newToken = {
        token: uid(16),
        user: username,
        issued: new Date()
      }
      activeTokens.push(newToken)
      return res.end(JSON.stringify(newToken))
    }
    } else {
      res.writeHead(401 , 'Password and username do not match')
      return res.end()
    }
  } else {
    res.writeHead(400, 'Incorrect or missing credentials')
    return res.end()
  }
})

myRouter.get('/v1/me/cart', (req,res) => {
 let parsedUrl = url.parse(req.url,true)
 let tokenId = parsedUrl.query.query //accessing the token string ID
  if(tokenId){
    let thisUsersToken = activeTokens.find(tokenObj => tokenObj.token === tokenId);
    if(thisUsersToken){
      //use the user info associated with the token to get the right cart
      let thisUser = users.find(userObjs => userObjs.login.username === thisUsersToken.user)
      res.writeHead(200, contentTypeJSON)
      return res.end(JSON.stringify(thisUser.cart))
    } else {
      res.writeHead(403, 'User not found')
      return res.end()
    }
  } else {
    res.writeHead(403, 'Invalid access token')
    return res.end()
  }
})

myRouter.post('/v1/me/cart', (req,res) => {
  let parsedUrl = url.parse(req.url, true)
  let tokenId = parsedUrl.query.query //accessing the token string ID
  if (tokenId) {
    let thisUsersToken = activeTokens.find(tokenObj => tokenObj.token === tokenId);
    if (thisUsersToken) {
      //use the user info associated with the token to get the right cart
      let thisUser = users.find(userObjs => userObjs.login.username === thisUsersToken.user)
      //find the product(s) id(s) to add
      let productId = req.body.productId
      //make a list of failed product requests
      let failedProducts = []
      
      productId.forEach(itemToAdd => {
        let productToAdd = sunglasses.find(productObj => productObj.id === itemToAdd);
        if(productToAdd){
          let cartItem = {
            id: itemToAdd,
            quantity:"1"
          }
          //add and return product
          thisUser.cart.push(cartItem);
        } else {
          failedProducts.push(itemToAdd)
        }
        
      });
      if(failedProducts.length > 0){
        res.writeHead(200,  contentTypeJSON);
        return res.end(JSON.stringify({cart : thisUser.cart, notAdded:failedProducts}));
      }
      res.writeHead(200, contentTypeJSON,)
      return res.end(JSON.stringify(thisUser.cart))
    } else {
      res.writeHead(403, 'Access token does not match our records, please log in again')
      return res.end()
    }
  } else {
    res.writeHead(403, 'Invalid or missing access token')
    return res.end()
  }
})

myRouter.delete('/v1/me/cart/:id', (req,res) => {
  let { id } = req.params;
  //first, verify the access token
  let parsedUrl = url.parse(req.url, true);
  let tokenId = parsedUrl.query.query;
  if(tokenId){
    //with an actual token, validate it is accurate
    let thisUsersToken = activeTokens.find(tokenObj => tokenObj.token === tokenId)
    if(thisUsersToken){
      //now find the user object to access the cart
      let thisUser = users.find(userObj => thisUsersToken.user === userObj.login.username)
      //now filter out all products that match the product ID in the endpoint
      thisUser.cart = thisUser.cart.filter(product => product.id !== id)
      res.writeHead(200, contentTypeJSON);
      return res.end(JSON.stringify(thisUser.cart))
    } else {
      res.writeHead(403, "Access token does not match our records, please log in again");
      return res.end()
    }

  } else {
    res.writeHead(403,'Invalid or missing access token')
    return res.end()
  }
})

myRouter.post('/v1/me/cart/:id', (req,res) => {
  let { id } = req.params;
  //first, verify the access token
  let parsedUrl = url.parse(req.url, true);
  let tokenId = parsedUrl.query.query;
  if (tokenId) {
    //with an actual token, validate it is accurate
    let thisUsersToken = activeTokens.find(tokenObj => tokenObj.token === tokenId)
    if (thisUsersToken) {
      //now find the specific cart item
      let thisUser = users.find(userObj => thisUsersToken.user === userObj.login.username);
      let cartItem = thisUser.cart.find(itemInCart => itemInCart.id === id);
      if(!cartItem){
        res.writeHead(404, "Product not found in the users cart")
        return  res.end()
      }
      if(!sunglasses.find(sunglassesObj => sunglassesObj.id === req.body.productId)){
        res.writeHead(404, "Product not found in the database");
        return  res.end();
      }
      cartItem.quantity = req.body.quantity
      res.writeHead(200, contentTypeJSON)
      return res.end(JSON.stringify(thisUser.cart))   
    } else {
      res.writeHead(403, "Access token does not match our records, please log in again");
      return res.end()
    }

  } else {
    res.writeHead(403, 'Invalid or missing access token')
    return res.end()
  }
})

module.exports = server;