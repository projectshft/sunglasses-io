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
    /* it("it should NOT return the same access token for consecutive logins after a set time", (done) => {
      // arrange
      const userLogin = { username: "yellowleopard753", password: "jonjon" };
      const setTime = 900001;
      let storedId = "";

      chai //act
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(userLogin)
        // assert
        .end((err, res) => {
          storedId = res.body;
        });

      clock.tick(setTime);
      chai
        .request(server)
        .post("/api/login")
        .set("content-type", "application/json")
        .send(userLogin)
        // assert
        .end((err, res) => {
          res.body.should.not.equal(storedId);
          clock.restore();
          done();
        });
    }); */
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
