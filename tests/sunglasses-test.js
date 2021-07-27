let chai = require("chai");
const { expect } = require("chai");
let chaiHttp = require("chai-http");
const { request } = require("http");
let server = require("../app/server");
let should = chai.should();

chai.use(chaiHttp);

// what do we want website to do?
// creating a test that will exercise an endpoint, then let it fail, then implement the endpoint to make the test pass.

// start up test with
// mocha sunglasses-test.js --watch

// https://www.chaijs.com/api/bdd/
// https://devhints.io/chai

// endpoints are:

// GET /api/brands
describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      // arrange, act
      chai
        .request(server)
        .get("/api/brands")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });      
});

// GET /api/products
describe("Products", () => {
  describe("/GET products", () => {
    it("it should GET all the products", (done) => {
      // arrange, act
      chai
        .request(server)
        .get("/api/products")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });
});

// GET /api/brands/:id/products
// products category id === brands id
describe("/GET brands/:id/products", () =>
  it("it should get products for a brand id", (done) => {
    // arrange
    testBrand = 0;
    testProducts = [
      {
        id: "1",
        categoryId: "1",
        name: "Superglasses",
        description: "The best glasses in the world",
        price: 150,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      },
      {
        id: "2",
        categoryId: "1",
        name: "Black Sunglasses",
        description: "The best glasses in the world",
        price: 100,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      },
      {
        id: "3",
        categoryId: "1",
        name: "Brown Sunglasses",
        description: "The best glasses in the world",
        price: 50,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      }
    ];
    // act
    chai
      .request(server)
      // don't like this, should test :id, may need a model to do this properly
      .get("/api/brands/" + testBrand + "/products")
      // assert
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        // when :id is 0, should deep equal testProducts
        expect(res.body).to.be.deep.equal(testProducts);
        done();
      });
  })
);

// POST /api/login - use deep here -
// DON'T GET THIS AT ALL  login request should incllude username and password
describe("/login", () => {
  it("it should allow user to log in", (done) => {
    chai
      .request(server)
      .post("/api/login")
      .send({ username: "yellowleopard753", password: "jonjon" })
      .end((err, res) => {
        //console.log(res);
        res.should.have.status(200);
        done();
      });
  })
})

// GET /api/me/cart
describe("Cart", () => {
  describe("/GET me/cart", () => {
    it("should allow a user to view their cart", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          console.log(res);
          //res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
})



// POST /api/me/cart - use deep here
// DELETE /api/me/cart/:productId
// POST /api/me/cart/:productId - change quantity in cart
