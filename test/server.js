let chai = require("chai");
let chaiHttp = require("chai-http");
let chaiThings = require("chai-things");
let server = require("../app/server");
let should = chai.should();

chai.use(chaiHttp);
chai.use(chaiThings);

let testToken = null;

describe("Brands", () => {
  // GET brands test
  describe("/GET brands", () => {
    it("should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  // GET products by brand ID test
  describe("/GET products by brand id", () => {
    it("should GET all products with corresponding brand id", (done) => {
      id = "1";
      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.should.all.have.property("categoryId", id);
          done();
        });
    });

    // test for error if the desired brand ID does not exist
    it("should return error if no brand is found", (done) => {
      id = "10";
      chai
        .request(server)
        .get(`/brands/${id}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

describe("Products", () => {
  // GET products test
  describe("/GET products", () => {
    it("should GET all the products", (done) => {
      chai
        .request(server)
        .get("/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

describe("User", () => {
  // POST login test
  describe("/POST login", () => {
    it("should POST login and return access token", (done) => {
      const login = {
        username: "yellowleopard753",
        password: "jonjon"
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("token");
          testToken = res.body.token;
          done();
        });
    });

    // test for error if login is invalid
    it("should return error if username and/or password is invalid", (done) => {
      const invalidPassword = {
        username: "yellowleopard753",
        password: "incorrectpassword"
      };

      const invalidUsername = {
        username: "incorrectusername",
        password: "jonjon"
      };

      chai
        .request(server)
        .post("/login")
        .send(invalidPassword)
        .end((err, res) => {
          res.should.have.status(401);
        });
      chai
        .request(server)
        .post("/login")
        .send(invalidUsername)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    
    // test error if login is missing
    it("should return error if username and/or password is not entered", (done) => {
      const missingPassword = {
        username: "yellowleopard753",
        password: ""
      };

      const missingUsername = {
        username: "",
        password: "jonjon"
      };

      const missingLogin = {
        username: "",
        password: ""
      };

      chai
        .request(server)
        .post("/login")
        .send(missingPassword)
        .end((err, res) => {
          res.should.have.status(400);
        });
      chai
        .request(server)
        .post("/login")
        .send(missingUsername)
        .end((err, res) => {
          res.should.have.status(400);
        });
      chai
        .request(server)
        .post("/login")
        .send(missingLogin)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });

  // GET user's cart test
  describe("/GET user's cart", () => {
    it("should GET the user's cart", (done) => {
      chai
        .request(server)
        .get(`/me/cart?accessToken=${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });

    // test error is user is not loggen in
    it("should return an error if not logged in", (done) => {
      chai
        .request(server)
        .post(`/me/cart?accessToken=`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  // POST product to cart test
  describe("/POST product to cart", () => {
    it("should POST product to user's cart", (done) => {
      const product = {
        "id": "1",
        "categoryId": "1",
        "name": "Superglasses",
        "description": "The best glasses in the world",
        "price":150,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
    };
    chai
      .request(server)
      .post(`/me/cart?accessToken=${testToken}`)
      .send(product)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("array");
        res.body.should.all.have.property("quantity");
        done();
      });
    });

    // test error if user is not logged in
    it("should return an error if not logged in", (done) => {
      chai
        .request(server)
        .post(`/me/cart?accessToken=`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  // DELETE product from cart test
  describe("/DELETE product from cart", () => {
    it("should DELETE a product from the cart given the product id", (done) => {
      const productId = "1";

      chai
        .request(server)
        .delete(`/me/cart/${productId}?accessToken=${testToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.not.have.property("id", productId);
          done();
        });
    });

    // test error if user is not logged in
    it("should return an error if not logged in", (done) => {
      const productId = "1";

      chai
        .request(server)
        .post(`/me/cart/${productId}?accessToken=`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });   
    
    it("should return an error if product with the specified id is not found", (done) => {
      productId = "20";
      chai
        .request(server)
        .post(`/me/cart/${productId}?accessToken=${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  // POST change quantity of product in cart test
  describe("/POST product in cart", () => {
    it("should CHANGE the quantity of a product in the cart given the product id", (done) => {
      const productId = "1";
      
      chai
        .request(server)
        .post(`/me/cart/${productId}?accessToken=${testToken}`)
        //.send(cart)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.should.contain.a.thing.with.property("quantity", 2);
          done();
        });
    });

    // test error is user is not logged in
    it("should return an error if not logged in", (done) => {
      chai
        .request(server)
        .post(`/me/cart?accessToken=`)
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    }); 

    it("should return an error if product with the specified id is not found", (done) => {
      productId = "20";
      chai
        .request(server)
        .post(`/me/cart/${productId}?accessToken=${testToken}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});