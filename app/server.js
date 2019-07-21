var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
const url = require("url");
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;

//set variable for 200 response header
const header = {'Content-Type': 'application/json'};

//set default variables
let products = [];
let brands =[];
let users = [];
let accessTokens =[{
    username: 'yellowleopard753',
    lastUpdated: 'today',
    token: 'gaeaw'
}];
let cart = [{
    "id": "1",
    "categoryId": "1",
    "name": "Superglasses",
    "description": "The best glasses in the world",
    "price":150,
    "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
}];
//set a helper function that parses the accessToken from the url
const getValidTokenFromRequest = (request) => {
    let parsedUrl = url.parse(request.url, true);
    let tokenFromUrl = parsedUrl.query.token;
    //if the query has an accesstoken present
    if (tokenFromUrl) {
        //check to see if the accessToken the user has is a verified one
        let currentAccessToken = accessTokens.find(accessToken => {
            return accessToken.token == tokenFromUrl
        })
        //if the token is verified return it
        if (currentAccessToken) {
            return currentAccessToken
        } else {
            //return nothing if the token is not verified
            return null
        }
    //if the 
    } else {
        return null
    }
}

const PORT = 3001;

//Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = module.exports = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request,response))
}).listen(PORT, () => {
    //extract the products data and save it into a  products variable
    //array of objects
    products = JSON.parse(fs.readFileSync('../initial-data/products.json', 'utf-8'));
    //extract the brands data and save it into a products variable
    //array of objects
    brands = JSON.parse(fs.readFileSync('../initial-data/brands.json', 'utf-8'));
   //array of objects 
    //extract the user data and savi it into a users variable
    users = JSON.parse(fs.readFileSync('../initial-data/users.json'), 'utf-8')
});

//creater a route for the /products endpoint
myRouter.get('/api/products', function(request, response) {
    //set 
    let productsToReturn = [];
    //parse the search query from the url
    const parsedUrl = url.parse(request.originalUrl);
    const query = queryString.parse(parsedUrl.query);
    //if there is a query filter through products and return product that matches query
    //setting a strict 
    if (query.q !== undefined) {
        productsToReturn = products.filter(product => {
            return product.name == query.q
        })
        //if products to return is empty return an error
        if (productsToReturn.length == 0) {
            response.writeHead(400, 'There are no products matching search query');
            return response.end();
        }
    } else {
        //if there's no query set productsToReturn as all available products
        productsToReturn = products;

    }
    response.writeHead(200, header);
    return response.end(JSON.stringify(productsToReturn));
})
//create router for /api/brands endpoint
myRouter.get('/api/brands', function(request, response) {
    response.writeHead(200, header);
    return response.end(JSON.stringify(brands));
})

//create router post for /api/login endpoint
myRouter.post('/api/login', function(request, response) {
    //see if a username an password was entered
    if (request.body.username && request.body.password) {
        //if so find a user that matches the credentials
        let user = users.filter(user => {
            return user.login.username == request.body.username && user.login.password == request.body.password
        });
        //if there is no user matching credentials return an error
        if (user.length == 0) {
            response.writeHead(401, 'Invalid usernmae or password');
            return response.end();
        };
        //see if user currently has an access token
        let currentAccessToken = accessTokens.find((token) => {
            return token.username == user[0].login.username;
        });
        //if there is an accesstoken for the user update the time it was last updated
        if (currentAccessToken) {
            currentAccessToken.lastUpdated = new Date();
            return response.end(JSON.stringify(currentAccessToken.token));
        } else {
            //if there is not an accesstoken for the user create a new acccesstoken
            let newAccesstoken = {
                username: request.body.username,
                lastUpdated: new Date(),
                token: uid(16)
            };
            accessTokens.push(newAccesstoken);
            return response.end(JSON.stringify(newAccesstoken.token));
        }
    } else {
        response.writeHead(400, 'Incorrectly formatted response');
        return response.end();
    }
});

//get all the products currently in the cart
myRouter.get('/api/me/cart', function(request, response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    //if there is no verified access toekn return an error
    if (!currentAccessToken) {
        response.writeHead(401, 'You do not have access to this data');
        return response.end();
    } else {
        //return the products currently in the cart
        response.writeHead(200, header);
        return response.end(JSON.stringify(cart))
    }
})
//create router post for /api/me/cart/:productId endpoint which adds product to cart
myRouter.post('/api/me/cart/:productId', function (request, response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    //if there is no verified access token return an error
    if (!currentAccessToken) {
        response.writeHead(401, 'You do no have access to this data');
        return response.end();
    }
    //if there is no product id specified in the paramters return an error
    if (request.params.productId == undefined) {
        response.writeHead(400, 'You must specify a product to be added to cart')
        return response.end();
    }
    let productToBeAdded = products.find(product => {
        return product.id == request.params.productId; 
    })
    //if there is no productId matching the id of a product return an error
    if (!productToBeAdded) {
        response.writeHead(400, 'The id does not match any products available in the store')
        return response.end();
    }
    //if product is already in cart increase its quantity
    for (let i = 0; i < cart.length; i++) {
        if (productToBeAdded.id == cart[i].id) {
            response.writeHead(200, 'Item quantity increased by 1');
            response.end(cart)
        } else {
            //if product is not in cart add product to cart with a quantity number of 1
            productToBeAdded.quantity = 1;
            cart.push(productToBeAdded);
            response.writeHead(200, 'Item added to cart');
            response.end(cart);
        }
    }
})

//delete a specified product from the cart
myRouter.get('/api/me/cart/:productId', function(request,response) {
    let currentAccessToken = getValidTokenFromRequest(request);
    //if there is no verified access token return an error
    if (!currentAccessToken) {
        response.writeHead(401, 'You do no have access to this data');
        return response.end();
    }
    //if there is no product id specified in the paramters return an error
    if (request.params.productId == undefined) {
        response.writeHead(400, 'You must specify a product to be added to cart')
        return response.end();
    }
    let productToBeDeleted = cart.find(product => {
        return product.id == request.params.productId; 
    })
    //if there is no productId matching the id of a product return an error
    if (!productToBeDeleted) {
        response.writeHead(400, 'The id does not match any products currently in the cart')
        return response.end();
    }
    //create new cart of products
    let newCart = cart.filter(product => {
        //if the product is not meant to be deleted add it to the new cart
        return product.id !== productToBeDeleted.id
    })

    response.writeHead(200, 'Item deleted from cart');
    return response.end(newCart);
})




