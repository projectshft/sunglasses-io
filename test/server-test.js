let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');
var fs = require('fs');
var uid = require('rand-token').uid;
let should = chai.should();
let { expect } = chai;
let Brand = require('../app/models/brands');
let Product = require('../app/models/products');
let User = require('../app/models/users');
const Token = require('../app/models/tokens');
// mocha test/server-test.js --watch

chai.use(chaiHttp);

describe("When a request to provide a list of products is received", () => {
  beforeEach(() => {
    Product.removeAll();
    Product.resetId();
    Product.addProducts(JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")));
  })
  describe("And no query parameter is provided", () => {
    describe("the response", () => {
      it("should return an array of all products", done => {
        // arrange
        const fullProductList = JSON.parse(fs.readFileSync("initial-data/products.json", "utf8"));
        // act
        chai
          .request(server)
          .get('/v1/products')
          .end((err, res) => {
            // assert
            res.should.have.status(200);
            res.body.should.be.deep.equal(fullProductList);
            done();
          })
      })
    })
  })

  describe("And a query parameter is provided", () => {
    describe("which matches no products", () => {
      describe("the response", () => {
        it("should return an empty array", done => {
          // arrange
          const queryWithNoMatch = "lskdjflksjl";
          // act
          chai
            .request(server)
            .get(`/v1/products`)
            .query({query: queryWithNoMatch})
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.should.have.lengthOf(0);
              done();
            })
        })
      })
    })

    describe("which matches with products", () => {
      describe("the response", () => {
        it("should return an array with only the products matching the query", done => {
          // arrange
          const queryWithMatch = "normal";
          const match = [{
            "id": "5",
            "categoryId": "2",
            "name": "Glasses",
            "description": "The most normal glasses in the world",
            "price":150,
            "quantityAvailable": 0,
            "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }];
          // act
          chai
            .request(server)
            .get(`/v1/products?query=${queryWithMatch}`)
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              res.body.should.deep.equal(match);
              done();
            })
        })
      })
    })
  })
})

describe("When a brands request is received", () => {
  beforeEach(() => {
    Brand.removeAll();
    Brand.resetId();
    Brand.addBrands(JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8")));
  });
  describe("the response", () => {
    it("should return the current list of brands", done => {
      //arrange
      let brandsList = JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8"));
      //act
      chai
        .request(server)
        .get('/v1/brands')
        .end((err, res) => {
          //assert
          res.should.have.status(200);
          res.body.should.be.an('array');
          res.body.should.have.lengthOf(brandsList.length);
          res.body.should.deep.equal(brandsList);
          done();
        })
    })
  })
})

describe("When a request for the products of a certain brand is received", () => {
  beforeEach(() => {
    Brand.removeAll();
    Brand.resetId();
    Product.removeAll();
    Product.resetId();
    // Loads the initial data
    Brand.addBrands(JSON.parse(fs.readFileSync("initial-data/brands.json", "utf8")));
    Product.addProducts(JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")));
  })
  describe("and an invalid brand id is given", () => {
    describe("the response", () => {
      it("should return a 404 error", done => {
        // arrange
        const invalidBrandId = 'a';
        // act
        chai
          .request(server)
          .get(`/v1/brands/${invalidBrandId}/products`)
          .end((err, res) => {
            //assert
            res.should.have.status(404);
            //TODO Something to test the error message
            done();
          })
      })
    })
  })

  describe("and a valid brand id is given", () => {
    describe("but the brand has no associated products", () => {
      describe("the response", () => {
        it("should return an empty array", done => {
          // arrange
          const newBrandWithoutProducts = Brand.addBrand({"name": "Old Navy"})
          // act
          chai
            .request(server)
            .get(`/v1/brands/${newBrandWithoutProducts.id}/products`)
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.should.have.lengthOf(0);
              done();
            })
        })
      })
    })
    describe("and the brand has products", () => {
      describe("the response", () => {
        it("should return an array of products from that company", done => {
          // arrange
          let brandWithProducts = {
            "id": "2",
            "name" : "Ray Ban"
          }
          let productsForbrand = [
            {
              "id": "4",
              "categoryId": "2",
              "name": "Better glasses",
              "description": "The best glasses in the world",
              "price":1500,
              "quantityAvailable": 0,
              "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
            },
            {
              "id": "5",
              "categoryId": "2",
              "name": "Glasses",
              "description": "The most normal glasses in the world",
              "price":150,
              "quantityAvailable": 0,
              "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }]
          // act
          chai
            .request(server)
            .get(`/v1/brands/${brandWithProducts.id}/products`)
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.should.have.lengthOf(2);
              res.body.should.deep.equal(productsForbrand);
              done();
            })
        })
      })
    })
  })
})

