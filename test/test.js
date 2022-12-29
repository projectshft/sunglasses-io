const { should } = require("chai");
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

// Assertion style
chai.should();
chai.use(chaiHttp);

describe("Cart API", () => {
  // GET Tests
  describe("GET /api/products", () => {
    it("should GET all the products", (done) => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });

    it("should not GET all the products", (done) => {
      chai
        .request(server)
        .get("/api/product")
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe("GET /api/products/:id", () => {
    it("should GET the product by ID", (done) => {
      let id = "1";
      chai
        .request(server)
        .get(`/api/products/${id}`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("object");
          done();
        });
    });
    it("should return an error if no product in range", (done) => {
      let id = "15";
      chai
        .request(server)
        .get(`/api/products/${id}`)
        .end((err, response) => {
          response.should.have.status(404);
          response.body.message.should.equal("Product not found.");
          done();
        });
    });
  });

  describe("GET /api/brands", () => {
    it("should get products by brand ID", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
    it("should not get brands by ID", (done) => {
      chai
        .request(server)
        .get("/api/brand")
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe("GET api/brands/:id/products", () => {
    it("should return products according to brand ID", (done) => {
      let id = "1";
      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
    it("should error if brand ID is out of range", (done) => {
      let id = "-1";
      chai
        .request(server)
        .get(`/api/brands/${id}/products`)
        .end((err, response) => {
          response.should.have.status(404);
          response.body.message.should.equal("Brand does not exist");
          done();
        });
    });
  });

  describe("POST /api/login", () => {
    it("should return an access token as a string", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({ username: "lazywolf342", password: "tucker" })
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("string");
          done();
        });
    });
    it("should error if incorrect credentials", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send({ username: "johndoe", password: "password" })
        .end((err, response) => {
          response.should.have.status(401);
          response.body.message.should.equal("User not found.");
          done();
        });
    });
  });

  // These end-points require authentication.

  describe("GET /api/me/cart", () => {
    it("should retrieve contents in cart", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .set("access-token", "kmQWrczyuEkRE6VV")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });

    it("should return an error if user is not logged in", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, response) => {
          response.should.have.status(401);
          response.body.message.should.equal(
            "Please login to view cart contents."
          );
          done();
        });
    });
  });

  // Post Tests
  describe("POST /api/me/cart/:productId", () => {
    it("should post the product to cart by product ID", (done) => {
      let productId = "1";
      chai
        .request(server)
        .post(`/api/me/cart/${productId}`)
        .set("access-token", "kmQWrczyuEkRE6VV")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
    it("should return an error if post product ID is not in range", (done) => {
      let productId = "15";
      chai
        .request(server)
        .post(`/api/me/cart/${productId}`)
        .set("access-token", "kmQWrczyuEkRE6VV")
        .end((err, response) => {
          response.should.have.status(404);
          response.body.message.should.equal("Product not in inventory.");
          done();
        });
    });
    it("should return an error if user is not logged in", (done) => {
      let productId = "1";
      chai
        .request(server)
        .post(`/api/me/cart/${productId}`)
        .end((err, response) => {
          response.should.have.status(401);
          response.body.message.should.equal("Please login to add to cart.");
          done();
        });
    });
  });

  // Delete Test - needs credentials
  describe("DELETE /api/me/cart/:id", () => {
    it("should DELETE item in cart by product ID", (done) => {
      let id = "5";
      chai
        .request(server)
        .delete(`/api/me/cart/${id}`)
        .set("access-token", "kmQWrczyuEkRE6VV")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });
    it("should Error if product ID is not in cart", (done) => {
      let id = "-1";
      chai
        .request(server)
        .delete(`/api/me/cart/${id}`)
        .set("access-token", "kmQWrczyuEkRE6VV")
        .end((err, response) => {
          response.should.have.status(404);
          response.body.message.should.equal("Not a product in cart.");
          done();
        });
    });
    it("should return an error if user is not logged in", (done) => {
      let id = "1";
      chai
        .request(server)
        .delete(`/api/me/cart/${id}`)
        .end((err, response) => {
          response.should.have.status(401);
          response.body.message.should.equal("Please login to edit cart.");
          done();
        });
    });
  });
});
