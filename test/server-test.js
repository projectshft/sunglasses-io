const chai = require("chai");
const server = require('../app/server')
const chaiHTTP = require("chai-http");

const assert = chai.assert;
const { expect } = require('chai');
const should = chai.should();

chai.use(chaiHTTP);
// chai.use(require("chai-sorted"));


describe('/GET brands', () => {
    it.only('it should GET all the brands', done => {
        chai
            .request(server)
            .get('/api/brands')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.length.should.be.eql(5);
                done();
            });
    });
});


