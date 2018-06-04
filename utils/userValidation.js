const fs = require('fs');
const uid = require('rand-token').uid;
const productUtils = require('../dataUtils/products'); 

const TOKEN_VALIDITY_TIMEOUT = 0.5 * 60 * 1000; // 30seconds for now, easier to check.
let users = [];
let failedLoginAttempts = {};
let accessTokens = [];

module.exports = {
  initializeData() {
    // Reads Users.json and pushing it to user array.
    fs.readFile('./initial-data/users.json', 'utf8', function (error, data) {
      if (error) throw error;
      users = JSON.parse(data);
      console.log(`Server setup: ${users.length} users loaded`);
    });
  },

  checkValidUser(userObject){
    // if user failed to login more than 3 times. return code 1
    if(failedLoginAttempts[userObject.username] > 3){
      return null;
    }

    let user = users.find(user => user.login.username == userObject.username && user.login.password == userObject.password);
    
    // if user failed to login, add 1 to failed login attempts.
    if(!user){
      if(!failedLoginAttempts[userObject.username]){
        failedLoginAttempts[userObject.username] = 1;
      } else {
        failedLoginAttempts[userObject.username]++;
      }
    } else {
      // if user successfully logged in, reset to 0
      failedLoginAttempts[userObject.username] = 0
    }

    return user;
  },

  getNewToken(userObject){
    let newAccessToken = {
      username: userObject.username,
      lastUpdated: new Date(),
      token: uid(16)
    }
    accessTokens.push(newAccessToken);
    return newAccessToken.token;
  },

  checkValidToken(request) {
    // if token exist, find it in the token array.
    if(request.token){
      let currentAccessToken = accessTokens.find((accessToken) => {
        return accessToken.token == request.token && ((new Date) - accessToken.lastUpdated) < TOKEN_VALIDITY_TIMEOUT;
      });
      // if AccessToken found and not expired, update token expiration, and return it.
      if (currentAccessToken) {
        currentAccessToken.lastUpdated = new Date();
        return currentAccessToken;
      } else {
        // if accessToken found, but expired, then remove the token from token list.
        // users will need to get a new token on login, rather than updating their expired tokens.
        if(accessTokens.indexOf(request.token) !== -1){
          accessTokens.splice(accessTokens.indexOf(request.token),1);
        }
        return null;
      }
    } else {
      return null;
    }
  },

  // Using token to find username, and return user's cart.
  getUserCart(token){
    let username = accessTokens.find(accessToken => accessToken.token == token).username;
    let cart = users.find(user => user.login.username == username).cart;
    return cart;
  },
  
  // Adds product to user's cart
  addProduct(request){
    let username = accessTokens.find(accessToken => accessToken.token == request.headers.token).username;
    let product = productUtils.getProduct(request.body.productId);

    users.find(user => user.login.username == username).cart.push(product);
    return true;
  },

  // remove product from user's cart completely
  removeProduct(request){
    let username = accessTokens.find(accessToken => accessToken.token == request.headers.token).username;
    let cartItem = productUtils.getProduct(request.body.productId);
    let cart = users.find(user => user.login.username == username).cart;
    let cartItemExist = cart.find(item => item.id == cartItem.id);
    if(cartItemExist){
      let newCart = cart.filter(item => item.id != cartItem.id);
      users.find(user => user.login.username == username).cart = newCart;
      return true;
    } else{
      return false;
    }
  },

  // update product amount, but if it is less than or equal 0, remove from cart.
  updateProduct(request){
    let username = accessTokens.find(accessToken => accessToken.token == request.headers.token).username;
    let cartItem = productUtils.getProduct(request.body.productId);
    let cart = users.find(user => user.login.username == username).cart;
    let cartItemExist = cart.find(item => item.id == cartItem.id);
    let updateAmount = parseInt(request.body.amount);
    if(cartItemExist){
      let newCart = cart.filter(item => item.id != cartItem.id);
      if(updateAmount > 0){
        updatedItem = Object.assign(cartItem, {"amount":updateAmount});
        newCart.push(updatedItem);
      }
      users.find(user => user.login.username == username).cart = newCart;
      return true;
    } else{
      let newCart = cart.filter(item => item.id != cartItem.id);
      if(updateAmount > 0){
        updatedItem = Object.assign(cartItem, {"amount":updateAmount});
        newCart.push(updatedItem);
      }
      users.find(user => user.login.username == username).cart = newCart;
      return true;
    }
  }
}