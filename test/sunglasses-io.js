const brandData = require("../app/initial-data/brands.json");

let chai = require("chai");
let chaiHttp = require("chai-http");

let should = chai.should();

chai.use(chaiHttp);

describe("Everything", () => {
  let server;
  beforeEach(() => {
    delete require.cache[require.resolve("../app/server")];
    server = require("../app/server");
  });

  describe("/GET brands", () => {
    it("should get all the brands", (done) => {
      chai
        .request(server)
        .get("/api/brands")
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.have.keys("id", "name");
          response.body.length.should.be.eql(5);
          done();
        });
    });
  });

  describe("/Get products by brand", () => {
    it("should get all products in a given brand", (done) => {
      let brandRequestId = brandData[0].id;
      chai
        .request(server)
        .get(`/api/brands/${brandRequestId}/products`)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.have.keys(
            "id",
            "categoryId",
            "name",
            "description",
            "price",
            "imageUrls"
          );
          response.body.length.should.be.eql(3);
          done();
        });
    });

    it("should return a 404 error if brandId is not found", (done) => {
      chai
        .request(server)
        .get("/api/brands/6/products")
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe("/GET products by search query", () => {
    it("should get return all products related to search query", (done) => {
      chai
        .request(server)
        .get("/api/products?q=best")
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.have.keys(
            "id",
            "categoryId",
            "name",
            "description",
            "price",
            "imageUrls"
          );
          response.body.length.should.be.equal(4);
          done();
        });
    });

    it("should return all products if search query is empty", (done) => {
      chai
        .request(server)
        .get("/api/products?q=")
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.have.keys(
            "id",
            "categoryId",
            "name",
            "description",
            "price",
            "imageUrls"
          );
          response.body.length.should.be.equal(11);
          done();
        });
    });

    it("should return a 404 error if items related to query are not found", (done) => {
      chai
        .request(server)
        .get("/api/products?q=jeans")
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe("/POST successful login user", () => {
    let loginData = { username: "greenlion235", password: "waters" };

    it("should login a user with valid login data and a current access token", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send(loginData)
        .end((error, response) => {
          response.should.have.status(200);
          done();
        });
    });
  });

  describe("/POST login user 3 bad attempts", () => {
    let accessToken = "";
    let loginData = { username: "greenlion235", password: "waters" };
    let badLoginData = { username: "greenlion235", password: "notThePassword" };

    it("should not allow a user to login after 3 incorrect attempts", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send(badLoginData)
        .end((error, response) => {
          chai
            .request(server)
            .post("/api/login")
            .send(badLoginData)
            .end((error, response) => {
              chai
                .request(server)
                .post("/api/login")
                .send(badLoginData)
                .end((error, response) => {
                  chai
                    .request(server)
                    .post("/api/login")
                    .send(loginData)
                    .set("access-token", accessToken)
                    .end((error, response) => {
                      response.should.have.status(401);
                      done();
                    });
                });
            });
        });
    });
  });

  describe("/POST login user missing or incorrect data", () => {
    let missingLoginData = { username: "greenlion235" };
    let badLoginData = { username: "greenlion235", password: "notThePassword" };

    it("should return a 401 error if either username or password are invalid", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send(badLoginData)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it("should return a 400 error if missing username or login", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send(missingLoginData)
        .end((error, response) => {
          response.should.have.status(400);
          done();
        });
    });
  });

  describe("/GET cart", () => {
    let accessToken = "";
    let loginData = { username: "greenlion235", password: "waters" };

    beforeEach("login user", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send(loginData)
        .end((error, response) => {
          accessToken = response.body;
          done();
        });
    });

    it("should get the users cart with valid access token", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .set("access-token", accessToken)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          done();
        });
    });

    it("should return a 401 error if invalid token provided", (done) => {
      chai
        .request(server)
        .get("/api/me/cart")
        .set("access-token", "invalidToken")
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });

  describe("/POST add item to cart", () => {
    let accessToken = "";
    let loginData = { username: "greenlion235", password: "waters" };
    let productOne = {
      id: "1",
      categoryId: "1",
      name: "Superglasses",
      description: "The best glasses in the world",
      price: 150,
    };
    let productTwo = {
      id: "2",
      categoryId: "1",
      name: "Black Sunglasses",
      description: "The best glasses in the world",
      price: 100,
    };

    beforeEach("login user", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send(loginData)
        .end((error, response) => {
          accessToken = response.body;
          done();
        });
    });

    it("should add item to cart", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .set("access-token", accessToken)
        .send(productOne)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body.length.should.be.equal(1);
          response.body[0].should.have.keys(
            "id",
            "categoryId",
            "name",
            "price",
            "quantity"
          );
          done();
        });
    });

    it("should increase product count by one if adding duplicate item to cart", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .set("access-token", accessToken)
        .send(productOne)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.be.an("object");
          response.body.length.should.be.equal(1);
          response.body[0].quantity.should.be.equal(2);
          response.body[0].should.have.keys(
            "id",
            "categoryId",
            "name",
            "price",
            "quantity"
          );
          done();
        });
    });

    it("should add multiple items to cart", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .set("access-token", accessToken)
        .send(productTwo)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[1].should.be.an("object");
          response.body[1].quantity.should.be.equal(1);
          response.body[1].id.should.be.equal("2");
          response.body.length.should.be.equal(2);
          response.body[1].should.have.keys(
            "id",
            "categoryId",
            "name",
            "price",
            "quantity"
          );
          done();
        });
    });

    it("should return a 401 error with invalid token", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .set("access-token", "invalidToken")
        .send(productOne)
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });

    it("should return a 401 error if no access token provided", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });

  describe("/DELETE delete item in cart", () => {
    let accessToken = "";
    let loginData = { username: "greenlion235", password: "waters" };
    let productOne = {
      id: "1",
      categoryId: "1",
      name: "Superglasses",
      description: "The best glasses in the world",
      price: 150,
    };
    let productTwo = {
      id: "2",
      categoryId: "1",
      name: "Black Sunglasses",
      description: "The best glasses in the world",
      price: 100,
    };
    let productIdToDelete = 1;

    beforeEach("login user", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send(loginData)
        .end((error, response) => {
          accessToken = response.body;
          chai
            .request(server)
            .post("/api/me/cart")
            .set("access-token", accessToken)
            .send(productOne)
            .end((error, response) => {
              chai
                .request(server)
                .post("/api/me/cart")
                .set("access-token", accessToken)
                .send(productTwo)
                .end((error, response) => {
                  response.should.have.status(200);
                  done();
                });
            });
        });
    });

    it("should delete an item from the cart based on productId", (done) => {
      chai
        .request(server)
        .delete(`/api/me/cart/${productIdToDelete}`)
        .set("access-token", accessToken)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.be.an("object");
          response.body.length.should.be.equal(1);
          response.body[0].id.should.be.equal("2");
          response.body[0].should.have.keys(
            "id",
            "categoryId",
            "name",
            "price",
            "quantity"
          );
          done();
        });
    });

    it("should return a 404 error if productId is not found in cart", (done) => {
      chai
        .request(server)
        .delete("/api/me/cart/5")
        .set("access-token", accessToken)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });

    it("should return a 401 error if no access token provided", (done) => {
      chai
        .request(server)
        .delete("/api/me/cart/1")
        .set("access-token", "invalidToken")
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });

  describe("/POST update item in cart", () => {
    let accessToken = "";
    let loginData = { username: "yellowleopard753", password: "jonjon" };
    let productOne = {
      id: "1",
      categoryId: "1",
      name: "Superglasses",
      description: "The best glasses in the world",
      price: 150,
    };
    let productTwo = {
      id: "2",
      categoryId: "1",
      name: "Black Sunglasses",
      description: "The best glasses in the world",
      price: 100,
    };
    let productIdToUpdate = 2;
    let updatedProductQuantity = { quantity: 5 };

    beforeEach("login user", (done) => {
      chai
        .request(server)
        .post("/api/login")
        .send(loginData)
        .end((error, response) => {
          accessToken = response.body;
          chai
            .request(server)
            .post("/api/me/cart")
            .set("access-token", accessToken)
            .send(productOne)
            .end((error, response) => {
              chai
                .request(server)
                .post("/api/me/cart")
                .set("access-token", accessToken)
                .send(productTwo)
                .end((error, response) => {
                  response.should.have.status(200);
                  done();
                });
            });
        });
    });

    it("should only update the product that matches the id provided", (done) => {
      chai
        .request(server)
        .post(`/api/me/cart/${productIdToUpdate}`)
        .set("access-token", accessToken)
        .send(updatedProductQuantity)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.be.an("object");
          response.body.length.should.be.equal(2);
          response.body[1].quantity.should.be.equal(5);
          response.body[0].quantity.should.be.equal(1);
          response.body[0].should.have.keys(
            "id",
            "categoryId",
            "name",
            "price",
            "quantity"
          );
          done();
        });
    });

    it("should return a 404 error if productId is not found in cart", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/5")
        .set("access-token", accessToken)
        .end((error, response) => {
          response.should.have.status(404);
          done();
        });
    });

    it("should return a 401 error if no access token provided", (done) => {
      chai
        .request(server)
        .post("/api/me/cart/1")
        .set("access-token", "invalidToken")
        .end((error, response) => {
          response.should.have.status(401);
          done();
        });
    });
  });
});
