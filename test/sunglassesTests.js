let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
var fs = require("fs");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses.io", () => {
  let token;
  let user = { username: "yellowleopard753", password: "jonjon" };

  before((done) => {
    chai
      .request(server)
      .post(`/api/login`)
      .set("content-type", "application/json")
      .send(user)
      .end((err, res) => {
        res.should.have.status(200);
        token = res.body;
        done();
      });
  });

  describe("When requesting all the brands", () => {
    it("should list all the brands in the store", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("When requesting all products from a specific brand", () => {
    it("should return a list of all products from a specific brand", (done) => {
      chai
        .request(server)
        .get("/api/brands/1/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.every((product) => product.categoryId == 1);
          done();
        });
    });

    it("should return an error if the brand requested doesn't exist", (done) => {
      let brands = [];

      fs.readFile("initial-data/brands.json", "utf8", (error, data) => {
        if (error) throw error;
        brands = JSON.parse(data);
      });

      const invalidBrandId = () => {
        let randomNumber = Math.random();

        while (brands.some((brand) => brand.id === randomNumber)) {
          randomNumber += 100;
        }

        return randomNumber;
      };

      chai
        .request(server)
        .get(`/api/brands/${invalidBrandId()}/products`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });

  describe("When requesting all products from the store", () => {
    it("should return a list of all products from the store", (done) => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("When requesting to login", () => {
    it("should return an error if login credentials are incorrect", (done) => {
      chai
        .request(server)
        .post(`/api/login`)
        .set("content-type", "application/json")
        .send({ username: "invalidUsername", password: "invalidPassword" })
        .end((err, res) => {
          res.should.have.status(401, "Invalid username or password");
          done();
        });
    });

    it("should provide an access token if login credentials are valid", (done) => {
      chai
        .request(server)
        .post(`/api/login`)
        .set("content-type", "application/json")
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("string");
          res.body.length.should.be.eql(16);
          done();
        });
    });
  });

  describe("When requesting the items from a user's cart", () => {
    it("should return an error if the user is not logged in", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .query({ accessToken: "invalidToken" })
        .end((err, res) => {
          res.should.have.status(401, "You must be logged in to view the cart");
          done();
        });
    });

    it("should return a list of products from the user's cart", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .query({ accessToken: token })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("When adding an item to the user's cart", () => {
    it("should return an error if the user is not logged in", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .query({ accessToken: "invalidToken" })
        .end((err, res) => {
          res.should.have.status(401, "You must be logged in to view the cart");
          done();
        });
    });

    it("should return an error if no product is provided", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .query({ accessToken: token })
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: No valid product provided"
          );
          done();
        });
    });

    it("should return an error if the product doesn't exist in the store", (done) => {
      let product = {
        id: "fake",
        categoryId: "fake",
        name: "Fake Product",
        description: "",
        price: 0,
        imageUrls: [],
      };

      chai
        .request(server)
        .post("/api/me/cart")
        .query({ accessToken: token })
        .set("content-type", "application/json")
        .send(product)
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: No valid product provided"
          );
          done();
        });
    });

    it("should return an error if the product is already in the user’s cart", (done) => {
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
        .post("/api/me/cart")
        .query({ accessToken: token })
        .set("content-type", "application/json")
        .send(product)
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: Product already in cart"
          );
          done();
        });
    });

    it("should add the product to the user’s cart", (done) => {
      let product = {
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
      };

      chai
        .request(server)
        .post("/api/me/cart")
        .query({ accessToken: token })
        .set("content-type", "application/json")
        .send(product)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("When deleting an item from the user's cart", () => {
    it("should return an error if the user is not logged in", (done) => {
      chai
        .request(server)
        .delete("/api/me/cart/1")
        .query({ accessToken: "invalidToken" })
        .end((err, res) => {
          res.should.have.status(401, "You must be logged in to view the cart");
          done();
        });
    });

    it("should return an error if the product ID doesn't exist in the store", (done) => {
      chai
        .request(server)
        .delete("/api/me/cart/12345")
        .query({ accessToken: token })
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: No valid product ID provided"
          );
          done();
        });
    });

    it("should return an error if the product is not in the user’s cart", (done) => {
      chai
        .request(server)
        .delete("/api/me/cart/4")
        .query({ accessToken: token })
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: Product is not in cart"
          );
          done();
        });
    });

    it("should delete the product from the user’s cart", (done) => {
      chai
        .request(server)
        .delete("/api/me/cart/1")
        .query({ accessToken: token })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });

  describe("When updating the quantity of an item in the user's cart", () => {
    it("should return an error if the user is not logged in", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/1")
        .query({ accessToken: "invalidToken" })
        .end((err, res) => {
          res.should.have.status(401, "You must be logged in to view the cart");
          done();
        });
    });

    it("should return an error if the product ID doesn't exist in the store", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/12345")
        .query({ accessToken: token })
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: No valid product ID provided"
          );
          done();
        });
    });

    it("should return an error if the product is not in the user’s cart", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/4")
        .query({ accessToken: token })
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: Product is not in cart"
          );
          done();
        });
    });

    it("should return an error if the quantity provided is not an integer", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/1")
        .query({ accessToken: token })
        .set("content-type", "application/json")
        .send({ quantity: "abc" })
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: Quantity provided is not an integer"
          );
          done();
        });
    });

    it("should return an error if the quantity provided is less than 0", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/1")
        .query({ accessToken: token })
        .set("content-type", "application/json")
        .send({ quantity: -1 })
        .end((err, res) => {
          res.should.have.status(
            400,
            "Invalid Request: Quantity provided is less than 0"
          );
          done();
        });
    });

    it("should delete the item in the cart if the quantity is changed to 0", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/2")
        .query({ accessToken: token })
        .set("content-type", "application/json")
        .send({ quantity: 0 })
        .end((err, res) => {
          res.should.have.status(
            200,
            "Success: Quantity changed to 0 and item deleted from cart"
          );
          done();
        });
    });

    it("should update the quantity of the product in the user's cart", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/3")
        .query({ accessToken: token })
        .set("content-type", "application/json")
        .send({ quantity: 5 })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          done();
        });
    });
  });
});
