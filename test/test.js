let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");
let chaiAsPromised = require("chai-as-promised");
var sinon = require("sinon");

clock = sinon.useFakeTimers();

chai.use(chaiHttp);
chai.use(require("chai-things"));
chai.use(require("chai-uuid"));
chai.use(chaiAsPromised);

let should = chai.should();

// sinon used for access token timeout

describe("Brands", () => {
  describe("/GET brands ", () => {
    it("it should GET all the brands as an array", (done) => {
      // assemble
      const duplicateIds = [];

      // we'll want to check for duplicate IDs
      const checkForDuplicates = (array) => {
        let duplicateStatus = false;
        const alreadySeen = [];

        // want to compare the ID value for each object in array
        // using a for loop so that we can break early
        for (let i = 0; i < array.length; i++) {
          // if the ID value has been seen before, return change status to true
          if (alreadySeen.includes(array[i].id)) {
            duplicateStatus = true;
            break;
          } else {
            // for unique values, let's push them to array
            alreadySeen.push(array[i].id);
          }
        }

        return duplicateStatus;
      };

      //act
      chai
        .request(server)
        .get("/api/brands")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.should.all.have.property("id");
          res.body.should.all.have.property("name");
          checkForDuplicates(res.body).should.equal(false);
          done();
        });
    });
  });

  describe("/GET brands/:id/products", () => {
    it("it should GET all the products for a given brand", (done) => {
      // assemble
      const searchCategory = "1";
      //act
      chai
        .request(server)
        .get(`/api/brands/${searchCategory}/products`)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.should.all.have.keys("id", "categoryId", "name", "description", "price", "imageUrls");
          res.body.should.all.have.property("categoryId", searchCategory);
          done();
        });
    });
    it("it should return an error when an invalid value is passed", (done) => {
      // assemble
      const invalidCategory = "10";
      //act
      chai
        .request(server)
        .get(`/api/brands/${invalidCategory}/products`)
        // assert
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.not.be.an("array");
          done();
        });
    });
  });
});

describe("Products", () => {
  describe("/GET products ", () => {
    it("it should GET all the products as an array when given no search term", (done) => {
      //act
      chai
        .request(server)
        .get("/api/products")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          res.body.should.all.have.keys("id", "categoryId", "name", "description", "price", "imageUrls");
          done();
        });
    });
    it("it should GET the products containing a search query when given a search term", (done) => {
      //act
      chai
        .request(server)
        .get("/api/products?search=Brown")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          checkFilter(res.body, "Brown").should.equal(true);
          done();
        });
    });
    it("it should GET the products containing a case insensitive search query", (done) => {
      //act
      chai
        .request(server)
        .get("/api/products?search=sunGLASSES")
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an("array");
          // chose a word likely to appear at least somewhere
          checkFilter(res.body, "sunGLASSES").should.equal(true);
          res.body.should.not.have.lengthOf(0);
          done();
        });
    });
  });
});

