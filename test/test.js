let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app/server')
let expect = chai.expect;
let assert = chai.assert;

let should = chai.should()


chai.use(chaiHttp)


//Brands test
describe("/GET brands", () =>{
    it("should go get all of the brands", done =>{
        chai
        .request(server)
        .get("/api/brands")
        .end((error, response)=>{
            assert.isNotNull(response.body);
            expect(error).to.be.null;
            expect(response).to.have.status(200);
            expect("Content-Type", "application/json");
            done();
        });
    });
});

// Products test
describe("/GET products", () => {
    it("should filter to the products that have a query string", done => {
        chai
          .request(server)
          .get("/api/products?query=Better glasses")
          .end((error, response) => {
            assert.isNotNull(response.body);
            expect(error).to.be.null;
            expect(response).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(response.body).to.be.an("array");
            done();
          });
      });
      it("if query is blank return error", done => {
        chai
          .request(server)
          .get("/api/products?query=")
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(402);
            expect("Content-Type", "application/json");
            done();
          });
      });
    });

  //login test
  describe("/POST,login", () => {
    it("should return status 200 and a token, if it is an authenticated user", done => {
      let userLoginData = { username: "fakeUser123", password: "fakePassword123" }
      chai
        .request(server)
        .post('/api/login')
        .send(userLoginData)
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("string");
          done();
      });
    })
    it("should return status 405 for incorrect format", done => {
        userLoginData = { username: "", password: "waters" }
        chai
          .request(server)
          .post('/api/login')
          .send(userLoginData)
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(405);
            done();
        });
      })
      it("should return status 406 for invalid username or password", done => {
        userLoginData = { username: "blablabla", password: "qqq" }
        chai
          .request(server)
          .post('/api/login')
          .send(userLoginData)
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(406);
            done();
        });
      })
    });

    //get cart test
    
    describe('/GET user cart', () => {
      it('should return all products in user cart', done => {
        chai
          .request(server)
          .get('/api/me/cart?accessToken=abc1234')
          .end((error, response) => {
            assert.isNull(error);
            expect(response).to.have.status(200);
            expect('Content-Type', 'application/json');
            expect(response.body).to.be.an('array');
            // Had to modify user.json with "test user" has a item in cart so DELETE and EDIT could be tested
            // thats why lengthOf(1) is expected instead of 0
            expect(response.body).to.be.lengthOf(1);
            done();
          });
      });
      it('should return error 400 not authorized', done => {
        chai
          .request(server)
          .get('/api/me/cart?accessToken=BLA')
          .end((error, response) => {
            assert.isNull(error);
            expect(response).to.have.status(400);
            done();
          });
      });
    });

    // POST /api/me/cart
    describe('/POST add product to cart', () => {
        it('should add product to user ', done => {
          chai
            .request(server)
            .post('/api/me/cart/3?accessToken=abc1234')
            .end((error, response) => {
              assert.isNull(error);
              expect(response).to.have.status(200);
              expect('Content-Type', 'application/json');
              expect(response.body).to.be.an('array');
              // Had to modify user.json with "test user" has a item in cart so DELETE and EDIT could be tested
              // thats why lengthOf(2) is expected instead of 1
              expect(response.body).to.be.lengthOf(2);
            });
            done();
          });
          it('should increase quantity if product already in cart ', done => {
            chai
              .request(server)
              .post('/api/me/cart/3?accessToken=abc1234')
              .end((error, response) => {
                assert.isNull(error);
                expect(response).to.have.status(201);
                expect('Content-Type', 'application/json');
                expect(response.body).to.be.an('array');
                // Had to modify user.json with "test user" has a item in cart so DELETE and EDIT could be tested
                // thats why lengthOf(2) is expected instead of 1
                expect(response.body).to.be.lengthOf(2);
              });
              done();
            });
        
      it('should return 405 Product not found, no matching Id', done => {
        chai
          .request(server)
          .post('/api/me/cart/93?accessToken=abc1234')
          .end((error, response) => {
            assert.isNull(error);
            expect(response).to.have.status(405);
            expect('Content-Type', 'application/json');
            done();
          });
      });
      it('should return 400 with invalid token', done => {
        chai
          .request(server)
          .post('/api/me/cart/1?accessToken=BLA')
          .end((error, response) => {
            assert.isNull(error);
            expect(response).to.have.status(400);
            done();
          });
      });
    }); 

    // DELETE
    describe('/DELETE product', () => {
        it('should delete product from the cart', done => {
          chai
            .request(server)
            .delete('/api/me/cart/3?accessToken=abc1234')
            .end((error, response) => {
              assert.isNull(error);
              expect(response).to.have.status(200);
              expect('Content-Type', 'application/json');
              expect(response.body).to.be.an('array');
              // Had to modify user.json with "test user" has a item in cart so DELETE and EDIT could be tested
              // thats why lengthOf(1) is expected instead of 0
              expect(response.body).to.be.lengthOf(1);
              done();
            });
        });
        it('should return 410 ID doesnt match products in the shopping cart', done => {
          chai
            .request(server)
            .delete('/api/me/cart/3?accessToken=abc1234')
            .end((error, response) => {
              assert.isNull(error);
              expect(response).to.have.status(410);
              expect('Content-Type', 'application/json');
              done();
            });
        });
        it('should return 400 Access not authorized - need to be logged-in', done => {
          chai
            .request(server)
            .delete('/api/me/cart/3?accessToken=BLA')
            .end((error, response) => {
              assert.isNull(error);
              expect(response).to.have.status(400);
              done();
            });
        });
      });

    //  POST  /api/me/cart
    describe('/POST add product to user cart', () => {
        it('should add specified product to user cart', done => {
          chai
            .request(server)
            .post('/api/me/cart/?accessToken=abc1234&quantity=77&id=B3')
            .end((error, response) => {
              assert.isNull(error);
              expect(response).to.have.status(200);
              expect('Content-Type', 'application/json');
              expect(response.body).to.be.an('array');
              expect(response.body).to.be.lengthOf(1);
              expect(response.body).to.deep.include({
                "quantity": "77",
                "product": {
                    "id": "B3",
                    "categoryId": "test",
                    "name": "testSunglasses",
                    "description": "The best glasses in the world",
                    "price": 50,
                    "imageUrls": [
                        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
                        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
                        "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
                    ]
                }
            });
              done();
            });
        });
        it('should return 410 ID doesnt match products in the shopping cart', done => {
            chai
              .request(server)
              .post('/api/me/cart/?accessToken=abc1234&quantity=77&id=97')
              .end((error, response) => {
                assert.isNull(error);
                expect(response).to.have.status(410);
                expect('Content-Type', 'application/json');
                done();
              });
          });
        it('should return 411 missing ID or quantity in request', done => {
          chai
            .request(server)
            .post('/api/me/cart/?accessToken=abc1234&quantity=77')
            .end((error, response) => {
              assert.isNull(error);
              expect(response).to.have.status(411);
              expect('Content-Type', 'application/json');
              done();
            });
        });
        it('should return 400 Access not authorized - need to be logged-in', done => {
          chai
            .request(server)
            .post('/api/me/cart/5')
            .end((error, response) => {
              assert.isNull(error);
              expect(response).to.have.status(400);
              done();
            });
        });
      });