describe("When a login request is received", () => {
  beforeEach(() => {
    User.removeAll();
    User.resetId();
    User.addUsers(JSON.parse(fs.readFileSync("initial-data/users.json", "utf8")));
  })
  describe("and the username and/or password is missing", () => {
    describe("the response", () => {
      it("should return a 400 error", done => {
        // arrange
        const loginWithNoPassword = {username: 'bob', password: ''}
        // act
        chai
          .request(server)
          .post('/v1/login')
          .send(loginWithNoPassword)
          .end((err, res) => {
            // assert
            res.should.have.status(400);
            done();
          })
      })
    })
  })
  describe("and the username and password don't match to any user", () => {
    describe("the response", () => {
      it("should return a 401 error", done => {
        // arrange
        const loginInfoWithNoMatch = {username: "greenlion235", password: "wrongPassword"}
        // act
        chai
          .request(server)
          .post('/v1/login')
          .send(loginInfoWithNoMatch)
          .end((err, res) => {
            // assert
            res.should.have.status(401);
            done();
          })
      })
    })
  })
  describe("and the username and password match to a user", () => {
    describe('the response', () => {
      it("should return a valid access token", done => {
        // arrange
        const correctLogin = {username: "greenlion235", password: "waters"}
        // act
        chai
          .request(server)
          .post('/v1/login')
          .send(correctLogin)
          .end((err, res) => {
            // assert
            res.should.have.status(200);
            res.body.should.be.an("object");
            res.body.accessToken.should.be.a("string")
            res.body.accessToken.should.have.lengthOf(16);
            done();
          })
      })
    })
  })
})

describe("When a request for the current shopping cart is received", () => {
  beforeEach(() => {
    User.removeAll();
    User.resetId();
    Token.removeAll();
    Product.removeAll();
    Product.resetId();
    User.addUsers(JSON.parse(fs.readFileSync("initial-data/users.json", "utf8")));
    Product.addProducts(JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")));
  })
  describe("and no or invalid access token is provided", () => {
    describe("the response", () => {
      it("should be a 401 error", done => {
        // arrange
        const badAccessToken = {accessToken: 'ksdfkljsd'};
        // act
        chai
          .request(server)
          .get('/v1/me/cart')
          .query(badAccessToken)
          .end((err, res) => {
            // assert
            res.should.have.status(401);
            done();
          })
      })
    })
  })

  describe("and a valid access token is provided", () => {
    describe("but the shopping cart is empty", () => {
      describe("the reponse", () => {
        it("should return an empty array", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          // act 
          chai
            .request(server)
            .get('/v1/me/cart')
            .query({accessToken: validToken.accessToken})
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.should.have.lengthOf(0);
              done();
            })
        })
      })
    })

    describe("and there are items in the shopping cart", () => {
      describe("the response", () => {
        it("should return an array of the items in the shopping cart", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          const currentUser = User.getUser(validToken.username);
          //TODO fill in expected cart
          const expectedCart = [
            {
              "id": "4",
              "categoryId": "2",
              "name": "Better glasses",
              "description": "The best glasses in the world",
              "price":1500,
              "quantityAvailable": 0,
              "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
            },
            {
              "id": "5",
              "categoryId": "2",
              "name": "Glasses",
              "description": "The most normal glasses in the world",
              "price":150,
              "quantityAvailable": 0,
              "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
          }]
          currentUser.cart = expectedCart;
          // act
          chai
            .request(server)
            .get('/v1/me/cart')
            .query({accessToken: validToken.accessToken})
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              res.body.should.be.an('array');
              res.body.should.deep.equal(expectedCart);
            })
          done();
        })
      })
    })
  })
})

