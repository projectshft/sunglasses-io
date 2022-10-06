/* eslint-disable no-unused-vars */
/* eslint-disable indent */
var http = require('http');
var fs = require('fs');
var finalHandler = require('finalhandler');
var queryString = require('querystring');
var Router = require('router');
var bodyParser = require('body-parser');
var url = require('url');
var uid = require('rand-token').uid;

var brands = [];
var products = [];
var users = [];
var accessTokens = [];

const PORT = 3001;

const TOKEN_VALIDITY_TIMEOUT = 15 * 60 * 1000;

let router = Router();
router.use(bodyParser.json());

const server = http.createServer((req, res) => {
  res.writeHead(200);
  router(req, res, finalHandler(req, res));
});

server.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`Server running on port ${PORT}`);
  brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf8'));
  products = JSON.parse(
    fs.readFileSync('./initial-data/products.json', 'utf8')
  );
  users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
});

router.get('/api/brands', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(brands));
});

router.get('/api/products', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(products));
});

router.get('/api/users', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  return res.end(JSON.stringify(users));
});

router.get('/api/brands/:categoryId/products', (req, res) => {
  let categoryId = req.params.categoryId;
  let brandId = parseInt(categoryId);
  if (categoryId == 'undefined' || categoryId == null) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        error: 'Category Id is required',
      })
    );
  } else {
    if (isNaN(brandId) == true) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          error: 'Category Id should be a number',
        })
      );
    } else {
      if (brandId < 1 || brandId > 5) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({
            error: 'Invalid Request: Category Id should be between 1 and 5',
          })
        );
      } else {
        if (brandId % 1 != 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({
              error: 'Invalid Request: Category Id should be an integer',
            })
          );
        } else {
            let filteredProducts = [];
            filteredProducts.push(
              products.filter((product) => {
                return product.categoryId == categoryId;
              })
            );
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(filteredProducts));
        }
      }
    }
  }
});

router.post('/api/login', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let user = users.find((user) => {
    return user.login.username == username && user.login.password == password;
  });
  if (!user) {
    res.writeHead(401, 'Invalid username or password');
    return res.end();
  } else if (user) {
    let currentAccessToken = accessTokens.find((tokenObject) => {
      return tokenObject.username == username.login.username;
    });
    if (currentAccessToken) {
      currentAccessToken.lastUpdated = new Date();
      return res.end(JSON.stringify(currentAccessToken.token));
    } else {
      let newAccessToken = {
        username: user.login.username,
        lastUpdated: new Date(),
        token: uid(16),
      };
      accessTokens.push(newAccessToken);
      console.log(accessTokens[0].token);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(newAccessToken));
    }
  }
});

var isTokenValid = (token) => {
  let currentAccessToken = accessTokens.find((tokenObject) => {
    return tokenObject.token == token;
  });
  if (currentAccessToken) {
    let lastUpdated = new Date(currentAccessToken.lastUpdated);
    let currentTime = new Date();
    if (currentTime - lastUpdated < TOKEN_VALIDITY_TIMEOUT) {
      return true;
    }
  }
  return false;
};

//ADD item to cart
router.post('/api/me/cart', (req, res) => {
  let token = url.parse(req.url, true).query.token;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message:
          'Invalid token: You need to have access to this call to continue',
      })
    );
  } else {
    if (isTokenValid(token) == true) {
      var addItemToCart = req.body;
      var idString = req.body.id;
      var quantity = req.body.quantity;

      if (
        idString == undefined ||
        quantity == undefined ||
        idString == '' ||
        quantity == ''
      ) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({
            message:
              'Invalid request: product id and product quantity required',
          })
        );
      } else {
        var id = parseInt(idString);
        if (isNaN(id) == true || isNaN(quantity) == true) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({
              message:
                'Invalid request: product id and product quantity must be numbers',
            })
          );
        } else {
          if (id < 1 || id > 11) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(
              JSON.stringify({
                message: 'Invalid request: product id does not exist',
              })
            );
          } else {
            // limit quantity to 5
            if (quantity < 1 || quantity > 5) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(
                JSON.stringify({
                  message:
                    'Invalid request: product quantity must be between 1 and 5',
                })
              );
            } else {
              if (id % 1 != 0 || quantity % 1 != 0) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(
                  JSON.stringify({
                    message:
                      'Invalid request: product id and product quantity must be integers',
                  })
                );
              } else {
                let user = users[0];
                user.cart.push(addItemToCart);
                console.log(user.cart);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(user.cart));
              }
            }
          }
        }
      }
    }
  }
});

