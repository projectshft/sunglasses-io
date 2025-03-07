const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../app/server"); // Adjust the path as needed

const should = chai.should();
chai.use(chaiHttp);

// TODO: Write tests for the server

describe("Brands", () => {
  describe("/GET brands", () => {
    it("should GET all the brands", (done) => {
      chai
        .request(server)
        .get("/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });

  describe("/GET brands/:id/products", () => {
    it("should GET all the products for a specific brand", (done) => {
      chai
        .request(server)
        .get("/brands/1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(3);
          done();
        });
    });

    it("should return an error if the brand does not exist", (done) => {
      chai
        .request(server)
        .get("/brands/6/products")
        .end((err, res) => {
          res.should.have.status(404);
          res.body.message.should.be.a("string");
          res.body.message.should.be.eql("No products found");
          done();
        });
    });
  });
});

describe("Products", () => {
  describe("/GET products", () => {
    it("should GET all the products", (done) => {
      chai
        .request(server)
        .get("/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(11);
          done();
        });
    });
  });
});

describe("Login", () => {
  describe("/POST login", () => {
    it("logs in an authenticated user", (done) => {
      let login = {
        username: "yellowleopard753",
        password: "jonjon",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          res.should.have.status(200);
          res.header.authorization.should.be.a("string");
          res.body.should.be.an("object");
          res.body.should.have.property("gender");
          res.body.should.have.property("cart");
          res.body.should.have.property("name");
          res.body.should.have.property("location");
          res.body.should.have.property("email");
          res.body.should.have.property("login");
          res.body.should.have.property("dob");
          res.body.should.have.property("registered");
          res.body.should.have.property("phone");
          res.body.should.have.property("cell");
          res.body.should.have.property("picture");
          res.body.should.have.property("nat");
          done();
        });
    });

    it("throws error for incomplete login", (done) => {
      let login = {
        username: "Bob",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an("object");
          res.body.message.should.be.a("string");
          res.body.message.should.be.eql(
            "Both a username and password are required"
          );
          done();
        });
    });

    it("throws error for unathorized login", (done) => {
      let login = {
        username: "Bob",
        password: "bobpass",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an("object");
          res.body.message.should.be.a("string");
          res.body.message.should.be.eql("Incorrect username or password");
          done();
        });
    });
  });
});

describe("Cart", () => {
  describe("/GET me/cart", () => {
    it("gets the cart for an authenticated user", (done) => {
      let login = {
        username: "yellowleopard753",
        password: "jonjon",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          const token = res.headers.authorization;
          chai
            .request(server)
            .get("/me/cart")
            .set("authorization", token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an("array");
              done();
            });
        });
    });

    it("throws error if user is not authenticated", (done) => {
      chai
        .request(server)
        .get("/me/cart")
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql("Authentication failed");
          done();
        });
    });
  });

  describe("/POST me/cart", () => {
    it("adds an item to user's cart", (done) => {
      const product = {
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
      };

      let login = {
        username: "yellowleopard753",
        password: "jonjon",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          const token = res.headers.authorization;
          chai
            .request(server)
            .post("/me/cart")
            .set("authorization", token)
            .send(product)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an("array");
              res.body.should.have.length(1);
              done();
            });
        });
    });

    it("throws error if product is not in catalog", (done) => {
      const product = {
        id: "12",
        categoryId: "1",
        name: "Fake glasses",
        description: "These glasses do not exist",
        price: 100,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      };

      let login = {
        username: "yellowleopard753",
        password: "jonjon",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          const token = res.headers.authorization;
          chai
            .request(server)
            .post("/me/cart")
            .set("authorization", token)
            .send(product)
            .end((err, res) => {
              res.should.have.status(404);
              res.body.message.should.be.eql("Product not found");
              done();
            });
        });
    });

    it("throws error if user is not authenticated", (done) => {
      chai
        .request(server)
        .post("/me/cart")
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql("Authentication failed");
          done();
        });
    });
  });

  describe("/POST me/cart/:productId", () => {
    it("Updates the quantity of a particular item in the user's cart (increase)", (done) => {
      let login = {
        username: "lazywolf342",
        password: "tucker",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          const token = res.headers.authorization;
          chai
            .request(server)
            .post("/me/cart/2")
            .set("authorization", token)
            .send({ amount: 3 })
            .end((err, res) => {
              console.log(res.body);
              res.should.have.status(200);
              res.body.should.be.an("array");
              res.body.should.have.length(3);
              done();
            });
        });
    });

    it("Updates the quantity of a particular item in the user's cart (decrease)", (done) => {
      let login = {
        username: "lazywolf342",
        password: "tucker",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          const token = res.headers.authorization;
          chai
            .request(server)
            .post("/me/cart/2")
            .set("authorization", token)
            .send({ amount: 2 })
            .end((err, res) => {
              console.log(res.body);
              res.should.have.status(200);
              res.body.should.be.an("array");
              res.body.should.have.length(2);
              done();
            });
        });
    });

    it("throws error if product is not in cart", (done) => {
      let login = {
        username: "yellowleopard753",
        password: "jonjon",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          const token = res.headers.authorization;
          chai
            .request(server)
            .post("/me/cart/13")
            .set("authorization", token)
            .end((err, res) => {
              res.should.have.status(404);
              res.body.message.should.be.eql("Product not found");
              done();
            });
        });
    });

    it("throws error if user is not authenticated", (done) => {
      chai
        .request(server)
        .post("/me/cart/1")
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql("Authentication failed");
          done();
        });
    });
  });

  describe("/DELETE me/cart/:productId", () => {
    it("deletes an item from the cart", (done) => {
      let login = {
        username: "greenlion235",
        password: "waters",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          const token = res.headers.authorization;
          chai
            .request(server)
            .delete("/me/cart/7")
            .set("authorization", token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.should.be.an("array");
              res.body.should.have.length(0);
              done();
            });
        });
    });

    it("throws error if product is not in cart", (done) => {
      let login = {
        username: "yellowleopard753",
        password: "jonjon",
      };

      chai
        .request(server)
        .post("/login")
        .send(login)
        .end((err, res) => {
          const token = res.headers.authorization;
          chai
            .request(server)
            .delete("/me/cart/13")
            .set("authorization", token)
            .end((err, res) => {
              res.should.have.status(404);
              res.body.message.should.be.eql("Product not found");
              done();
            });
        });
    });

    it("throws error if user is not authenticated", (done) => {
      chai
        .request(server)
        .delete("/me/cart/1")
        .end((err, res) => {
          res.should.have.status(401);
          res.body.message.should.be.eql("Authentication failed");
          done();
        });
    });
  });
});
