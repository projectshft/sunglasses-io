let chai = require('chai');
let chaiHttp = require('chai-http');
const server = require("../app/server");
const expect = chai.expect;
let should = chai.should();


chai.use(chaiHttp);

describe("/GET brands", () => {
    it("should GET all brands", done => {
        chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
            expect(err).to.be.null
            expect("Content-Type", "application/json");
            res.body.should.not.equal('null')
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.equal(5);
            done();
        });
    });
    it("should limit results when a user search a brand with a query string", done => {
        chai
        .request(server)
        .get("/v1/brands?query=Oakley")
        .end((err, res) => {
            // expect(err).to.be.null;
            // expect(res).to.have.status(200);
            // expect("Content-Type", "application/json");
            // expect(res.body).to.be.an("array");
            // expect(res.body).to.have.lengthOf(1);
        });
    });
});

describe("/GET brands/:id/products", () => {
    it("should GET all brands", done => {
      chai
        .request(server)
        .get(`/api/brands/1/products`)
        .end((err, res) => {
            expect(err).to.be.null
            expect("Content-Type", "application/json");
            res.body.should.not.equal('null')
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(1);
            done();
        });
    });
});

describe("/GET products", () => {
    it("should GET all products", done => {
      chai
        .request(server)
        .get("/api/products")
        .end((err, res) => {
            expect(err).to.be.null
            expect("Content-Type", "application/json");
            res.body.should.not.equal('null')
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(11);
            done();
        });
    });
});