const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

//Brands test
describe("/GET brands", () =>{
    it("should go get all of the brands", done =>{
        chai
        .request(server)
        .get("/api/brands")
        .end((error, response)=>{
            assert.isNotNull(response.body);
            expect(response).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(response.body).to.be.an("array");
            expect(response.body).to.have.lengthOf(5);
            done();
        });
    });
});

// Products test
describe("/GET products", () => {
    it("should go get all of the products", done => {
      chai
      .request(server)
      .get("/api/products")
      .end((error, response) => {
          assert.isNotNull(response.body);
          expect(response).to.have.status(200);
          expect("Content-Type", "application/json");
          expect(response.body).to.be.an("array");
          expect(res.body).to.have.lengthOf(11);
          done();
        });
    });
    it("should filter to the products that have a query string", done => {
        chai
          .request(server)
          .get("/api/products?query=oakley")
          .end((error, response) => {
            assert.isNotNull(response.body);
            expect(error).to.be.null;
            expect(response).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(response.body).to.be.an("array");
            expect(response.body).to.have.lengthOf(1);
            done();
          });
      });
      it("if query is blank it should return all of the products", done => {
        chai
          .request(server)
          .get("/api/products?query=")
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(response.body).to.be.an("array");
            expect(response.body).to.have.lengthOf(11);
            done();
          });
      });
    });



// specific brand test
describe("/GET specific category of product", () => {
    it.only("should go get one specific product category", done => {
      chai
        .request(server)
        .get("/api/brands/:brandId/products")
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect("Content-Type", "application/json");
          expect(response.body).to.be.an("array");
          done();
        });
    });
  });

  //login test
  describe("/POST,login", () => {
    it("should return status 200 and a token, if it is an authenticated user", done => {
      let userLoginData = { username: "carson.poe@gmail.com", password: "goheels" }
      chai
        .request(server)
        .post('/api/login')
        .send(userLoginData)
        .end((error, response) => {
          expect(response).to.have.status(200);
          expect(response.body).to.be.a("string");
          done();
      });
    })
    it("should return status 400 for incorrect format", done => {
        userLoginData = { user: "carson.poe@example.com", password: "goheels" }
        chai
          .request(server)
          .post('/api/login')
          .send(userLoginData)
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(400);
            done();
        });
      })
      it("should return status 401 for invalid username or password", done => {
        userLoginData = { username: "invalid@gmail.com", password: "wrong" }
        chai
          .request(server)
          .post('/api/login')
          .send(userLoginData)
          .end((error, response) => {
            expect(error).to.be.null;
            expect(response).to.have.status(401);
            done();
        });
      })
    });