var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
var url = require('url')
let chai = require('chai');
let chaiHttp = require('chai-http');

chai.use(chaiHttp);
const PORT = 3001;

//  helper functions & variables  ***********************
let brands = [];

// accessToken has values so it could be tested in test.js, otherwise this variable would be empty
let accessTokens = [{
    username: "fakeUser123",
    lastUpdated: new Date(),
    token: "abc1234"
}];

// A variable to limit validity of access tokens to 15 minutes
const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

// helper function - validate tokens from requests
var getValidTokenFromRequest = function (request) {
    var parsedUrl = require('url').parse(request.url, true)
    if (parsedUrl.query.accessToken) {
        // Verify the access token to make sure its valid and not expired
        let currentAccessToken = accessTokens.find((accessToken) => {
            return accessToken.token == parsedUrl.query.accessToken && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
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

// ROUTER set up
var myRouter = Router();
myRouter.use(bodyParser.json());

const server = http.createServer((request, response) => {
    myRouter(request, response, finalHandler(request, response));
}).listen(PORT, error => {
    if (error) {
        return console.log("Error on Server Startup: ", error);
    }
    // setting up Brands, Products and Users
    fs.readFile("./initial-data/products.json", "utf8", (error, data) => {
        if (error) throw error;
        products = JSON.parse(data);
        console.log(`Server setup: ${products.length} products loaded`);
    });
    fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
        console.log(`Server setup: ${brands.length} brands loaded`);
    });
    fs.readFile("./initial-data/users.json", "utf8", (error, data) => {
        if (error) throw error;
        users = JSON.parse(data);
        console.log(`Server setup: ${users.length} users loaded`);
    });
    console.log(`Server is listening on ${PORT}`);
});

//****************************************************************************/
// All users of API can access --- public
myRouter.get("/api/brands", (request, response) => {
    if (!brands) {
        response.writeHead(404, 'No brands found', {
            "Content-Type": "application/json"
        });
        response.end();
    }
    response.writeHead(200, 'Retrieved all brands', {
        "Content-Type": "application/json"
    });
    response.end(JSON.stringify(brands));

});

//****************************************************************************/
// products by brand-ID  --- public
myRouter.get('/api/brands/:id/products', (request, response) => {

    const {
        id
    } = request.params;
    let findBrandId = brands.find(brand => {
        return brand.id === request.params.id;
    });
    if (!findBrandId) {
        response.writeHead(404, 'Brand not found with given ID', {
            "Content-Type": "application/json"
        });
        response.end();
    }
    const brandAfterFilter = products.filter(filteredBrand => filteredBrand.categoryId === id);
    response.writeHead(200, 'All products with this brand ID', {
        "Content-Type": "application/json"
    });
    response.end(JSON.stringify(brandAfterFilter))

});

//****************************************************************************/
// GET all products /api/products    --- public
myRouter.get('/api/products', function (request, response) {
    let searchTerm = url.parse(request.url).query
    let queryObject = queryString.parse(searchTerm)
    let queryTerm = queryObject.query

    // getting match of query with name of product
    let matchingProduct = products.filter((product) => {
        return product.name == queryTerm;
    });

    if (matchingProduct.length == 0) {
        response.writeHead(402, 'Missing name of the product you are searching for');
        response.end();
        return;
    } else {
        response.writeHead(200, {
            'Content-Type': 'application/json'
        });
        response.end(JSON.stringify(matchingProduct));
    }
});

//****************************************************************************/
// POST /api/login rout
myRouter.post('/api/login', (request, response) => {
    //check for password and username was included in request
    if (request.body.username && request.body.password) {
        //verify that request is matching user in database
        let user = users.find(user => {
            return (
                user.login.username == request.body.username &&
                user.login.password == request.body.password
            )
        })
        if (user) {
            //when successful, return json header
            response.writeHead(
                200,
                Object.assign({
                    'Content-Type': 'application/json'
                })
            )
            // if accessToken included use that token
            let currentAccessToken = accessTokens.find(accessToken => {
                return (
                    accessToken.token == new Date() - accessToken.lastUpdated < TOKEN_VALIDITY_TIMEOUT
                )
            })
            // Update time stamp on token
            if (currentAccessToken) {
                currentAccessToken.lastUpdated = new Date()
                response.end(JSON.stringify(currentAccessToken.token))
                return
            } else {
                // new token
                let newAccessToken = {
                    username: user.login.username,
                    lastUpdated: new Date(),
                    token: uid(16)
                }
                accessTokens.push(newAccessToken)
                response.end(JSON.stringify(newAccessToken.token))
                return
            }
        } else {
            response.writeHead(406, 'Invalid username or password.')
            response.end()
            return
        }
    } else {
        //no username or password in the request, throw a 405
        response.writeHead(405, 'incorrect username and password.')
        response.end()
        return
    }
})
//****************************************************************************/
// GET /api/me/cart
myRouter.get('/api/me/cart', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request)
    if (!currentAccessToken) {
        response.writeHead(400, 'Access not authorized - need to be logged in')
        response.end()
        return
    } else {
        // search for user by username parameters 
        let user = users.find(user => {
            return user.login.username == currentAccessToken.username
        })
        response.writeHead(
            200,
            Object.assign({
                'Content-Type': 'application/json'
            })
        )
        //show cart if the user is logged in
        response.end(JSON.stringify(user.cart))
        return
    }
})
//****************************************************************************/
// POST api/me/cart:id
myRouter.post('/api/me/cart/:id', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request)

    if (!currentAccessToken) {
        response.writeHead(
            400,
            'no access, log-in failed'
        )
        response.end()
        return
    } else {
        // look for user using accessToken
        let user = users.find(user => {
            return user.login.username == currentAccessToken.username
        })

        //find product using its id
        let toAdd = products.find(product => {
            return product.id == request.params.id
        })

        //compare ID with product ID already in the cart
        let findProduct = user.cart.find(item => {
            return item.product.id == request.params.id
        })
        //if not matching ID found in the cart
        if (!toAdd) {
            response.writeHead(405, 'Product not found, no matching Id')
            response.end()
            return
        } else if (findProduct) {
            // if the product is already in the cart, increase the quantity
            findProduct.quantity++
            response.writeHead(201, Object.assign({
                'Content-Type': 'application/json'
            }))
            response.end(JSON.stringify(user.cart))
            return
        } else {
            //for new product create new cartItem
            let cartItem = {}
            cartItem.quantity = 1
            cartItem.product = toAdd
            user.cart.push(cartItem)
            response.writeHead(
                200,
                Object.assign({
                    'Content-Type': 'application/json'
                })
            )
            response.end(JSON.stringify(user.cart))
            return
        }
    }
})
//****************************************************************************/
//DELETE products from cart
myRouter.delete('/api/me/cart/:id', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request)

    //if not logged in trow error
    if (!currentAccessToken) {
        response.writeHead(
            400,
            'Access not authorized - need to be logged-in'
        )
        response.end()
        return
    } else {
        //find the user by token
        let user = users.find(user => {
            return user.login.username == currentAccessToken.username
        })

        //find the product in the cart
        let findProduct = user.cart.find(item => {
            return item.product.id == request.params.id
        })

        //error if no matching product in the cart
        if (!findProduct) {
            response.writeHead(
                410,
                'ID doesnt match products in the shopping cart'
            )
            response.end()
            return
        }
        //update shopping cart 
        let newCart = user.cart.filter(item => {
            return item.product.id !== request.params.id
        })

        user.cart = newCart
        response.writeHead(
            200,
            Object.assign({
                'Content-Type': 'application/json'
            })
        )
        response.end(JSON.stringify(user.cart))
        return
    }
})

