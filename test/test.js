const chai = require('chai')
const chaiHTTP = require('chai-http')
let server = require('../app/server')
const fs = require('fs')
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();
chai.use(chaiHTTP);

//TDD!

//Starting information to be used in testing

// let users = fs.readFileSync("./initial-data/users.json", "utf-8", (error, data) => {
//   if (error) throw error;
//   return JSON.parse(data);
// });

// let sunglasses = fs.readFileSync('./initial-data/products.json', 'utf-8', (error, data) => {
//   if (error) throw error;
//   return JSON.parse(data)
// });

// let categories = fs.readFileSync('./initial-data/brands.json', 'utf-8', (error, data) => {
//   if (error) throw error;
//   return JSON.parse(data)
// })

let singleGlasses = {
  "id": "9",
  "categoryId": "4",
  "name": "Sugar",
  "description": "The sweetest glasses in the world",
  "price": 125,
  "imageUrls": ["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg", "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
}

//state holding variables, for the beforeEach calls
let sunglassesResponse;
let categoriesResponse;
let userResponse;

//Sunglasses endpoints
describe('sunglasses', () => {
  describe('/get sunglasses', () => {
    beforeEach(() => {
      return new Promise((resolve) => {
        chai.request(server)
          .get('/v1/sunglasses')
          .end((err, res) => {
            sunglassesResponse = res;
            resolve();
          })
      });
    })
    it('should retrieve a list of sunglasses from the store', (done) => {
      sunglassesResponse.should.have.status(200)
      sunglassesResponse.body.should.be.an('array')
      expect(sunglassesResponse.body).to.include.deep.members([singleGlasses])
      done()
    })
  })
  describe('get sunglasses by ID', () => {
    beforeEach(() => {
      return new Promise((resolve) => {
        chai.request(server)
          .get('/v1/sunglasses/8')
          .end((err, res) => {
            sunglassesResponse = res;
            resolve();
          })
      });
    })
    it('should retrieve one sunglasses object if an ID is supplied', done => {
      sunglassesResponse.should.have.status(200)
      sunglassesResponse.body.should.be.an('object')
      sunglassesResponse.body.should.not.be.an('array')
      sunglassesResponse.body.should.have.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
      done()
    })
    it('should not retrieve a product if there is a mismatched id', done => {
      chai.request(server)
        .get(`/v1/sunglasses/notAProduct`)
        .end((err, res) => {
          res.should.have.status(404)
          done()
        })
    })
  })
})
//categories endpoints
describe('categories', () => {
  describe('/get categories', () => {
    beforeEach(() => {
      return new Promise(resolve => {
        chai
          .request(server)
          .get("/v1/categories")
          .end((err, res) => {
            categoriesResponse = res;
            resolve();
          });
      });
    });
    it('should return an array of brands and their info', done => {
      categoriesResponse.should.have.status(200)
      categoriesResponse.body.should.be.an('array')
      expect(categoriesResponse.body).to.include.deep.members([{
        "id": "3",
        "name": "Levi's"
      }])
      done()
    })
  })
  describe('/get categories by ID', () => {
    beforeEach(() => {
      return new Promise(resolve => {
        chai
          .request(server)
          .get("/v1/categories/4")
          .end((err, res) => {
            categoriesResponse = res;
            resolve();
          });
      });
    });
    it('should return a single category object', done => {
      categoriesResponse.should.be.an('object')
      categoriesResponse.body.should.have.all.keys('id', 'name')
      done()
    })
    it('should not return anything if the category ID is wrong', done => {
      chai.request(server)
        .get(`/v1/categories/notACategory`)
        .end((err, res) => {
          res.should.have.status(404)
          done()
        })
    })
  })
  describe('/get/categories/:id/products', () => {
    beforeEach(() => {
      return new Promise(resolve => {
        chai
          .request(server)
          .get("/v1/categories/4/products")
          .end((err, res) => {
            categoriesResponse = res;
            resolve();
          });
      });
    });
    it('should return all products matching a category', done => {
      let result = categoriesResponse.body[0]
      categoriesResponse.should.have.status(200)
      categoriesResponse.body.should.be.an('array')
      result.should.be.an('object')
      result.should.have.all.keys('id', 'categoryId', 'name', 'description', 'price', 'imageUrls')
      expect(categoriesResponse.body).to.include.deep.members([
        singleGlasses
      ]);
      done()
    })
    it('should not return a result for an incorrect category', done => {
      chai
        .request(server)
        .get("/v1/categories/notACategory/products")
        .end((err, res) => {
          res.should.have.status(404)
          done();
        })
    })
  })
})
//user login endpoints 
describe('user information', () => {
  describe("/me/login", () => {
    beforeEach(() => {
      return new Promise(resolve => {
        chai
          .request(server)
          .post("/v1/me/login")
          .send({ 'username':'yellowleopard753', 'password':'jonjon'})
          .end((err, res) => {
            userResponse = res;
            resolve();
          });
      });
    });
    it("should allow a user to log into their account", done => {
      userResponse.should.have.status(200);
      done()
    });
    it('should return an access Token for later use', done => {
      userResponse.body.should.be.an('object')
      userResponse.body.should.have.all.keys('token','issued','user')
      done()
    })
    it('should return a refreshed token', done => {
      chai.request(server)
      .post('/v1/me/login')
      .send({ 'username': 'yellowleopard753', 'password': 'jonjon' })
      .end((err, res) => {
        res.body.should.be.an('object')
        res.body.should.have.all.keys('token','user','issued')
        expect(res.body.token).to.equal(userResponse.body.token)
        expect(res.body.user).to.equal(userResponse.body.user);
        expect(res.body.issued).to.not.equal(userResponse.body.issued)
        done()
      })
      
    })
    it("should not allow a user to sign in without credentials", done => {
      chai
        .request(server)
        .post("/v1/me/login")
        .send({ username: "", password: "" })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("should not allow a user to sign in with incorrect credentials", done => {
      chai
        .request(server)
        .post("/v1/me/login")
        .send({ username: "yellowleopard753", password: "wrong" })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("should not return a token with incorrect credentials", done => {
      chai
        .request(server)
        .post("/v1/me/login")
        .send({ username: "yellowleopard753", password: "wrong" })
        .end((err, res) => {
          expect(res.body).to.deep.equal({}) //to ensure no data is returned
          res.should.have.status(401);
          done();
        });
    });
  });
})

let accessToken = ''
// cart information
describe('cart endpoints', () => {
  describe('get me/cart', () => {
    before(() => {
      //retrieve an access token to be used in testing
      return new Promise(resolve => {
        chai
          .request(server)
          .post("/v1/me/login")
          .send({ 'username': 'yellowleopard753', 'password': 'jonjon' })
          .end((err, res) => {
            accessToken = res.body.token
            resolve();
          });
      });
    });
    it('should return a cart for a correct token ', done => {
      chai.request(server)
        .get(`/v1/me/cart?query=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          done()
        })
    })
    it('should not return a cart for incorrect token', done => {
      chai.request(server)
        .get(`/v1/me/cart?query=WRONG`)
        .end((err, res) => {
          res.should.have.status(403)
          done()
        })
    })
    it("should not return a cart for a missing token", done => {
      chai.request(server)
        .get(`/v1/me/cart?query=`)
        .end((err, res) => {
          res.should.have.status(403);
          expect(res.body).to.deep.equal({})
          done();
        });
    });
  })
  describe('POST /me/cart', () => {
    before(() => {
    //retrieve an access token to be used for testing 
      return new Promise(resolve => {
        chai
          .request(server)
          .post("/v1/me/login")
          .send({ 'username': 'yellowleopard753', 'password': 'jonjon' })
          .end((err, res) => {
            accessToken = res.body.token
            resolve();
          });
      });
    })
    it('should allow a user to add to their cart', done => {
      chai.request(server)
        .post(`/v1/me/cart?query=${accessToken}`)
      //same as 'singleGlasses' the api will need just an ID, not the whole object
      .send({'productId':['9']})
      .end((err,res) => {
        res.should.have.status(200)
        res.body.should.be.an('array')
        expect(res.body).to.include.deep.members([
          {
            "id":"9",
        "quantity":"1"
          }
        ]);
        done()
      })
    })
    it('should allow a user to add multiple items to their cart', done => {
      chai.request(server)
        .post(`/v1/me/cart?query=${accessToken}`)
        .send({'productId':['9','10']})
        .end((err,res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          expect(res.body).to.include.deep.members([{
            "id": "9",
            "quantity":"1"
          },
            {
              "id": "10",
              "quantity":"1"
            }])
          done()
        })
    })
    it('should not allow a user to add with an incorrect token', done => {
      chai.request(server)
        .post(`/v1/me/cart?query=incorrectToken123456`)
        .send({ 'productId': ['9', '10'] })
        .end((err,res) => {
          res.should.have.status(403)
          expect(res.body).to.deep.equal({})
          done()
        })
    })
    it('should not add a product that does not exist', done => {
      chai.request(server)
        .post(`/v1/me/cart?query=${accessToken}`)
        .send({ 'productId': ['900', '100'] })
        .end((err,res) => {
          res.should.have.status(200)
          res.body.should.be.an('object');
          res.body.should.have.all.keys('cart','notAdded')
          expect(res.body.notAdded).to.be.an('array')
          done()
        })
    })
    it('should correctly add a mixture of correct and incorrect items', done => {
      chai.request(server)
      .post(`/v1/me/cart?query=${accessToken}`)
      .send({'productId':['1','2','456','500',]})
      .end((err,res) => {
        //unsure about the correct status code for 'partially correct'
        res.should.have.status(200)
        expect(res.body.cart).to.be.an('array')
        expect(res.body.cart).to.include.deep.members([{
          "id": "1",
          "quantity":"1"
        }])
        expect(res.body.notAdded).to.be.an('array')
        expect(res.body.notAdded).to.include.deep.members(['456','500'])
        done()
      })
    })
  })
  describe('DELETE me/cart', () => {
    //will use the same access token as the POST tests
    it(`should remove all products of that type from the cart`, done => {
      
      //Not ideal but I am using the previous post requests to use for my delete request
      //multiple chai.request(server)s cause a socket timeout, and the priority is to get it working and then
      //clean up my testing  
      chai.request(server)
      .del(`/v1/me/cart/9?query=${accessToken}`)
      .end((err,res) => {
        res.should.have.status(200)
        res.body.should.be.an('array');
        expect(res.body).to.not.include.deep.members([singleGlasses])
        done()
      })
    })
    it('should not remove an item that is not present in the cart' , done => {
      chai.request(server)
      //until this point item 5 has not been added. again, not ideal
        .del(`/v1/me/cart/5?query=${accessToken}`)
        .end((err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array');
          done()
        })
    })
    it('should not remove anything without a valid token', done => {
      chai.request(server)
        .del(`/v1/me/cart/1?query=WRONGTOKEN`)
        .end((err,res) => {
          res.should.have.status(403)
          expect(res.body).to.deep.equal({})
          done()
        })
    })
  })
  describe('PUT/me/cart', () => {
    
    before(() => {
      //retrieve an access token to be used for testing 
      return new Promise(resolve => {
        chai
          .request(server)
          .post(`/v1/me/cart?query=${accessToken}`)
          .send({ 'productId': ['1', '2'] })
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.an('array')
            resolve()
          })
      });
    })
    it('should update the quantity of a specific item', done => {
      chai.request(server)
        .post(`/v1/me/cart/1?query=${accessToken}`)
        .send({"productId":"1","quantity":"57"})
        .end((err,res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          expect(res.body).to.include.deep.members([{"id":"1","quantity":"57"}])
          done()
        })
    })
    it('should not update an item that does not exist', done => {
      chai.request(server)
        .post(`/v1/me/cart/1?query=${accessToken}`)
        .send({ "productId": "DOESNTEXIST", "quantity": "57" })
        .end((err,res) => {
          res.should.have.status(404)
          done()
        })
    })
    it('should not update a product not in the cart', done => {
      chai.request(server)
        .post(`/v1/me/cart/WRONG?query=${accessToken}`)
        .send({ "productId": "1", "quantity": "57" })
        .end((err,res) => {
          res.should.have.status(404)
          done()
        })
    })
  })
})