const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const fs = require('fs');
const querystring = require("querystring");
const should = chai.should();
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHttp);

let testBrands, testProducts, testUsers, accessToken, itemToUpdateQty;

describe('sunglasses.io tests for', () => {
  //ensure fresh data for each test
  beforeEach(function(done) {
    testBrands = JSON.parse(fs.readFileSync("./initial-data/brands.json", "utf8"));
    testUsers = JSON.parse(fs.readFileSync("./initial-data/users.json", "utf8"));
    testProducts = JSON.parse(fs.readFileSync("./initial-data/products.json", "utf8"));
    done();
  });


  describe('GET /api/brands', () => {
    it('should GET all the brands', (done) => {
      chai.request(server)
    .get('/api/brands')
    .end((err, res) => {
      expect("Content-Type", "application/json");
      res.should.have.status(200);
      res.body.should.be.an('array');
      res.body.length.should.be.eql(testBrands.length);
      done();
      })
    })
  })

  describe('GET /api/brands/:id/products', () => {
    it('should GET all the products of a given brand', (done) => {  
        const productsByBrand = testProducts.filter(product => product.brandId == 1);
        chai.request(server)
       .get('/api/brands/1/products')
       .end((err, res) => {
        res.should.have.status(200)
        expect("Content-Type", "application/json");
        res.body.should.be.an('array')
        res.body.length.should.be.eql(productsByBrand.length);
       done();
     })
    })

    it('shouldn\'t return any products if the brand id is invalid', (done) => {
        chai.request(server)
       .get('/api/brands/dsf/products')
       .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.empty;
       done();
     })
    })
  })

  describe('GET /api/products', () => {
    it('should GET all the products', (done) => {  
        chai.request(server)
        .get('/api/products')
        .end((err, res) => {
         res.should.have.status(200)
         expect("Content-Type", "application/json");
         res.body.should.be.an('array')
         res.body.length.should.be.eql(testProducts.length);
        done();
      })
    })

    it('should limit results to those with a query string', (done) => {
      chai.request(server)
      .get('/api/products?search=Black')
      .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          res.body.length.should.be.eql(1)
          done();
      })
    })

    it('returns all products if query is empty', done => {
      chai.request(server)
      .get('/api/products?search=')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('array')
        res.body.length.should.be.eql(testProducts.length)
        done();
      })
    })

    it('allows search to be made in different letter casing', done => {
      chai.request(server)
      .get('/api/products?search=BLAck')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.an('array')
        res.body.length.should.be.eql(1)
        done();
      })
    })
  })

  describe('POST /api/login', () => {
    it('should POST a login given an accurate username and password', done => {
      testUsername = testUsers[0].login.username;
      testPassword = testUsers[0].login.password;
      chai.request(server)
      .post('/api/login')
      .send({username: testUsername, password: testPassword})
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.username.should.be.a('string');
        res.body.token.should.be.a('string');
        res.body.lastUpdated.should.be.a('string')
        res.body.token.length.should.be.eql(16);
        done();
      })
    })

    it('should require both username and password before attempting to log in', done => {
      chai.request(server)
      .post('/api/login')
      .send({username: testUsername})
      .end((err,res) => {
          res.should.have.status(400);
          res.body.should.be.empty;
          done();
      })
    })

    it('should not allow login with an inaccurate password', done => {
      testUsername = testUsers[0].login.username;
      chai.request(server)
      .post('/api/login')
      .send({username: testUsername, password: "Iwillfail"})
      .end((err,res) => {
        res.should.have.status(401);
        res.body.should.be.empty;
        done();
      })
    })

    it('should not allow login with an inaccurate username', done => {
      testPassword = testUsers[0].login.password;
      chai.request(server)
      .post('/api/login')
      .send({username: "Notauser", password: testPassword})
      .end((err,res) => {
        res.should.have.status(401);
        res.body.should.be.empty;
        done();
      })
    })

    it('works if user has already gotten an access token previously', done => {
      testUsername = testUsers[0].login.username;
      testPassword = testUsers[0].login.password;
      chai.request(server)
      .post('/api/login')
      .send({username: testUsername, password: testPassword})
      .end();
      chai.request(server)
      .post('/api/login')
      .send({username: testUsername, password: testPassword})
      .end((err,res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.username.should.be.a('string');
        res.body.token.should.be.a('string');
        res.body.lastUpdated.should.be.a('string')
        res.body.token.length.should.be.eql(16);
        done();
      })
    })
  })

  describe('route requiring an authenticated user', () => {
    //set up a user with an access token
    beforeEach(function(done) {
      testUsername = testUsers[0].login.username;
      testPassword = testUsers[0].login.password;
      chai.request(server)
      .post('/api/login')
      .send({username: testUsername, password: testPassword})
      .end((err,res) => {
        accessToken = res.body.token;
        done();
      })
    })

    describe('GET /api/me/cart', () => {
      it('should fail to get if the request does not send a token in the headers' , (done) => {  
        chai.request(server)
        .get('/api/me/cart')
        .end((err,res) => {
          res.should.have.status(401);
          res.body.should.be.empty;
          done();
        })
      })
    
      it('should fail to get if the request sends an inaccurate access token' , (done) => {  
        chai.request(server)
        .get('/api/me/cart')
        .set("x-authentication", 'Iamafailingtoken')
        .end((err,res) => {
          res.should.have.status(401);
          res.body.should.be.empty;
          done();
        })
      })
  
      it('should return an empty cart if no products have been added', done => {
        chai.request(server)
        .get('/api/me/cart')
        .set('x-authentication', accessToken)
        .end((err,res) => {
          res.should.have.status(200);
          res.body.should.be.an('array')
          res.body.length.should.be.eql(0)
          done();
        })
      })
      
      //add a product and then make sure it's there in the callback
      it('should GET all the products in the logged in user\'s cart' , done => {
        chai.request(server)
        .post('/api/me/cart')
        .set('x-authentication', accessToken)
        .send({productId: 5})
        .then( () => { 
          chai.request(server)
          .get('/api/me/cart')
          .set('x-authentication', accessToken)
          .end((err,res) => {
            res.should.have.status(200);
            res.body.should.be.an('array')
            res.body.length.should.eql(1);
            done();
          })
        })
      })   
    })

    describe('POST /api/me/cart', () => {
      it('should fail to post if the request does not send a token in the headers' , (done) => {  
        chai.request(server)
        .post('/api/me/cart')
        .send({productId: 5})
        .end((err,res) => {
          res.should.have.status(401);
          res.body.should.be.empty;
          done();
        })
      })

      it('should fail to post if the request sends an inaccurate access token' , (done) => {  
        chai.request(server)
        .post('/api/me/cart')
        .send({productId: 5})
        .set("x-authentication", 'Iamafailingtoken')
        .end((err,res) => {
          res.should.have.status(401);
          res.body.should.be.empty;
          done();
        })
      })

      it('should POST a selected product to the cart with quantity 1', done => {  
        chai.request(server)
        .post('/api/me/cart')
        .send({productId: 5})
        .set("x-authentication", accessToken)
        .end((err,res) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.cartId.should.not.be.null;
          res.body.quantity.should.be.eql(1);
          done();
        })
      })

      //ensure that 2 identical products can be sent and that they both have quantity 1 and unique IDs
      it('should allow multiples of the same product, each with their own quantity' , (done) => {  
        let firstCartId;
        chai.request(server)
        .post('/api/me/cart')
        .send({productId: 5})
        .set("X-Authentication",accessToken)
        .end((err,res) => {
            firstCartId = res.body.cartId;
        })
        chai.request(server)
        .post('/api/me/cart')
        .send({productId: 5})
        .set("X-Authentication",accessToken)
        .end((err,res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.cartId.should.not.eql(firstCartId)
            res.body.quantity.should.be.eql(1);
            done();
        })
      })

      it('should fail if the product ID cannot be found' , (done) => {  
        chai.request(server)
        .post('/api/me/cart')
        .send({productId: "Notaproductid"})
        .set("X-Authentication",accessToken)
        .end((err,res) => {
            res.should.have.status(404);
            res.body.should.be.empty;
            done();
        })
      })

      it('should fail if no productID is sent' , (done) => {  
        chai.request(server)
        .post('/api/me/cart')
        .set("X-Authentication",accessToken)
        .end((err,res) => {
            res.should.have.status(400);
            res.body.should.be.empty;
            done();
        })
      })
    
    })

    describe('DELETE /api/me/cart/:cartId', () => {

      it('should fail to delete if the request does not send a token in the headers' , (done) => {  
        chai.request(server)
        .delete('/api/me/cart/1')
        .end((err,res) => {
          res.should.have.status(401);
          res.body.should.be.empty;
          done();
        })
      })

      it('should fail to delete if the request sends an inaccurate access token' , (done) => {  
        chai.request(server)
        .delete('/api/me/cart/1')
        .set("x-authentication", 'Iamafailingtoken')
        .end((err,res) => {
          res.should.have.status(401);
          res.body.should.be.empty;
          done();
        })
      })

      it('should DELETE a selected product from the logged in user\'s cart' , done => {  
        chai.request(server)
        .post('/api/me/cart')
        .send({productId : 1})
        .set('x-authentication', accessToken)
        .then( postRes => {
          let idToDelete = postRes.body.cartId;
          chai.request(server)
          .delete(`/api/me/cart/${idToDelete}`)
          .set('x-authentication', accessToken)
          .end((err,res) => {
            res.should.have.status(200);
            res.body.cartId.should.eql(idToDelete);
            done();
          })
        })
      })   

      it('should leave all other items in the cart untouched' , done => {  
        //first get the previous cart length
        chai.request(server)
        .get('/api/me/cart')
        .set('x-authentication', accessToken)
        .then( getPostRes => {
          let previousLength = getPostRes.body.length;
          //then add a new item
          chai.request(server)
          .post('/api/me/cart')
          .send({productId : 1})
          .set('x-authentication', accessToken)
          //then delete that item
          .then( postRes => {
            let idToDelete = postRes.body.cartId;
            chai.request(server)
            .delete(`/api/me/cart/${idToDelete}`)
            .set('x-authentication', accessToken)
            //then confirm that the length is the same as it was before adding & deleting
            .then( () => {
              chai.request(server)
              .get('/api/me/cart')
              .set('x-authentication', accessToken)
              .end((err,res) => {
                res.should.have.status(200);
                res.body.length.should.eql(previousLength);
                done();
              })
            })
          })
        })
      })

      it('should return an error when an incorrect id is given', done => {
        chai.request(server)
        .delete(`/api/me/cart/FakeId`)
        .set('x-authentication', accessToken)
        .end((err,res) => {
          res.should.have.status(404);
          res.body.should.be.empty;
          done();
        })
      })
    })

    describe('POST /api/me/cart/:cartId', () => {
      it('should fail to update if the request does not send a token in the headers' , (done) => {  
        chai.request(server)
        .post('/api/me/cart/1')
        .send({quantity : 5})
        .end((err,res) => {
          res.should.have.status(401);
          res.body.should.be.empty;
          done();
        })
      })

      it('should fail to update if the request sends an inaccurate access token' , (done) => {  
        chai.request(server)
        .post('/api/me/cart/1')
        .send({quantity : 5})
        .set("x-authentication", 'Iamafailingtoken')
        .end((err,res) => {
          res.should.have.status(401);
          res.body.should.be.empty;
          done();
        })
      })

      //put an item in the cart and grab it's id so we know we're posting to a brand new one each time
      beforeEach(function(done) {
        chai.request(server)
        .post('/api/me/cart')
        .send({productId : 1})
        .set('x-authentication', accessToken)
        .end((err,res) => {
          cartIdToUpdate = res.body.cartId;
          done();
        })
      })

      it('should POST a selected product\'s quantity to increase it in the logged in user\'s cart' , (done) => {  
        chai.request(server)
        .post(`/api/me/cart/${cartIdToUpdate}`)
        .send({quantityIncrease : 5})
        .set("x-authentication", accessToken)
        .end((err,res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.cartId.should.eql(cartIdToUpdate);
          res.body.quantity.should.eql(6);
          done();
        })
      })

      it('should only update the quantity of the provided item and leave other items untouched', (done) => {  
        //put a new item in the cart
        chai.request(server)
        .post('/api/me/cart')
        .send({productId : 2})
        .set('x-authentication', accessToken)
        .then(newItemRes => {
          let newItemCartId = newItemRes.body.cartId;
          chai.request(server)
          //update another item's quantity to 6
          .post(`/api/me/cart/${cartIdToUpdate}`)
          .send({quantityIncrease : 5})
          .set("x-authentication", accessToken)
          .then( () => {
            chai.request(server)
            //then get the cart again
            .get('/api/me/cart')
            .set('x-authentication', accessToken)
            .end((err,res) => {
              res.should.have.status(200);
              let productToTest = res.body.find(product => product.cartId == newItemCartId);
              //verify that the new item's quantity is still 1
              productToTest.quantity.should.eql(1);
              done();
          })
        })
      })
    })

      it('should fail if an invalid cart id is provided' , (done) => {  
        chai.request(server)
        .post(`/api/me/cart/FakeId`)
        .send({quantityIncrease : 5})
        .set("x-authentication", accessToken)
        .end((err,res) => {
          res.should.have.status(404);
          res.body.should.be.empty;
          done()
        })
      })

      it('should fail if a body is not provided' , (done) => {  
        chai.request(server)
        .post(`/api/me/cart/${cartIdToUpdate}`)
        .set("x-authentication", accessToken)
        .end((err,res) => {
          res.should.have.status(400);
          res.body.should.be.empty;
          done();
        })
      })

      it('should fail if a non-number quantity increase is provided' , (done) => {  
        chai.request(server)
        .post(`/api/me/cart/${cartIdToUpdate}`)
        .send({quantityIncrease : "NotANumber"})
        .set("x-authentication", accessToken)
        .end((err,res) => {
          res.should.have.status(400);
          res.body.should.be.empty;
          done();
        })
      })
    })
  })
})