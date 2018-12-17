const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

//GET Brands
describe("/GET brands", () => {
    it.only("should GET all brands", done => {
        chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
            assert.isNotNull(res.body);
            //expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(5);
            done();
        });
    });
    it.only("should limit results to those with a query string", done => {
        chai
        .request(server)
        .get("/api/brands?query=Burberry")
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

    it.only("should return all brands if query is missing", done => {
        chai
        .request(server)
        .get("/api/brands?query=")
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(5);
            done();
            });
        });
});

//GET specific brand of a specific pair of sunglasses

describe("/GET specific brand of a specific pair of sunglasses", () => {
    it.only("should GET the specific brand of a certain pair of sunglasses", done => {
        chai
        .request(server)
        .get("/api/brands/:id/products")
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect("Content-Type", "application/json");
            expect(res.body).to.be.an("array");
            done();
        });      
    });
});

//GET Products
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
        .get("/api/products?query=Superglasses")
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
            .get("/api/products?query=")
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(11);
                done();
                });
            });
    });
    
    describe("/POST login user", () => {
        it.only("should login the user", done => {
          chai
            .request(server)
            .post("/api/login")
            .end((err, res) => {
              assert.isNull(err);
              expect(res).to.have.status(200);
              expect(res.body).to.be.lengthOf(16);
              expect(res.body).to.be.a("string");
              done();
            });
        });
      });

//Increase the pairs of sunglasses of an already existing pair in the cart
describe("/POST increase pair of specific sunglasses in cart", () => {
    it.only("should POST addition of already existing pair of sunglasses", done => {
        chai
        .request(server)
        .post("/api/me/cart/1")
        .end((err, res) => {
            assert.isNotNull(res.body);
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            expect("Content-Type", "application/json");
            done();
        });
    });
    it.only("should not let you accept a pair of sunglasses that doesn't already exist in cart", done => {
        chai
        .request(server)
        .post("/api/me/cart/2")
        .end((err, res) => {
            expect(res.body).to.be.null;
            expect(err).to.be.not.null;
            expect(res).to.have.status(404);
            done();
        });
    });
 });      