//****************************************************************************/
//EDIT/change quantity in the cart
myRouter.post('/api/me/cart', (request, response) => {
    let currentAccessToken = getValidTokenFromRequest(request)

    //url call parsing
    const parsedUrl = require('url').parse(request.url, true)

    //if not logged in trow error
    if (!currentAccessToken) {
        response.writeHead(
            400,
            'Access not authorized - need to be logged-in'
        )
        response.end()
        return
    } else {
        let user = users.find(user => {
            return user.login.username == currentAccessToken.username
        })

        //find product in the cart - check if parameters for ID and quantity exist in parse
        if (parsedUrl.query.id && parsedUrl.query.quantity) {
            let updateProduct = user.cart.find(item => {
                return item.product.id == parsedUrl.query.id
            })

            //if ID doesnt match ID in the cart return error
            if (!updateProduct) {
                response.writeHead(
                    410,
                    'ID doesnt match products in the shopping cart'
                )
                response.end()
                return
            }
            //find product
            let newCart = user.cart.filter(item => {
                return item.product.id !== parsedUrl.query.id
            })

            let newQuantity = parsedUrl.query.quantity
            updateProduct.quantity = newQuantity

            //update cart with new quantity
            newCart.cartItem = updateProduct
            response.writeHead(
                200,
                Object.assign({
                    'Content-Type': 'application/json'
                })
            )
            response.end(JSON.stringify(user.cart))
            return
        } else {
            response.writeHead(411, 'missing ID or quantity in request')
            response.end()
            return
        }
    }
});

// export to test file for Chai
module.exports = server