let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
let chaiThings = require("chai-things");
let should = chai.should();

chai.use(chaiHttp);
chai.use(chaiThings);

let testAccessToken = null;
let products = require("../initial-data/products.json");

describe("Brands", () => {
  // GET brands endpoint test
  describe("/GET brands", () => {
    it("should GET all the brands", (done) => {
      chai
      .request(server)
      .get("/brands")
      .end((error, response) => {
        response.should.have.status(200);
        response.body.should.be.an("array");
        done();
      });
    });
  });
  
  // GET products by brands Id endpoint test
  describe("/GET products by brand id", () => {
    it("should GET all products within the brand id", (done) => {
      let id = "1";
      chai
      .request(server)
      .get(`/brands/${id}/products`)
      .end((error, response) => {
        response.should.have.status(200);
        response.body.should.be.an("array");
        response.body.should.all.have.property("categoryId", id);
        done();
      });
    });
  
    // test for error if products by brands Id is not found
    it("should return error if no products within the brand id is found", (done) => {
      let id = "10";
      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });
});

// GET all products endpoint test
describe("Products", () => {
  describe("/GET products", () => {
    it("should return all the products", (done) => {
      chai
        .request(server)
        .get("/products")
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
  });
});

// Post user login endpoint test
describe("User", () => {
  describe("/POST login", () => {
    it("should authenticate valid user login credentials with access token", (done) => {
      chai
        .request(server)
        .post("/login")
        .send({
          "username": "lazywolf342",
          "password": "tucker"
        })
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("object");
          response.body.should.have.property("token");
          testAccessToken = response.body.token;
          done();
        });
    });

    // test login endpoint for errors
    it("should not return an access token if incorrect user login credentials", (done) => {
      chai
        .request(server)
        .post("/login")
        .send({
          "username": "lazywolf",
          "password": "trucker"
        })
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it("should not return an access token if missing any user login credentials", (done) => {
      chai
        .request(server)
        .post("/login")
        .send({
          "username": "lazywolf",
          "password": ""
        })
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });
  });

  // GET login user's cart
  describe("/GET login user's cart", () => {
    it("should return the login user's cart", (done) => {
      chai
        .request(server)
        .get(`/me/cart?accessToken=${testAccessToken}`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
  
    it("should return error if user is not logged in", (done) => {
      chai
        .request(server)
        .get(`/me/cart?accessToken=`)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });

  // POST product add to the login user's cart
  describe("/POST product add to the login user's cart", () => {
    it("should add a product to the login user's cart", (done) => {
      let product = products[0];
      // console.log(product);
      chai
        .request(server)
        .post(`/me/cart?accessToken=${testAccessToken}`)
        .send(product)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.be.an("object");
          done();
        });
    });

    it("should return error if user is not logged in", (done) => {
      chai
        .request(server)
        .get(`/me/cart?accessToken=`)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });

  // DELETE remove a product from the login user's cart
  describe("/DELETE remove a product from the login user's cart", () => {
    it("should remove a product by id from the login user's cart", (done) => {
      let productId = "1";

      chai
        .request(server)
        .delete(`/me/cart/${productId}?accessToken=${testAccessToken}`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });

    it("should return error if user is not logged in", (done) => {
      let productId = "1";
      
      chai
        .request(server)
        .delete(`/me/cart/${productId}?accessToken=`)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });

  // POST edit and update product quantity in the login user's cart
  describe("/POST edit and update product quantity in the login user's cart", () => {
    it("should allow access to modify product id quantity in the login user's cart", (done) => {
      let productId = "1";

      chai
        .request(server)
        .post(`/me/cart/${productId}?accessToken=${testAccessToken}`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.be.an("object");
          done();
        });
    });

    it("should return error if user is not logged in", (done) => {
      let productId = "1";

      chai
        .request(server)
        .delete(`/me/cart/${productId}?accessToken=`)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });
});
