let chai = require('chai');
let chaiHttp = require('chai-http');
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

let should = chai.should();


chai.use(chaiHttp);

describe("/GET brands", () => {
    it("should GET all brands", done => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(5);
            done();
        });
    });
});

describe("/GET brands/:id/products", () => {
    it("should GET all brands", done => {
      chai
        .request(server)
        .get(`/api/brands/1/products`)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.an('array');
            res.body.length.should.be.eql(1);
            done();
        });
    });
});