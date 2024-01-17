// import chai from 'chai';
// import chaiHttp from "chai-http";
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

let should = chai.should();

chai.use(chaiHttp);

// beforeEach(() => {
  
// });

describe("Sunglasses", () => {
  describe("/GET /api/brands", () => {
    it("it should get all brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          done();
        })
    })
  })
  describe("/GET /api/brands/:id/products", () => {
    it("it should get products with the brand id", (done) => {
      // arrange: brand id that exists 
      let id = 1;
      // act: server request
      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done(err);
        })
    })
    it("it should not return products for non existent brand or :id", (done) => {
      // arrange: brand id that does not exist
      let id = 10;
      // act: server request
      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(500);
          done(err);
        })
    })
  })
  describe("/GET /api/products", () => {
    it("it should get all the products", (done) => {
      // act: server request
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          done();
        });
    })
  })
  describe("/POST /api/login", () => {
    it("it should not POST the login if the username input is blank", (done) => {
      // arrange: username blank
      let loginInfo = {password: "jonjon"}
      // act: server request
      chai
        .request(server)
        .post("/api/login")
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("it should not POST the login if the password input is blank", (done) => {
      // arrange: password blank
      let loginInfo = {
        username: "yellowleopard753",
        password: undefined
      }
      // act: server request
      chai
        .request(server)
        .post("/api/login")
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("it should not POST the login if the username input is not valid", (done) => {
      // arrange: invalid username
      let loginInfo = {
        username: "nonexistentUsername",
        password: "jonjon"
      }
      // act: server request
      chai
        .request(server)
        .post("/api/login")
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(401);
          done(err);
        })
    });
    it("it should not POST the login if the password input is not valid", (done) => {
      // arrange: invalid password
      let loginInfo = {
        username: "yellowleopard753",
        password: "wrongPassword"
      }
      // act: server request
      chai
        .request(server)
        .post("/api/login")
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(401);
          done(err);
        })
    })
    it("it should POST the login", (done) => {
      // arrange: username and password
      let loginInfo = { 
        username: "yellowleopard753", 
        password: "jonjon"
      };
      // act: server request
      chai
        .request(server)
        .post("/api/login")
        .send(loginInfo)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("string");
          done();
        })
    });
  })
  describe("/GET me/cart", () => {
    it("it should GET the user cart", (done) => {
      //arrange: user cart

      // act: server request
      chai
        .request(server)
        .get("/me/cart")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          
          done();
        })
    })

  })
  describe("/POST me/cart", () => {
    it("it should POST to the user cart", (done) => {
      // arrange: product to add to cart
      let productToAdd = {
        id: "1",
        categoryId: "1",
        name: "Superglasses",
        description: "The best glasses in the world",
        price: 150,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
        ]
      }
      // act: server request
      chai
        .request(server)
        .post("/me/cart")
        .send(productToAdd)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("id");
          res.body.should.have.property("categoryId");
          res.body.should.have.property("name");
          res.body.should.have.property("description");
          res.body.should.have.property("price");
          res.body.should.have.property("imgURLs");
          done();
        })
    })

  })
  describe("/DELETE me/cart/:productId", () => {
    it("it should DELETE the product with productId from the user cart", (done) => {
      // arrange: product to delete
      let cart = [
        {
          cartItem: {
            id: "1",
            count: 1
          }
        }
      ]
      let productToDelete = {
        id: "1",
      }
      // act: server request
      chai
        .request(server)
        .delete(`/me/car/${productToDelete.id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("id");
          done();
        })

    })
  })
  describe("/POST me/cart/:productId", () => {
    it("it should POST product with productId to user cart", (done) => {
      chai
        .request(server)
        .post("/me/car/:productId")
        .send()
        .end((err, res) => {
          done(err);
        });
    })
  })
})
