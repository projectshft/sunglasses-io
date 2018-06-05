const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
var bodyParser   = require('body-parser');
const uid = require('rand-token').uid;

const CORS_HEADERS = {
    "Access-Control-Allow-Origin":"*",
    "Access-Control-Allow-Headers":"Origin, X-Requested-With, Content-Type, Accept, X-Authentication",
    "Access-Control-Allow-Methods":"GET, POST, DELETE"
  };
const PORT = 3001;
const myRouter = Router();
myRouter.use(bodyParser.json());

// initialize data variables
let brands;
let products;
let users;


// initial validity constants
const EXPIRED_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const accessTokens = [];
const failedAttempts = []

//write function to check if token has expired
const hasTokenExpired = (user) => {

    const timeDiff = (new Date) - user.token.lastUpdated
    return Boolean(timeDiff > EXPIRED_TIMEOUT)
}
//write function to check if temporary status (failed attempts) has expired
const hasTemporaryStatusExpired = (user) => {
    const timeDiff = (new Date) - user.temporaryStatus.lastUpdated
    return Boolean(timeDiff > EXPIRED_TIMEOUT)
}

const getUserFromToken = (request) => {
    const parsedUrl = require('url').parse(request.url,true)
    if (parsedUrl.query.accessToken) {
      // Verify the access token to make sure it's valid and not expired
      let accessToken = accessTokens.find((accessToken) => {
        return accessToken.accessToken == parsedUrl.query.accessToken;
      });
      if (accessToken) {
        return accessToken.user;
      } else {
        return null;
      }
    } else {
      return null;
    }
};

const verifyUser = (request) => {
//get signed-in user
    let user = getUserFromToken(request)

    // if no user, throw error to sign into account
    if (!user){
        response.writeHead(401, "Must sign into account", CORS_HEADERS);
        response.end("Must sign into account")
    }
    // check if token has expired
    else if(hasTokenExpired(user)){
        response.writeHead(401, "Session Timeout", CORS_HEADERS);
        response.end("Session Timeout")
    }else{
        // return user
        return user
    }
}

http.createServer(function (request, response) {
// handle initial OPTIONS request
    if (request.method === 'OPTIONS'){
        response.writeHead(200, CORS_HEADERS);
        response.end();
        } else {
            response.writeHead(200, Object.assign(CORS_HEADERS,{'Content-Type': 'application/json'}));
        }
    // create execution of router
    myRouter(request, response, finalHandler(request, response))

}).listen(PORT, (error) => {
    // create listening for errors
    if (error) {
        return console.log('Error on Server Startup: ', error)
      }
    
    // read brands.json data and store it in variable on server
    fs.readFile('initial-data/brands.json', 'utf8', function (error, data) {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });

    // read products.json data and store it in variable on server
    fs.readFile('initial-data/products.json', 'utf8', function (error, data) {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });

    // read users.json data and store it in variable on server
    fs.readFile('initial-data/users.json', 'utf8', function (error, data) {
        if (error) throw error;
        users = JSON.parse(data);
        users.forEach((user)=>{
            user.temporaryStatus = {
                failedAttempts: 0,
                lastUpdated: '',
                blocked: false
            }
            user.token = {
                uid: '',
                lastUpdated: ''
            }
        })
        console.log(`Server setup: ${users.length} users loaded`);
        console.log(users)
    });
    console.log(`Server is listening on ${PORT}`);
})


//create handler for GET api/brands 
myRouter.get('/api/brands', function(request,response) {
    response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
    // return each brand
    response.end(JSON.stringify(brands));
});


//create handler for GET api/brands/:id/products
myRouter.get('/api/brands/:id/products', function(request,response) {
    //find target brand
    const targetBrand = brands.find((brand)=>{
        return brand.id == request.params.id
    })
    // find products associated with target brand
    const targetProducts = products.filter(product => product.categoryId == targetBrand.id)

    // return products associated with target brand
    response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
    response.end(JSON.stringify(targetProducts));
});


//create handler for GET api/products
myRouter.get('/api/products', function(request,response) {
    response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
    // TODO: return products via a query search to return glasses by name

    // or if no query, return all products
    response.end(JSON.stringify(products));
});


//create handler for GET api/me/
myRouter.get('/api/me', function(request,response) {
    //get signed-in user
    const user = verifyUser(request)

    // if user exists and is verified, run server request
    if (user){

        // return user non-sensitive information
        let clonedUser = Object.assign({}, user)
        clonedUser.username = user.login.username
        delete clonedUser.login
        delete clonedUser.token 
        delete clonedUser.nat
        delete clonedUser.temporaryStatus

        response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
        response.end(JSON.stringify(clonedUser))
    }
});


