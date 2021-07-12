let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
const { expect } = require("chai");

let should = chai.should();

chai.use(chaiHttp);

describe("LOGIN", () => {
  describe("/POST login", () => {
    it("should NOT POST user login if no username or password", (done) => {
      chai
        .request(server)
        .post(`/api/login`)
        .send({ username: "", password: "" })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should NOT POST user login if username or password is incorrect", (done) => {
      chai
        .request(server)
        .post(`/api/login`)
        .send({ username: "yellowleopard753", password: "123" })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should return access token with correct username and password", (done) => {
      chai
        .request(server)
        .post(`/api/login`)
        .send({ username: "yellowleopard753", password: "jonjon" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          //expect(res.body).to.be.an("object");
          done();
        });
    });
  });
});

describe("Products", () => {
  describe("/GET searched products", () => {
    it("should get searched products", (done) => {
      let query = "?query=Superglasses";
      chai
        .request(server)
        .get(`/api/products${query}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });

    it("should NOT get searched products if they are not in data", (done) => {
      let query = "?query=dog";
      chai
        .request(server)
        .get(`/api/products${query}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it("should NOT get searched products if search field blank", (done) => {
      let query = "?query=";
      chai
        .request(server)
        .get(`/api/products${query}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
});

describe("Brands", () => {
  describe("/GET Brands", () => {
    it("it should GET all brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });

    it("it should GET sunglasses based on brand", (done) => {
      let categoryId = 1;
      chai
        .request(server)
        .get(`/api/brands/${categoryId}/products`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});

describe("User cart", () => {
  let accessToken = "";
  before("login", () => {
    chai
      .request(server)
      .post("/api/login")
      .send({ username: "yellowleopard753", password: "jonjon" })
      .end((err, res) => {
        accessToken = res.body;
      });
  });

  describe("/GET user info", () => {
    it("NOT allow user to see profile if not logged in", (done) => {
      chai
        .request(server)
        .get("/api/me")
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
    it("NOT allow user to see cart if not logged in", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
    it("allows logged in user to view profile", (done) => {
      chai
        .request(server)
        .get("/api/me")
        .set("access_token", accessToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("object");
          done();
        });
    });
    it("allows logged in user to view cart", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .set("access_token", accessToken)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/POST to user cart", () => {
    it("should NOT POST product to cart if not logged in", (done) => {
      let product = {
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

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("should POST product to cart", (done) => {
      let product = {
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

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });

    it("should NOT POST product to cart if product has no id", (done) => {
      let product = {
        categoryId: "1",
        name: "Superglasses",
        price: 150,
        description: "The best glasses in the world",
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      };

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should NOT POST product to cart if product has no categoryId", (done) => {
      let product = {
        id: "1",
        name: "Superglasses",
        price: 150,
        description: "The best glasses in the world",
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      };

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should NOT POST product to cart if product has no price", (done) => {
      let product = {
        id: "1",
        categoryId: "1",
        name: "Superglasses",
        description: "The best glasses in the world",
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      };

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
    it("should NOT POST product to cart if product has no name", (done) => {
      let product = {
        id: "1",
        categoryId: "1",
        description: "The best glasses in the world",
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      };

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should NOT POST product to cart if product has no description", (done) => {
      let product = {
        id: "1",
        categoryId: "1",
        name: "Superglasses",
        price: 150,
        imageUrls: [
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
          "https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg",
        ],
      };

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("should NOT POST product to cart if product has no images", (done) => {
      let product = {
        id: "1",
        categoryId: "1",
        name: "Superglasses",
        price: 150,
        description: "The best glasses in the world",
      };

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe("/POST product with ID to user cart", () => {
    it("should NOT POST product to cart if not logged in", (done) => {
      let product = {
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

      chai
        .request(server)
        .post(`/api/me/cart/`)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it("it should NOT POST product if product ID not in cart", (done) => {
      let product = {
        id: "3",
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

      chai
        .request(server)
        .post(`/api/me/cart/${product.id}`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it("it should POST product to cart if ID present", (done) => {
      let product = {
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

      chai
        .request(server)
        .post(`/api/me/cart/${product.id}`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/DELETE User item from cart", () => {
    it("it should DELETE user product if ID present", (done) => {
      let product = {
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

      chai
        .request(server)
        .delete(`/api/me/cart/${product.id}`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it("it should NOT DELETE user product if ID not present", (done) => {
      let product = {
        id: "20",
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

      chai
        .request(server)
        .delete(`/api/me/cart/${product.id}`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
    it("it should NOT DELETE user product if user is not logged in", (done) => {
      let product = {
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

      chai
        .request(server)
        .delete(`/api/me/cart/${product.id}`)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});
