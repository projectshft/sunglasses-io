var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var uid = require('rand-token').uid;
var brands = require('../initial-data/brands.json');
var products = require('../initial-data/products.json')
var users = require('../initial-data/users.json')
const PORT = 3001;

var accessTokens = [];

// Setup router
var myRouter = Router();
myRouter.use(bodyParser.json());

function tokenCheck(token) {
    currentToken = accessTokens.find(tokenObject =>{
        return tokenObject.token == token
    })
    if(currentToken){
        var user = users.find(person => {
            return person.login.username == currentToken.userName
        })
    }
    return user
}

http.createServer(function (request, response) {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    myRouter(request, response, finalHandler(request, response))
}).listen(PORT, (error) => {
    if (error) {
        console.log(error)
    }
    console.log(`Server is listening to port ${PORT} `)
});


myRouter.get('/api/brands', function (request, response) {
    response.end(JSON.stringify(brands))
})

myRouter.get('/api/brands/:id/products', function (request, response) {
    let brandID = request.params.id
    selected_products = products.filter((product) => product.categoryId == brandID)
    response.end(JSON.stringify(selected_products))
})
// myRouter.get('/api/time', (request, response) =>{
//     var token = uid(10);
//     response.end(JSON.stringify(token))
// } )
myRouter.post('/api/login', (request, response) => {
    if(request.body.username && request.body.password){
        var user = users.find((user) => {
         return user.login.username == request.body.username && user.login.password == request.body.password
        })
    } else {
        return response.writeHead(401, "Invalid username or password").end()
    }
    if(user){
        var currentUserToken = accessTokens.find(tokenObject => {
          return tokenObject.username == user.login.username;
        })
    }
    if(currentUserToken){
        currentUserToken.lastUpdated = new Date ()
        return response.end()
    } else {
        let newAccessToken = {
            userName: user.login.username,
            lastUpdated: new Date(),
            token: "ABC"
            // token: uid(16)
        } 
        accessTokens.push(newAccessToken)
        return response.end(JSON.stringify(newAccessToken))
    }
})

myRouter.get('/api/me/cart', function (request, response) {
    // currentToken = accessToken array find the token object that matches the token that user send(in request.headers.token)
    // if current token is valid, find user that the token belong to
    // user = users array find user that is the same as currentToken.username
    // return user.cart
    console.log('Hi')
    user = tokenCheck(request.headers.token)

    if (user) {
        return response.end(JSON.stringify(user.cart))
    } else {
        return response.writeHead(401).end()
    }

    // currentToken = accessTokens.find(tokenObject =>{
    //     return tokenObject.token == request.headers.token
    // })
    // if(currentToken){
    //     var user = users.find(person => {
    //         return person.login.username == currentToken.userName
    //     })
    //     return response.end(JSON.stringify(user.cart))
    // } else {
    //     response.writehead(401, 'User does not exist')
    // }
})

myRouter.post('/api/me/cart', function (request, response) {
    //if product id matches product id in DB 
    //match user token to get user then add product to user cart
    if(request.body.productId){
        var product = products.find(model =>{
            return model.id == request.body.productId
        })
    } else {
        response.writehead(400, 'This product does not exist')
        return response.end();
    }
    user = tokenCheck(request.headers.token)
    if(user && product){
        
        //     var currentToken = accessTokens.find(existingToken =>{
    //         return existingToken.token == request.headers.token
    //     })
    // } else {
    //    return response.writehead(401, 'user not logged in').end()
    // }
    // if(currentToken){
    //     var user = users.find(person =>{
    //         return person.login.username == currentToken.userName
    //     })
    // } else {
    //     return response.writehead(401, 'User not found').end();
    // }
    let existingItem = user.cart.find(order =>{
        return order.id == request.body.productId
    })
    if(existingItem) {
        existingItem.quantity += 1
    } else {
        var addProduct = Object.assign({}, product)
        addProduct.quantity = request.body.quantity || 1
        user.cart.push(addProduct)
    }
    response.end(JSON.stringify(user.cart))
    } else {
        return response.writeHead(401).end()
    }
})

myRouter.post('/api/me/cart/:productid', function (request, response) {
    //use product id to find the product in user's cart
    // if(request.headers.token){
    //     var currentToken = accessTokens.find(existingToken =>{
    //         return existingToken.token == request.headers.token
    //     })
    // } else {
    //    return response.writehead(401, 'user not logged in').end()
    // }
    // if(currentToken){
    //     var user = users.find(person =>{
    //         return person.login.username == currentToken.userName
    //     })
    // } else {
    //     return response.writehead(401, 'User not found').end();
    // }
    user = tokenCheck(request.headers.token)
    if(user && request.body.quantity && request.body.quantity > 0) {
        user.cart.forEach(cartProduct =>{
            if(cartProduct.id == request.params.productid){
                cartProduct.quantity = request.body.quantity
            }
        })
    }

    response.end(JSON.stringify(user.cart))
})

myRouter.delete('/api/me/cart/:productid', function (request, response) {
    //find user 
    //Use user cart to get productid to match the params.product.id
    //filter out the produc that i do not want
    //reassign the new array to user cart
    // if(request.headers.token){
    //     var currentToken = accessTokens.find(existingToken =>{
    //         return existingToken.token == request.headers.token
    //     })
    // } else {
    //    return response.writehead(401, 'user not logged in').end()
    // }
    // if(currentToken){
    //     var user = users.find(person =>{
    //         return person.login.username == currentToken.userName
    //     })
    // } else {
    //     return response.writehead(401, 'User not found').end();
    // }
    user = tokenCheck(request.headers.token)
    if(user){
    var newCart = user.cart.filter(cartItem =>{
        return cartItem.id != request.params.productid
    })
    user.cart = newCart

    response.end(JSON.stringify(user.cart))
}
})
myRouter.get('/api/products', (request, response) => {
    console.log('Hi!')
    response.end(JSON.stringify(products))
})