//create handler for GET api/me/cart
myRouter.get('/api/me/cart', function(request,response) {
    //get signed-in user
    let user = verifyUser(request)

    // if user exists and is verified, run server request
    if (user){
        // return user's cart
        response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
        response.end(JSON.stringify(user.cart))
    }
});


// create handler for POST api/me/cart
// this handler will add a product to user's cart
myRouter.post('/api/me/cart', function(request,response) {
    //get signed-in user
    const user = verifyUser(request)

    // if user exists and is verified, run server request
    if (user){
        // define product from request.body
        let productId = request.body.productId
        let product = products.find((product)=>{
            return productId == product.id
        })
    // TODO: check to see if product is already in the cart before pushing it
        let alreadyExistingProduct = user.cart.find((item)=>{
            return item.id == productId
            
        })
        if(!alreadyExistingProduct){
            // add product to users cart
            user.cart.push({product:product, id:product.id, amount:1})
            response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
            response.end(JSON.stringify(user.cart))
        } else {
            response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
            response.end(JSON.stringify(user.cart))
        }
       
    }
});


//create handler for POST api/me/cart/:productId
//this handler will add one to existing product in user's cart
myRouter.post('/api/me/cart/:productId', function(request,response) {
    //get signed-in user
    const user = verifyUser(request)
    const productId = request.params.productId
    const quantity = Number(request.body.quantity)
    const integer = Number.isInteger(quantity)
    // if user exists and is verified, run server request
    if (user && integer){
        // define product in user's cart from productId
        let product = user.cart.find((product)=>{
            return productId == product.id
        })
        product.amount = request.body.quantity
        response.writeHead(200, {...CORS_HEADERS, 'Content-Type': 'application/json'});
        console.log(JSON.stringify(product))
        response.end(JSON.stringify(user.cart))
        // update amount of product in user cart
    } else {
        response.end(JSON.stringify(user.cart))
    }
});


//create handler for DELETE api/me/cart/:productId
myRouter.delete('/api/me/cart/:productId', function(request,response) {
    //get signed-in user
    const user = verifyUser(request)
    const productId = request.params.productId
    // if user exists and is verified, run server request
    if (user){
        // find product to delete
        let product = user.cart.find((product)=>{
            return productId == product.id
        })
        let productIndex = user.cart.indexOf(product)
        if (productIndex != -1){
            // delete product from user cart if valid product id
            user.cart.splice(productIndex, 1)
        }
        
        // return new cart back to client
        response.end(JSON.stringify(user.cart))
    }
});


//create handler for POST api/login
myRouter.post('/api/login', function(request,response) {
    console.log(users)
    // make sure user has entered a username and password
    if (!request.body.username || !request.body.password) {
        response.writeHead(400, "enter a username and password", CORS_HEADERS);
        response.end()
    } else {
        //find user and set user as value to variable user
        let user = users.find((user)=>{
            return user.login.username == request.body.username
            
          })
        // reset tempoary status if it has expired
        if (hasTemporaryStatusExpired(user)) {
            user.temporaryStatus={
                failedAttempts: 0,
                lastUpdated: '',
                blocked: false
            }
        }
        // check if user is blocked. if expired, reset failed attempts
        if (user.temporaryStatus.blocked) {
            response.writeHead(401, "Too many failed login attempts", CORS_HEADERS);
            response.end()
        }

        // verify password
        else if (user.login.password == request.body.password) {
            response.writeHead(200, CORS_HEADERS);
            
            // create an accessToken and store it within user and accessTokens array
            const accessToken = uid(6);
            user.token.uid = accessToken
            user.token.lastUpdated = new Date()
            accessTokens.push({
                accessToken:accessToken,
                user: user,
                lastUpdated: new Date()
            })
            // respond to client with token
            response.end(JSON.stringify(accessToken));
        } else {
            // if password fails, keep track of failed attempts
            user.temporaryStatus.failedAttempts += 1
            user.temporaryStatus.lastUpdated = new Date()
            if (user.temporaryStatus.failedAttempts>2) {
                // if failed attempts is more than 3, block user
                user.temporaryStatus.blocked = true
              }
        }

    }

    response.end();

});

//create a handler to logout
myRouter.post('/api/logout', function(request,response) {
    response.writeHead(200, CORS_HEADERS);
    const token = require('url').parse(request.url,true).query.accessToken
    const accessToken = accessTokens.find((accessToken)=>{
        return accessToken.accessToken == token
    })

    tokenIndex = accessTokens.indexOf(accessToken)
    accessTokens.splice(tokenIndex, 1)

    response.end(JSON.stringify({}));

})