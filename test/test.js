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
let userResponse

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
//users endpoints (for the cart functionality)
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
    it("should not allow a user to sign in without credentials", done => {
      chai
        .request(server)
        .post("/v1/me/login")
        .send({ username: "", password: "" })
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("should not allow a user to sign in with incorrect credentials", done => {
      chai
        .request(server)
        .post("/v1/me/login")
        .send({ username: "yellowleopard753", password: "wrong" })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });
  });
})
//cart information
// describe('cart endpoints', () => {
//   describe('me/cart', () => {
//     it('should get the current cart for the signed in user', done => {

//     })

//   })
// })