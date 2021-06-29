let Sunglasses = require("../app/models/sunglasses-io");
const brandData = require("../app/initial-data/brands.json");

let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Sunglasses", () => {
  //Before each test we empty the database
  // beforeEach((done) => {
  //   Sunglasses.remove({}, (err) => {
  //     done();
  //   });
  // });

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

  describe("/POST login user", () => {
    // Work on this one
  });

  describe("/GET cart", () => {
    let accessToken = "";
    let loginData = { username: "greenlion235", password: "waters" };
    // DO I NEED DONE HERE?
    before("login user", (done) => {
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
          // response.body.length.should.be.equal();
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
        });
      done();
    });
  });

  describe("/POST add item to cart", () => {
    let accessToken = "";
    let loginData = { username: "greenlion235", password: "waters" };
    let product = {
      id: "1",
      categoryId: "1",
      name: "Superglasses",
      description: "The best glasses in the world",
      price: 150,
    };
    before("login user", (done) => {
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
        .send(product)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an("array");
          response.body[0].should.be.an("object");
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

    it("should return a 401 error with invalid token", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .set("access-token", "invalidToken")
        .send(product)
        .end((error, response) => {
          response.should.have.status(401);
        });
      done();
    });

    it("should return a 401 error if no access token provided", (done) => {
      chai
        .request(server)
        .post("/api/me/cart")
        .set("access-token", "invalidToken")
        .end((error, response) => {
          response.should.have.status(401);
        });
      done();
    });
  });

  describe("/DELETE delete item in cart", () => {
    let accessToken = "";
    before(
      chai
        .request(server)
        .get("/api/me/login")
        .send({ username: "greenlion235", password: "waters" })
        .end((error, response) => {
          accessToken = response.body;
        })
    );
  });

  describe("/POST update item in cart", () => {
    let accessToken = "";
    before(
      chai
        .request(server)
        .get("/api/me/login")
        .send({ username: "greenlion235", password: "waters" })
        .end((error, response) => {
          accessToken = response.body;
        })
    );
  });
});
