const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should;

chai.use(chaiHTTP);
chai.use(require("chai-sorted"));

//GET ALL BRANDS
describe("/GET brands", () => {
  it.only("should GET all brands", done => {
    chai
      .request(server)
      .get("/api/brands")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(5);
        done();
      });
  });
});

//GET ALL PRODUCTS BY BRAND
describe("/GET products by brand", () => {
  it.only("should GET all products in a brand", done => {
    chai
      .request(server)
      .get("/api/brands/1/products") //testing for brand id 1
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(3);
        done();
        });
    });
  it.only("fails as expected with unknown id", done => {
    chai
      .request(server)
      //property doesn't exist
      .get("/api/brands/7/products") //7 is an unidentified id
      .end((err, res) => {
        expect(res).to.have.status(404);
        done();
        });
    });
});

//GET ALL PRODUCTS BY SEARCH
describe("/GET products", () => {
  it.only("should GET all products", done => {
    chai
      .request(server)
      .get("/api/products")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(11);
        done();
    });
  });
  it.only("should limit results to those with a query string", done => {
    chai
      .request(server)
      .get("/api/products?query=sweetest")
      .end((err, res) => {
        assert.isNotNull(res.body);
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect("Content-Type", "application/json");
        expect(res.body).to.be.an("array");
        expect(res.body).to.have.lengthOf(1);
        done();
      });
  });
  it.only("should return all products if query is missing", done => {
    chai
    .request(server)
    .get("/api/products?query=")//when there is no query provided
    .end((err, res) => {
      expect(err).to.be.null;
      expect(res).to.have.status(200);
      expect("Content-Type", "application/json");//look at response.headers, this needs to be edited
      expect(res.body).to.be.an("array");
      expect(res.body).to.have.lengthOf(11);//length of total product list
      done();
      });
  });
  //return to this to add failing condition?
});

//LOGIN
describe("/POST user login", () => {
  it.only("should return 200 response if the user logged in correctly", done => {
    //arrange
    const fullUserCredentials = {
      username: 'yellowleopard753',
      password: 'jonjon'
    };
    //act
    chai
        .request(server)
        .post("/api/login")
        .send(fullUserCredentials)
        //assert
        .end((err, res) => {
            expect(err).to.be.null
            expect(res).to.have.status(200); 
            done();
      });
  })
  it.only("should return 400 if user is missing a parameter", done => {
    const missingUserCredentials = {
      username: 'yellowleopard743',
      password: ''
    }
    //act
    chai
      .request(server)
      .post("/api/login")
      .send(missingUserCredentials)
      //assert
      .end((err, res) => {
          expect(res).to.have.status(400); 
          done();
    });
  })
  it.only("should return 401 if the login fails", done => {
    //arrange
    const wrongCredentials = {
      username: "someguy",
      password: "password"
    }
    //act
    chai
      .request(server)
      .post("/api/login")
      .send(wrongCredentials)
      //assert
      .end((err, res) => {
          expect(res).to.have.status(401); 
          done();
    });
  })
});

//GET CART FOR LOGGED IN USER

//TODO test for correctly logged in user

describe("/GET cart by logged in user", () => {
  it.only("should return 401 response if the user tries to access cart without being logged in", async function () {
    chai
        .request(server)
        .get("/api/me/cart")
        .end((err, res) => {
            expect(res).to.have.status(401); 
        
      });
  });
});