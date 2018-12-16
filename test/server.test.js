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
})

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