describe("Login", () => {
  describe("/POST login ", () => {
    it("it should reject the request body (and send an error) if user parameter is missing", (done) => {
      // arrange
      const badUserLogin = { username: "", password: "password" };
      //act
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(badUserLogin)
        // assert
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("it should reject the request body (and send an error) if password parameter is missing", (done) => {
      // arrange
      const badUserLogin = { username: "blah", password: "" };
      //act
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(badUserLogin)
        // assert
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("it should reject the request body (and send an error) if both username and password parameter is missing", (done) => {
      // arrange
      const badUserLogin = { username: "", password: "" };
      //act
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(badUserLogin)
        // assert
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("it should reject the request body (and send an error) if user login is incorrect", (done) => {
      // arrange
      const badUserLogin = { username: "fake", password: "password" };
      //act
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(badUserLogin)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("it should reject the request body (and send an error) if request is formatted incorrectly", (done) => {
      // arrange
      const badUserLogin = { user: "fake", pass: "password" };
      //act
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(badUserLogin)
        // assert
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
    it("it should have a 200 status if the user's login info is correct", (done) => {
      // arrange
      const userLogin = { username: "yellowleopard753", password: "jonjon" };
      //act
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(userLogin)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
    it("it should create an access token after passing authentication challenge", (done) => {
      // arrange
      const userLogin = { username: "yellowleopard753", password: "jonjon" };
      //act
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(userLogin)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a.uuid();
          done();
        });
    });
    it("it should reject a brute force attack", (done) => {
      // arrange
      const badUserLogin = { username: "lazywolf342", password: "blah" };

      const badRequest = () => {
        return (
          chai
            .request(server)
            .post("/api/login")
            .set("content-type", "application/json")
            .send(badUserLogin)
            // assert
            .end((err, res) => {
              res.should.have.status(401);
            })
        );
      };

      const limitHit = () => {
        return (
          chai
            .request(server)
            .post("/api/login")
            .set("content-type", "application/json")
            .send(badUserLogin)
            // assert
            .end((err, res) => {
              res.should.have.status(418);
              done();
            })
        );
      };

      // act
      badRequest();
      badRequest();
      limitHit();
    });
    it("it should allow access after two wrong attempts", (done) => {
      // arrange
      const badUserLogin = { username: "greenlion235", password: "water" };
      const goodUserLogin = { username: "greenlion235", password: "waters" };

      const badRequest = () => {
        return (
          chai
            .request(server)
            .post("/api/login")
            .set("content-type", "application/json")
            .send(badUserLogin)
            // assert
            .end((err, res) => {
              res.should.have.status(401);
            })
        );
      };

      const correctAttempt = () => {
        return (
          chai
            .request(server)
            .post("/api/login")
            .set("content-type", "application/json")
            .send(goodUserLogin)
            // assert
            .end((err, res) => {
              res.should.have.status(200);
              done();
            })
        );
      };

      // act
      badRequest();
      badRequest();
      correctAttempt();
    });
    it("it should return the same access token for consecutive logins completed immediately", (done) => {
      // arrange
      const userLogin = { username: "yellowleopard753", password: "jonjon" };
      let storedId = "";
      //act
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(userLogin)
        // assert
        .end((err, res) => {
          storedId = res.body;
        });
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(userLogin)
        // assert
        .end((err, res) => {
          res.body.should.equal(storedId);
          done();
        });
    });
  });
});

describe("Cart", function () {
  let accessTokenForUrl;
  beforeEach(function (done) {
    const userLogin = { username: "yellowleopard753", password: "jonjon" };
    // runs once before the first test in this block
    chai
      .request(server)
      .post("/api/login")
      .set("content-type", "application/json")
      .send(userLogin)
      .end((err, res) => {
        accessTokenForUrl = res.body;
        done();
      });
  });

  describe("/POST /me/cart ", () => {
    it("it should POST a random item (that exists in store) to the cart if a user is logged in", (done) => {
      // assemble
      // in order to really test, I want to choose a random product among Ids that we have
      // doing random ensures that we can't beat the test easily
      let randomProduct = Math.floor(Math.random() * 5) + 1;

      //act
      chai
        .request(server)
        .post(`/api/me/cart?product=${randomProduct}&accessToken=${accessTokenForUrl}`)
        // assert
        .end((err, res) => {
          // check that the cart has the item we wanted
          res.body.should.be.an("array");
          res.body.should.include.something.that.has.property(`product_${randomProduct}`);
          done();
        });
    });
    it("it should post an item to the cart with all its relevant info", (done) => {
      // assemble
      // this test has more to do with the shape of the obj
      const dummyProduct = {
        product_5: {
          quantity: 1,
          name: "Glasses",
          price: 150,
          categoryId: "2",
        },
      };

      //act
      chai
        .request(server)
        .post(`/api/me/cart?product=5&accessToken=${accessTokenForUrl}`)
        // assert
        .end((err, res) => {
          res.should.have.status(200);
          // check that the cart has the item we wanted
          res.body.should.be.an("array");
          res.body.should.include.something.that.deep.equals(dummyProduct);
          done();
        });
    });
    it("it should NOT post a random item (that exists in store) to the cart if no user is logged in", (done) => {
      // assemble
      // in order to really test, I want to choose a random product among Ids that we have
      // doing random ensures that we can't beat the test easily
      let randomProduct = Math.floor(Math.random() * 5) + 1;

      //act
      chai
        .request(server)
        .post(`/api/me/cart?product=${randomProduct}`)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("it should NOT allow the user to add to cart if TOKEN_VALIDITY_TIMEOUT has passed ", (done) => {
      // assemble
      // we'll go for 15 minutes
      const setTime = 900001;
      clock.tick(setTime);

      //act
      chai
        .request(server)
        // remember that our access token was grabbed before this...
        .post(`/api/me/cart?product=5&accessToken=${accessTokenForUrl}`)
        // assert
        .end((err, res) => {
          res.should.have.status(401);
          done();
        });
    });
    it("it should NOT allow adding to cart if product number is invalid", (done) => {
      //act
      chai
        .request(server)
        .post(`/api/me/cart?product=1000&accessToken=${accessTokenForUrl}`)
        // assert
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

const checkFilter = (responseArray, term) => {
  // use regEx to ignore case of term
  const regEx = new RegExp(term, "gi");

  // this reducer returns true only if all terms include the term in name or description
  // if false is returned, it means the list is improperly filtered when passed to checkFilter
  return responseArray.reduce((status, currentProduct) => {
    if (regEx.test(currentProduct.description) || regEx.test(currentProduct.name)) {
      return status;
    } else {
      return (status = false);
    }
  }, true);
};
