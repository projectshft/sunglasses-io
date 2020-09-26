const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHttp);
chai.use(require("chai-sorted"));

//GET Products
describe("/GET products", () => {
    it.only("should GET all products", done => {
        chai
        .request(server)
        .get('/v1/products')
        .end((err, res) => {
            assert.isNotNull(res.body);
            expect(err).to.be.null;
            expect(res).to.have.status(200)
            expect("Content-Type", "application/json");
            expect(res.body).to.be.an("array");
            expect(res.body).to.have.lengthOf(11);
            done();
        });
    });
    it.only("should limit results to those with case insensitive query string", done => {
        chai
            .request(server)
            .get("/v1/products?query=BesT")
            .end((err, res) => {
                assert.isNotNull(res.body);
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(4);
                done();
            });
    });
    it.only("should return products with case insensitive query string in name", done => {
        chai
            .request(server)
            .get("/v1/products?query=SupEr")
            .end((err, res) => {
                assert.isNotNull(res.body);
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(1);
                done();
            })
    })
    it.only("returns all products if query is missing", done => {
        chai
            .request(server)
            .get("/v1/products?query=")
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(11);
                done();
            });
    });
    it.only("should sort results when given sort parameter", done => {
        chai
            .request(server)
            .get("/v1/products?sort=price")
            .end((err,res) => {
                assert.isNotNull(res.body);
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(11);
                expect(res.body).to.be.sortedBy("price");
                done();
            });
    });
    it("fails when unrecognized property", done => {
       chai
            .request(server)
            .get("/v1/products?sort=edible")
            .end((err,res) => {
                expect(err).to.not.be.null;
                expect(res).to.have.status(404);
                done();
            });
    });
});

//Get Brands
describe("/GET brands", () => {
    it.only("should GET all brands", done => {
        chai
            .request(server)
            .get("/v1/brands")
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
    it.only("should limit results to those with case insensitive query string", done => {
        chai
            .request(server)
            .get("/v1/brands?query=ray")
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
    it("fails when no brands match query", done => {
        chai
            .request(server)
            .get("/v1/brands?query=Apple")
            .end((err, res) => {
                expect(err).to.not.be.null;
                expect(res).to.have.status(404);
                done();
            });
    });
});



describe("/POST add to cart", () => {
    it.only("should POST added item to cart", done => {
        chai
            .request(server)
            .post("/v1/me/products/1/add-to-cart")
            .end((err, res) => {
                assert.isNotNull(res.body);
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                done();
            });
    });
    // it. only("should not let user add an item that doesnt exist", done => {
    //     chai
    //         .request(server)
    //         .post("/v1/me/sunglasses/50/add-to-cart")
    //         .end((err, res) => {
    //             expect(res).to.have.status(404);
    //             done();
    //         });
    // });
});




