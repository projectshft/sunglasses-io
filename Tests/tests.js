const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHttp);
chai.use(require("chai-sorted"));

// beforeEach(() => {
//     Sunglasses.removeAll();
// })

describe("/GET sunglasses", () => {
    it.only("should GET all products", done => {
        chai
        .request(server)
        .get('/v1/sunglasses')
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
    it.only("should limit results to those with a query string", done => {
        chai
            .request(server)
            .get("/v1/sunglasses?query=best")
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
    it.only("returns all products if query is missing", done => {
        chai
            .request(server)
            .get("/v1/sunglasses?query=")
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
            .get("/v1/sunglasses?sort=price")
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

});



