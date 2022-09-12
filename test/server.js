let chai = require("chai");
let chaiHttp = require("chai-http");
let {server, addToCart, updateAccessTokens, clearState } = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

beforeEach(() => {
  clearState();
});

// "product" constants to help with arranging
const superglasses = {
  "id": "1",
  "categoryId": "1",
  "name": "Superglasses",
  "description": "The best glasses in the world",
  "price":150,
  "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
};

const blackSunglasses = {
  "id": "2",
  "categoryId": "1",
  "name": "Black Sunglasses",
  "description": "The best glasses in the world",
  "price":100,
  "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
};

describe("Brands", () => {
  describe("/GET brands", () => {
    it("it should GET all the brands", (done) => {
      // nothing to really arrange, so we can just into act
      chai
        .request(server)
        .get("/brands")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(5);
          done();
        });
    });
  });

  describe("/GET products in brand", () => {
    it("it should GET all the products in a brand", (done) => {
      // nothing to arrange
      chai
        .request(server)
        .get("/brands/1/products")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(3);
          res.body[0].should.be.an("object");
          done();
        });
    });

    it("it should fail if brand is not found", (done) => {
      // nothing to arrange
      chai
        .request(server)
        .get("/brands/6/products")
        // assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

describe("Products", () => {
  describe("/GET products", () => {
    it("it should GET all of the products with a relevant name", (done) => {
      // arrange
      let search = "sunglasses";
      // act
      chai
        .request(server)
        .get(`/products?query=${search}`)
        .query(search)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(2);
          done();
        });
    });

    it("it should GET all of the products with a relevant description", (done) => {
      // arrange
      let search = "AWFUL";
      // act
      chai
        .request(server)
        .get(`/products?query=${search}`)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(1);
          done();
        });
    });

    it("it should return a 400 if the query is less than 3 letters", (done) => {
      // arrange
      let search = "in";
      // act
      chai
        .request(server)
        .get(`/products?query=${search}`)
        // assert
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("it should return a 404 if no relevant products are found", (done) => {
      // arrange
      let search = "California";
      // act
      chai
        .request(server)
        .get(`/products?query=${search}`)
        // assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

describe("Log In", () => {
  describe("/POST log in", () => {
    it("it should return a token object upon successful login", (done) => {
      // arrange
      let credentials = {
        username: "yellowleopard753",
        password: "jonjon",
      };
      // act
      chai
        .request(server)
        .post("/login")
        .send(credentials)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("object");
          res.body.should.have.property("username");
          res.body.username.should.be.eql("yellowleopard753")
          res.body.should.have.property("lastUpdated");
          res.body.lastUpdated.should.be.a("string");
          res.body.should.have.property("token");
          res.body.token.should.be.a("string");
          done();
        });
    });

    it("it should throw a 400 with a missing parameter", (done) => {
      // arrange
      let credentials = {
        username: "yellowleopard753",
      };
      // act
      chai
        .request(server)
        .post("/login")
        .send(credentials)
        // assert
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it("it should throw a 401 with an invalid username", (done) => {
      // arrange
      let credentials = {
        username: "yellowleopard752",
        password: "jonjon"
      };
      // act
      chai  
        .request(server)
        .post("/login")
        .send(credentials)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it("it should throw a 401 with an invalid password", (done) => {
      // arrange
      let credentials = {
        username: "yellowleopard753",
        password: "jonjoon"
      };
      // act
      chai  
        .request(server)
        .post("/login")
        .send(credentials)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });
});

describe("Cart", () => {
  describe("/GET cart", () => {
    it("it should GET cart products when logged in", (done) => {
      // arrange
      const testToken = {
        username: "username",
        lastUpdated: new Date(),
        token: "testToken",
      };
      updateAccessTokens(testToken);
      addToCart(superglasses);
      addToCart(blackSunglasses);
      // act
      chai
        .request(server)
        .get("/me/cart?token=testToken")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(2);
          done();
        });
    });

    it("it should GET an empty array when logged in and cart is empty", (done) => {
      // arrange
      const testToken = {
        username: "username",
        lastUpdated: new Date(),
        token: "testToken",
      };
      updateAccessTokens(testToken);
      // act
      chai
        .request(server)
        .get("/me/cart?token=testToken")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.be.eql(0);
          done();
        });
    });

    it("it should return a 401 if no token is present", (done) => {
      // nothing to arrange
      chai
        .request(server)
        .get("/me/cart?token=testToken")
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });

    it("it should return a 401 if token is present but expired", (done) => {
      // arrange expired token
      const testToken = {
        username: "username",
        lastUpdated: new Date('December 17, 1995 03:24:00'),
        token: "testToken",
      }
      updateAccessTokens(testToken);
      // act
      chai
        .request(server)
        .get("/me/cart?token=testToken")
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
  });

  describe("/POST cart", () => {
    it("it should add an item to the cart and return the updated cart", (done) => {
      // arrange
      const testToken = {
        username: "username",
        lastUpdated: new Date(),
        token: "testToken",
      };
      updateAccessTokens(testToken);
      addToCart(superglasses);
      // act
      chai
        .request(server)
        .post("/me/cart?token=testToken")
        .send(blackSunglasses)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.eq(2);
          done();
        });
    });
    it("it should increment the count of an existing item in the cart and return the updated cart", (done) => {
      // arrange
      const testToken = {
        username: "username",
        lastUpdated: new Date(),
        token: "testToken",
      };
      updateAccessTokens(testToken);
      addToCart(superglasses);
      // act
      chai
        .request(server)
        .post("/me/cart?token=testToken")
        .send(superglasses)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.length.should.eq(1);
          res.body[0].should.be.an("object");
          res.body[0].should.have.property("count");
          res.body[0].count.should.eq(2);
          done();
        });
    });
    it("it should return a 401 with an invalid token", (done) => {
      // arrange expired token
      const testToken = {
        username: "username",
        lastUpdated: new Date('December 17, 1995 03:24:00'),
        token: "testToken",
      }
      updateAccessTokens(testToken);
      // act
      chai
        .request(server)
        .post("/me/cart?token=testToken")
        .send(superglasses)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("it should return a 404 if trying add a product that does not exist", (done) => {
      // arrange
      const testToken = {
        username: "username",
        lastUpdated: new Date(),
        token: "testToken",
      };
      updateAccessTokens(testToken);
      const testProduct = {
        "id": "10",
        "categoryId": "8",
        "name": "Black Aviators",
        "description": "The best aviators in the world",
        "price":101,
        "imageUrls":["https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg","https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg"]
      };
      // act
      chai
        .request(server)
        .post("/me/cart?token=testToken")
        .send(testProduct)
        // assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  })
});
