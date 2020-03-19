var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
const PORT = 8080;

// State Holding Variables
let brands = [];
let products = [];
let users = [];
let verifiedUsers = []
let currentSessionUser;

// Setup router
const myRouter = Router();
myRouter.use(bodyParser.json());

// Helper method to process access token
var getValidTokenFromRequest = function (request) {
    var parsedUrl = require('url').parse(request.url, true)
    if (parsedUrl.query.accessToken) {
        // Verify the access token to make sure its valid and not expired
        let currentAccessToken = verifiedUsers.find((user) => {
            return user.token == parsedUrl.query.accessToken;
        });
        if (currentAccessToken) {
            return currentAccessToken;
        } else {
            return null;
        }
    } else {
        return null;
    }
};

// declare server so it can be exported to the testing file
const server = http.createServer(function (request, response) {
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }

    // Load initial brands
    fs.readFile("./initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        // Create a varialbe to represent the data in the json file
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });

    // Load initial products
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        // Create a varialbe to represent the data in the json file
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });

    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });


    console.log(`Server is listening on ${PORT}`);

});


////// BELOW ARE THE PATHS FOR THE NODE SERVER //////////

myRouter.get('/api/brands', function (request, response) {
    // Return all the brands in the brands json file
    response.writeHead(200, ('Success'), {
        "Content-Type": "application/json"
    });
    return response.end(JSON.stringify(brands));
});

myRouter.get('/api/brands/:id/products', function (request, response) {

    //Need to compare the id from the request paramaters to match the id of products in data from the global variable products
    let matchingProduct = products.filter((product) => {
        return product.categoryId === request.params.id
    })

    // Write status of 404 if the matching product returns an empty array
    if (matchingProduct.length === 0) {
        response.writeHead(404, ('Error'), {
            "Content-Type": "html/text"
        })

        response.end(('Error 404: CategoryID was not found'))

    }

    response.writeHead(200, ('Success'), {
        "Content-Type": "application/json"
    });
    return response.end(JSON.stringify(matchingProduct));

});

myRouter.get('/api/products', function (request, response) {
    //spliting the url to grab the keyword we need to compare in our data
    const parsedURL = request.url.split("?");
    // Setting a variable equal to the keyword that is in the 1st index so we can compare
    const queryParams = queryString.parse(parsedURL[1]);

    //variables that are arrays with matching products
    let matchedName = products.filter((product) => {
        if (product.name === queryParams.name) {
            return product
        }
    });
    let matchedDescription = products.filter((product) => {
        if (product.description === queryParams.description) {
            return product
        }
    })

    //Edge case if our products.json file was empty and error should be thrown 
    if (products.length === 0) {
        response.writeHead(404), ('Error'), {
            "Content-Type": "html/text"
        }
        response.end('There were no products found');
    }

    //Edged case for if there is a query
    if (matchedName.length > 0) {
        response.writeHead(200, ('Success'), {
            "Content-Type": "application/json"
        });

        response.end(JSON.stringify(matchedName));
    } else if (matchedDescription.length > 0) {
        response.writeHead(200, ('Success'), {
            "Content-Type": "application/json"
        });

        response.end(JSON.stringify(matchedDescription));
    }

    response.writeHead(200, ('Success'), {
        "Content-Type": "application/json"
    });

    response.end(JSON.stringify(products));

});

myRouter.post('/api/login', function (request, response) {
    const email = request.body.email;
    const password = request.body.password;

    //check to see if there was an email and password in the request
    if (!email || !password) {
        response.writeHead(400, {
            'Content-Type': "html/text"
        })
        response.end("400 Error: Either username or password was left empty in the request ")
    }

    if (email && password) {
        // find the user with that email and password
        currentSessionUser = users.find(user => user.email === email && user.login.password === password);

        if (!currentSessionUser) {
            response.writeHead(401, {
                'Content-Type': "text/plain"
            })
            response.end("401 Error: Either the email or password was invalid ")
        }


        if (currentSessionUser) {
            // now that user has been verified we can issue an access token
            let verifiedUser = {
                email: email,
                token: uid(16)
            }
            //now add verified user to the verifiedUsers array in memory
            verifiedUsers.push(verifiedUser);

            response.writeHead(200, ('Success'), {
                'content-type': 'application/json'
            });

            return response.end(JSON.stringify(verifiedUser.token));
        }
    }


});

/////////// PATHS BELOW REQUIRED YOU TO BE LOEGGED IN /////////

myRouter.get('/api/me/cart', function (request, response) {
    let currentSession = getValidTokenFromRequest(request);
    if (!currentSession) {
        // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
        response.writeHead(401, {
            'Content-Type': "text/plain"
        });
        return response.end("401 error: Must have valid token to access the cart");
    }

    response.writeHead(200, {
        'Content-Type': 'application/json'
    })
    // Return all products in user's cart


    response.end(JSON.stringify(currentSessionUser.cart))
})