// VIEW items in cart
router.get('/api/me/cart', (req, res) => {
  let token = url.parse(req.url, true).query.token;
  let cartItems = users[0].cart;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message:
          'Invalid token: You need to have access to this call to continue',
      })
    );
  } else {
    if (cartItems.length == 0) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          message: 'Your cart is empty',
        })
      );
    } else {
      console.log(cartItems);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(cartItems));
    }
  }
});

// //REMOVE item from cart
router.delete('/api/me/cart/:id', (req, res) => {
  let token = url.parse(req.url, true).query.token;
  let idString = req.params.id;
  let id = parseInt(idString);
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message:
          'Invalid token: You need to have access to this call to continue',
      })
    );
  } else {
    if (id == undefined || id == '') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          message: 'Invalid request: product id required',
        })
      );
    } else {
      if (isNaN(id) == true) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({
            message: 'Invalid request: product id must be a number',
          })
        );
      } else {
        if (id < 1 || id > 11) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({
              message: 'Invalid request: product id must be between 1 and 11',
            })
          );
        } else {
          if (id % 1 != 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(
              JSON.stringify({
                message: 'Invalid request: product id must be an integer',
              })
            );
          } else {
            let user = users[0];
            let cartItems = user.cart;
            if (cartItems.length == 0) {
              res.writeHead(404, { 'Content-Type': 'application/json' });
              return res.end(
                JSON.stringify({
                  message: 'Cannot delete item because your cart is empty',
                })
              );
            } else {
              let cartAfterRemove = cartItems.filter(
                (item) => item.id !== idString
              );
              user.cart = cartAfterRemove;
              console.log(user.cart);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify(user.cart));
            }
          }
        }
      }
    }
  }
});

//UPDATE item in cart by product id
router.post('/api/me/cart/:id', (req, res) => {
  let token = url.parse(req.url, true).query.token;
  if (isTokenValid(token) == false) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    return res.end(
      JSON.stringify({
        message:
          'Invalid token: You need to have access to this call to continue',
      })
    );
  } else {
    let idString = req.params.id;
    let id = parseInt(idString);
    if (id == undefined || id == '') {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(
        JSON.stringify({
          message: 'Invalid request: product id required',
        })
      );
    } else {
      if (isNaN(id) == true) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({
            message: 'Invalid request: product id must be a number',
          })
        );
      } else {
        if (id < 1 || id > 11) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({
              message: 'Invalid request: product id must be between 1 and 11',
            })
          );
        } else {
          if (id % 1 != 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(
              JSON.stringify({
                message: 'Invalid request: product id must be an integer',
              })
            );
          } else {
            let user = users[0];
            if (req.body.quantity == undefined || req.body.quantity == '') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              return res.end(
                JSON.stringify({
                  message: 'Invalid request: product quantity required',
                })
              );
            } else {
              let quantity = req.body.quantity;
              if (isNaN(quantity) == true) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(
                  JSON.stringify({
                    message:
                      'Invalid request: product quantity must be a number',
                  })
                );
              } else {
                if (quantity < 1 || quantity > 5) {
                  res.writeHead(400, { 'Content-Type': 'application/json' });
                  return res.end(
                    JSON.stringify({
                      message:
                        'Invalid request: product quantity must be between 1 and 5',
                    })
                  );
                } else {
                  if (quantity % 1 != 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(
                      JSON.stringify({
                        message:
                          'Invalid request: product quantity must be an integer',
                      })
                    );
                  } else {
                    let cartItems = user.cart;
                    let cartAfterUpdate = cartItems.map((item) => {
                      if (item.id == id) {
                        item.quantity = req.body.quantity;
                      }
                      return item;
                    });
                    if (cartItems == cartAfterUpdate) {
                      res.writeHead(404, {
                        'Content-Type': 'application/json',
                      });
                      return res.end(
                        JSON.stringify({
                          message:
                            'The item with the specified id does not exist in your cart',
                        })
                      );
                    } else {
                      user.cart = cartAfterUpdate;
                      if (user.cart.length == 0) {
                        res.writeHead(404, {
                          'Content-Type': 'application/json',
                        });
                        return res.end(
                          JSON.stringify({
                            message:
                              'Cannot update item because your cart is empty',
                          })
                        );
                      } else {
                        console.log(user.cart);
                        res.writeHead(200, {
                          'Content-Type': 'application/json',
                        });
                        return res.end(JSON.stringify(user.cart));
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

module.exports = server;
