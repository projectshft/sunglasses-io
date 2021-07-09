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

    it("should POST user login if valid username and password", (done) => {
      chai
        .request(server)
        .post(`/api/login`)
        .send({ username: "yellowleopard753", password: "jonjon" })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a("string");
          done();
        });
    });
  });
});

describe("Sunglasses", () => {
  describe("/GET searched sunglasses", () => {
    it("it should GET search query", (done) => {
      chai.request(server).get("v1/sunglasses").query({ query: "glasses" });
      done();
    });
    it("should get searched sunglasses", (done) => {
      let query = "?query=glasses";
      chai
        .request(server)
        .get(`/api/products${query}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          //res.body.length.should.be.eql(0);
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
          //res.body.length.should.be.eql(0);
          done();
        });
    });
  });
  describe("/GET Brands", () => {
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

  describe("/GET user cart", () => {
    it("NOT allow user to see cart if not logged in", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
          expect(res).to.have.status(403);
          done();
        });
    });
    it("allows logged in user to see cart", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .set("access_token", accessToken)
        .end((err, res) => {
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("/POST to user cart", () => {
    it("should NOT POST sunglasses to cart if not logged in", (done) => {
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
          expect(res).to.have.status(403);
          done();
        });
    });

    it("should POST sunglasses to cart", (done) => {
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
  });

  describe("/POST to user", () => {
    it("should NOT POST sunglasses to cart if product has no price", (done) => {
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
  });

  describe("/POST to user", () => {
    it("it should POST sunglasses based on ID to user cart", (done) => {
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

  describe("/POST to user", () => {
    it("it should NOT POST sunglasses if no ID is found", (done) => {
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
        .post(`/api/me/cart/${product.id}`)
        .set("access_token", accessToken)
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe("/DELETE User item from cart", () => {
    it("it should DELETE user sunglasses based on ID", (done) => {
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
          expect(res).to.have.status(200);
          done();
        });
    });
  });
  describe("/NOT DELETE User item from cart", () => {
    it("it should NOT DELETE user sunglasses if ID not present", (done) => {
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
        .send(product)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });
});