myRouter.post('/api/me/cart', function (request, response) {
    let currentSession = getValidTokenFromRequest(request);
    if (!currentSession) {
        // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
        response.writeHead(401, {
            'Content-Type': "text/plain"
        });
        return response.end("401 error: Must have valid token to access the cart");
    }

    // Edge Case for adding the same product more than once 
    //Checks to see if the product being added already exists in the user's cart
    let duplicateProduct = currentSessionUser.cart.find((product) => {
        return product.id === request.body.product.id
    })

    if (duplicateProduct) {
        response.writeHead(401, {
            'Content-Type': 'text/plain'
        });
        return response.end("ERROR: The product you tried to add already exists in the user's cart, Try the UPDATE path");
    }


    //Match the requested product id with the a product in the products store
    let newProduct = products.find((product) => {
        return product.id === request.body.id
    })
    //Edge Case for if the product doesn't exist in the Products store
    if (!newProduct) {
        response.writeHead(401, {
            'Content-Type': 'text/plain'
        });
        return response.end("This product does not exist");
    }

    // Added Quantity key to the product being added to handle if it is added again
    newProduct.quantity = 1
    // Added the newProduct to the currentSessionUser's so that it only exist in that users cart
    currentSessionUser.cart.push(newProduct)

    response.writeHead(200, {
        'Content-Type': 'application/json'
    })

    // Return all products in user's cart
    response.end(JSON.stringify(currentSessionUser.cart))
})

myRouter.put('/api/me/cart/:productId', function (request, response) {
    let currentSession = getValidTokenFromRequest(request);
    if (!currentSession) {
        // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
        response.writeHead(401, {
            'Content-Type': "text/plain"
        });
        return response.end("401 error: Must have valid token to access the cart");
    }

    //Send an error if the cart is empty 
    if (currentSessionUser.cart.length === 0) {
        response.writeHead(401, {
            'Content-Type': "text/plain"
        });
        return response.end("401 error: INVALID ACTION the currentSessionUser's Cart is empty");
    }

    // Edge case for if the quantity sent was negative or zero
    let requestedQuantity = request.body.quantity;
    if (requestedQuantity < 1) {
        response.writeHead(401, {
            'Content-Type': "text/plain"
        });
        return response.end("401 error: Quantity can't be Zero or a Negative");
    }
    // The product we will need to find and update the quantity of
    let requestedProductId = request.params.productId

    //Check to see if the product exists in the cart so we can update the quantity and if so return index for reference
    let cartProductIndex = currentSessionUser.cart.findIndex(product => {
        return product.id === requestedProductId;
    })

    //Now use the the cartProductIndex to update the request product with the requested quantity

    currentSessionUser.cart[cartProductIndex].quantity = requestedQuantity;




    response.writeHead(200, {
        'Content-Type': 'application/json'
    })

    // We Are just going to send back the product that was updated in the cart
    response.end(JSON.stringify(currentSessionUser.cart[cartProductIndex]))
})

myRouter.delete('/api/me/cart/:productId', function (request, response) {
    let currentSession = getValidTokenFromRequest(request);
    if (!currentSession) {
        // If there isn't an access token in the request, we know that the user isn't logged in, so don't continue
        response.writeHead(401, {
            'Content-Type': "text/plain"
        });
        return response.end("401 error: Must have valid token to access the cart");
    }

    //Send an error if the cart is empty 
    if (currentSessionUser.cart.length === 0) {
        response.writeHead(401, {
            'Content-Type': "text/plain"
        });
        return response.end("401 error: INVALID ACTION the currentSessionUser's Cart is empty");
    }

    // productToDelete is need to find the product we want to remove from the cart
    let productToDelete = request.params.productId;

    //Next see if the Id given in the request matches a product Id in the user's cart
    let productExists = currentSessionUser.cart.find(product => {
        return product.id === productToDelete;
    })

    if (!productExists) {
        res.writeHead(404, {
            'Content-Type': "text/plain"
        });
        return res.end("404: The Product you requested to be deleted does not exist in the user's cart");
    }

    // Next Filter the user's cart so that the product requested for deletion doesn't exist in the cart anymore
    
    let cartAfterDeletion = currentSessionUser.cart.filter(product => {
        return product.id !== productToDelete
    })

    //Now set the currentSessionUser's cart to eqaul the newly filter out array
    currentSessionUser.cart = cartAfterDeletion;



    response.writeHead(200, {
        'Content-Type': 'application/json'
    })

    // We Are going to sen back the cart so the front-end knows what the cart looks like after deleting the request product for deletion
    response.end(JSON.stringify(currentSessionUser.cart))
})

// Used for testing
module.exports = server;