describe("When a request to add an item to the shopping cart is received", () => {
  beforeEach(() => {
    User.removeAll();
    User.resetId();
    Token.removeAll();
    Product.removeAll();
    Product.resetId();
    User.addUsers(JSON.parse(fs.readFileSync("initial-data/users.json", "utf8")));
    Product.addProducts(JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")));
  })
  describe("But an invalid or no access token is provided", () => {
    describe("the reponse", () => {
      it("should be a 401 error", done => {
        // arrange
        const badAccessToken = {accessToken: 'ksdfkljsd'};
        const productToAddToCart = {id: "4"};
        // act
        chai
          .request(server)
          .post('/v1/me/cart')
          .query(badAccessToken)
          .send(productToAddToCart)
          .end((err, res) => {
            // assert
            res.should.have.status(401);
            done();
          })
      })
    })
  })

  describe("And a valid access token is provided", () => {
    describe("But an invalid product id is provided", () => {
      describe("the response", () => {
        it("should be a 404 error", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          const invalidProductToAddToCart = {id: "abd"};
          // act
          chai
            .request(server)
            .post('/v1/me/cart')
            .query({accessToken: validToken.accessToken})
            .send(invalidProductToAddToCart)
            .end((err, res) => {
              // assert
              res.should.have.status(404);
              done();
            })
        })
      })
    })

    describe("But the product isn't available", () => {
      describe("the response", () => {
        it("should be a 409 error", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          //Add the unavailable product
          const unavailableProduct = Product.addProduct({
            "categoryId": "1",
            "name": "hard to find product",
            "description": "Product is never in stock",
            "price": 150,
            "quantityAvailable": 0,
            "imageUrls": [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
            ]
          })
          // act
          chai
            .request(server)
            .post('/v1/me/cart')
            .query({accessToken: validToken.accessToken})
            .send({id: unavailableProduct.id})
            .end((err, res) => {
              // assert
              res.should.have.status(409);
              done();
            })
        })
      })
    })

    describe("And the product is available", () => {
      describe('the response', () => {
        it("should return the shopping cart with the new item added", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          const availableProduct = Product.addProduct({
            "categoryId": "1",
            "name": "popular product",
            "description": "We have a ton in stock",
            "price": 150,
            "quantityAvailable": 20,
            "imageUrls": [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
            ]
          })
          const expectedShoppingCart = [{
            "categoryId": "1",
            "id": availableProduct.id,
            "name": "popular product",
            "description": "We have a ton in stock",
            "price": 150,
            "quantityAvailable": 20,
            "quantity": 1,
            "imageUrls": [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
            ]
          }];
          // act
          chai
            .request(server)
            .post('/v1/me/cart')
            .query({accessToken: validToken.accessToken})
            .send({id: availableProduct.id})
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              res.body.should.be.an("array");
              res.body.should.deep.equal(expectedShoppingCart);
              done();
            })
        })
      })
    })
  })
})

describe("When a request to modify the quantity of a shopping cart item is received", () => {
  beforeEach(() => {
    User.removeAll();
    User.resetId();
    Token.removeAll();
    Product.removeAll();
    Product.resetId();
    User.addUsers(JSON.parse(fs.readFileSync("initial-data/users.json", "utf8")));
    Product.addProducts(JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")));
  })
  describe("But an invalid or no access token is provided", () => {
    describe("the response", () => {
      it("should be a 401 error", done => {
        // arrange
        const badAccessToken = {accessToken: 'ksdfkljsd'};
        const productToModifyInCart = {id: "4"};
        const newQuantity = {quantity: 2};
        // act
        chai
          .request(server)
          .post(`/v1/me/cart/${productToModifyInCart.id}`)
          .query(badAccessToken)
          .send(newQuantity)
          .end((err, res) => {
            // assert
            res.should.have.status(401);
            done();
          })
      })
    })
  })

  describe("And a valid access token is provided", () => {
    describe("But an invalid product identifier is provided", () => {
      describe("the response", () => {
        it("should be a 404 error", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          const idForProductNotInCart = {id: "4"};
          const newQuantity = {quantity: 2};
          // act
          chai
            .request(server)
            .post(`/v1/me/cart/${idForProductNotInCart.id}`)
            .query({accessToken: validToken.accessToken})
            .send(newQuantity)
            .end((err, res) => {
              // assert
              res.should.have.status(404);
              done();
            })
        })
      })
    })

    describe("But a quantity exceeding the available quantity is provided", () => {
      describe("the response", () => {
        it("should be a 409 error", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          const productWithLimitedQuantity = Product.addProduct({
            "categoryId": "1",
            "name": "popular product",
            "description": "very limited stock",
            "price": 150,
            "quantityAvailable": 2,
            "imageUrls": [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
            ]
          })
          const newQuantity = {quantity: 5};
          // act
          chai.request(server).post('/v1/me/cart').query({accessToken: validToken.accessToken}).send({id: productWithLimitedQuantity.id}).end((err, res) => {
            chai
              .request(server)
              .post(`/v1/me/cart/${productWithLimitedQuantity.id}`)
              .query({accessToken: validToken.accessToken})
              .send(newQuantity)
              .end((err, res) => {
                // assert
                res.should.have.status(409);
                done();
              })
          })
        })
      })
    })

    describe("And a valid product identifier and quantity are provided", () => {
      describe("the response", () => {
        it("should return the shopping cart with the updated quantity", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          const productWithLargeQuantity = Product.addProduct({
            "categoryId": "1",
            "name": "popular product",
            "description": "Lots in stock",
            "price": 150,
            "quantityAvailable": 50,
            "imageUrls": [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
            ]
          });
          const expectedShoppingCart = [{...productWithLargeQuantity, quantity: 5}];
          const newQuantity = {quantity: 5};
          // act
          chai.request(server).post('/v1/me/cart').query({accessToken: validToken.accessToken}).send({id: productWithLargeQuantity.id}).end((err, res) => {
            chai
              .request(server)
              .post(`/v1/me/cart/${productWithLargeQuantity.id}`)
              .query({accessToken: validToken.accessToken})
              .send(newQuantity)
              .end((err, res) => {
                // assert
                res.should.have.status(200);
                res.body.should.be.an("array");
                res.body.should.deep.equal(expectedShoppingCart);
                done();
              })
          })
        })
      })
    })
  })
})

