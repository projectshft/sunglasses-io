// import chai from 'chai';
// import chaiHttp from "chai-http";
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");
var fs = require("fs")

let brands = [];
let products = [];
let users = [];
let should = chai.should();

chai.use(chaiHttp);

beforeEach(() => {
  fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
    if (error) throw error;
    brands = JSON.parse(data);
  });
  fs.readFile("initial-data/products.json", "utf8", (error, data) => {
    if(error) throw error;
    products = JSON.parse(data);
  });
  fs.readFile("initial-data/users.json", "utf8", (error, data) => {
    if (error) throw error;
    users = JSON.parse(data);
  });

});

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
          res.body.should.be.an("object");
          res.body.should.have.property("cart");
          res.body.should.have.property("name");
          res.body.should.have.property("location");
          res.body.should.have.property("email");
          res.body.should.have.property("login");
          done();
        })
    });
  })
  describe("/GET /api/me/cart", () => {
    it("it should GET the user cart", (done) => {
      //arrange: username of user simulated as "logged in"
      let loggedInUsername = "yellowleopard753";
      
      // act: server request
      chai
        .request(server)
        .get(`/api/me/cart`)
        .send(loggedInUsername)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("cart");
          res.body.should.have.property("name");
          res.body.should.have.property("location");
          res.body.should.have.property("email");
          res.body.should.have.property("dob");
          res.body.should.have.property("phone");
          res.body.should.have.property("picture");
          res.body.cart.should.be.an("array");         
          res.body.cart.length.should.be.eql(0);
          done();
        });
    });
  });
  describe("/POST /api/me/cart", () => {
    it("it should POST to the user cart", (done) => {
      // arrange: logged in user and product to add to user cart
      let productToAddToUserCart = {
        username: "yellowleopard753",
        productToAdd: {
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
      }
      // act: server request
      chai
        .request(server)
        .post(`/api/me/cart`)
        .send(productToAddToUserCart)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.login.username.should.be.a("string");
          res.body.login.username.should.eql(productToAddToUserCart.username);
          res.body.should.have.property("cart");
          res.body.cart.should.be.an("array");
          res.body.cart[0].should.be.an("object");
          res.body.cart[0].should.have.property("product");
          res.body.cart[0].product.product.should.have.property("imageUrls");
          res.body.cart[0].product.product.imageUrls.should.be.an("array");
          res.body.cart[0].should.have.property("quantity");
          res.body.should.have.property("name");
          res.body.should.have.property("login");
          done();
        })
    })

  })
  describe("/DELETE /api/me/cart/:productId", () => {
    // it("it should not DELETE the product with productId if it does not exist in the user cart", (done) => {

    // })
    it("it should DELETE the product with productId from the user cart", (done) => {
      // arrange username, product to delete and adding the product to user cart
      let username = "yellowleopard753";
      let productIdToDeleteId = 1;
      
      // act: server request
      chai
        .request(server)
        .delete(`/api/me/cart/${productIdToDeleteId}`)
        .send(username)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("cart");
          res.body.login.should.have.property("username")
          done();
        })

    })
  })
  describe("/POST /api/me/cart/:productId", () => {
    it("it should POST product with productId to user cart", (done) => {
      let product = {
        id: "4",
        categoryId: "2",
        name: "Better glasses",
        description: "The best glasses in the world",
        price: 1500,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"
        ]
      }
      chai
        .request(server)
        .post(`/api/me/cart/${product.id}`)
        .send()
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    })
  })
});
