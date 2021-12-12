var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser   = require('body-parser');
var uid = require('rand-token').uid;
const { userInfo } = require('os');


// stand in variables for dummy api values
let brands = [];
let products = [];
let users = [];
let accessTokens = [];
let user = {};
let productToBeAdded = {};
let selectedUserIndex = null;

// setup router
var myRouter = Router();
myRouter.use(bodyParser.json());
const PORT = 3001;

// Create the server
let server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, () => {
    brands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf-8"));
    products = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf-8"));
    users = JSON.parse(fs.readFileSync("./initial-data/users.json","utf-8"));   
});

// GET method to retrieve all brands
myRouter.get('/brands', function(request,response) {    
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(brands));
}); 

// GET method to retrieve all products
myRouter.get('/products', function(request,response) {
    response.writeHead(200, { "Content-Type": "application/json" });
    return response.end(JSON.stringify(products));
});

// GET method to retrieves all products belonging to the given brand id
myRouter.get('/brands/:id/products', function(request,response) {    
    const { id } = request.params;  
    const matchingProducts = products.find(product => product.categoryId == id);

    if (!matchingProducts) {
        response.writeHead(404, "That product does not exist");
        return response.end();
    }
    response.writeHead(200, { "Content-Type": "application/json" });  
    return response.end(JSON.stringify(matchingProducts));
});

// POST method for the user to log in
myRouter.post('/login', (request,response) => {    
    if (request.body.username && request.body.password) {        
        user = users.find((user) => {
            return user.login.username == request.body.username && user.login.password == request.body.password;
        });
        
        if (user) {
            response.writeHead(200, { "Content-Type": "application/json" });
            let currentAccessToken = accessTokens.find((tokenObject) => {
                 tokenObject.username == user.login.username;
            });

            if (currentAccessToken) {
                currentAccessToken.lastUpdated = new Date();                
                return response.end(JSON.stringify(currentAccessToken.token));               
            } else {
                let newAccessToken = {
                    username: user.login.username,
                    lastUpdated: new Date(),
                    token: uid(8)                 
                }                
                accessTokens.push(newAccessToken);
                return response.end(JSON.stringify(newAccessToken.token));                
            }
        } else {
            response.writeHead(401, "Invalid username or password");
            return response.end();
        }    
    } else {
        response.writeHead(400, "One or more parameters are missing");
        return response.end();
    }    
});

// GET method to retrieve the users cart
myRouter.get('/me/cart', (request, response) => {    
    let tokenToBeTested = accessTokens.find((tokenObject) => {
        return tokenObject.username == request.body.username; 
    });

    if (!tokenToBeTested) {
        response.writeHead(403, "You must login to view the cart");
        return response.end();
    } else {  //Assign full user object to userInfo to access cart
        response.writeHead(200, { "Content-Type": "application/json" }); 
        return response.end(JSON.stringify(user.cart));
    }
}); 

// POST method to add to the users cart
myRouter.post('/me/cart', (request, response) => {     
    // Check for valid login
    tokenToBeTested = accessTokens.find((tokenObject) => {
        return tokenObject.username == request.body.username; 
    });
    if (!tokenToBeTested) {
        response.writeHead(403, "You must login to access the cart");
        return response.end();
    } else if (!request.body.id) {
        response.writeHead(401, "You must choose a product to add to the cart");
        return response.end();
    };    

    if (tokenToBeTested && request.body.id) {
        productToBeAdded = products.find((productObject) => {
            return productObject.id == request.body.id;
        });
    };
    if (!productToBeAdded) {
        response.writehead(400, "That product doesn't exist");
        return response.end();
    } else {               
        for (let i = 0; i < users.length; i++) {            
            if (user.login.username == users[i].login.username) {
                users[i].cart.push(productToBeAdded);
                selectedUserIndex = i;                
            }
        }        
        response.writeHead(200, { "Content-Type": "application/json" });         
        return response.end(JSON.stringify(users[selectedUserIndex].cart));         
        }               
}); 

myRouter.put('/me/cart/:productId', (request, response) => {
    const productToBeEdited = users[selectedUserIndex].cart.find(product => product.id == request.params.productId);

    if (!productToBeEdited) {
        response.writeHead(404, "That product is not in the cart");
        return response.end();
    } else {
        // productToBeEdited modified on front end
        response.writeHead(200, { "Content-Type": "application/json" }); 
        // original version is removed from cart
        const updatedCart = users[selectedUserIndex].cart.filter(items => items.id != productToBeEdited.id); 
        users[selectedUserIndex].cart = updatedCart;
        // modifed version of productToBeEdited added to cart
        users[selectedUserIndex].cart.push(productToBeEdited);         
        return response.end(JSON.stringify(users[selectedUserIndex].cart));
    }
});

// Deletes a specified item from the users cart
myRouter.delete('/me/cart/:productId', (request, response) => {
    const productToBeRemoved = users[selectedUserIndex].cart.find(product => product.id == request.params.productId);

    if (!productToBeRemoved) {
        response.writeHead(404, "That product is not in the cart");
        return response.end();
    } else {
        response.writeHead(200, { "Content-Type": "application/json" }); 
        const updatedCart = users[selectedUserIndex].cart.filter(items => items.id != productToBeRemoved.id); 
        users[selectedUserIndex].cart = updatedCart;        
        return response.end(JSON.stringify(users[selectedUserIndex].cart));
    }
}); 

module.exports = server;