describe("When a request to delete an item from the shopping cart is received", () => {
  beforeEach(() => {
    User.removeAll();
    User.resetId();
    Token.removeAll();
    Product.removeAll();
    Product.resetId();
    User.addUsers(JSON.parse(fs.readFileSync("initial-data/users.json", "utf8")));
    Product.addProducts(JSON.parse(fs.readFileSync("initial-data/products.json", "utf8")));
  })
  describe("But an invalid or no access token is provided", () => {
    describe("the response", () => {
      it("should be a 401 error", done => {
        // arrange
        const badAccessToken = {accessToken: 'ksdfkljsd'};
        const productToDeleteInCart = {id: "4"};
        // act
        chai
          .request(server)
          .delete(`/v1/me/cart/${productToDeleteInCart.id}`)
          .query(badAccessToken)
          .end((err, res) => {
            // assert
            res.should.have.status(401);
            done();
          })
      })
    })
  })

  describe("And a valid access token is provided", () => {
    describe("But an invalid product identifier is provided", () => {
      describe("the response", () => {
        it("should be a 404 error", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          const idForProductNotInCart = {id: "4"};
          // act
          chai
            .request(server)
            .delete(`/v1/me/cart/${idForProductNotInCart.id}`)
            .query({accessToken: validToken.accessToken})
            .end((err, res) => {
              // assert
              res.should.have.status(404);
              done();
            })
        })
      })
    })

    describe("And a valid cartItem identifier is provided", () => {
      describe("the response", () => {
        it("should return the updated shopping cart without the deleted item", done => {
          // arrange
          const validToken = {
            username: "greenlion235",
            accessToken: uid(16)
          }
          Token.addToken(validToken);
          const initialCart = [{
            "id": "2",
            "categoryId": "1",
            "name": "Black Sunglasses",
            "description": "The best glasses in the world",
            "price": 100,
            "quantityAvailable": 5,
            "quantity": 1,
            "imageUrls": [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
            ]
          },
          {
            "id": "3",
            "categoryId": "1",
            "name": "Brown Sunglasses",
            "description": "The best glasses in the world",
            "price": 50,
            "quantityAvailable": 10,
            "quantity": 1,
            "imageUrls": [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
            ]
          }]
          User.getUser(validToken.username).cart = initialCart;
          const idForProductToDelete = {id: "3"};
          const expectedShoppingCart = [{
            "id": "2",
            "categoryId": "1",
            "name": "Black Sunglasses",
            "description": "The best glasses in the world",
            "price": 100,
            "quantityAvailable": 5,
            "quantity": 1,
            "imageUrls": [
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
              "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
            ]
          }];
          // act
          chai
            .request(server)
            .delete(`/v1/me/cart/${idForProductToDelete.id}`)
            .query({accessToken: validToken.accessToken})
            .end((err, res) => {
              // assert
              res.should.have.status(200);
              res.body.should.be.an("array");
              res.body.should.deep.equal(expectedShoppingCart);
              done();
            })
        })
      })
    })
  })
})