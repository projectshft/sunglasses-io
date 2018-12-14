const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;

chai.use(chaiHTTP);

//GET Brands
describe("/GET brands", () => {
    it("should return a list of all brands", done => {
        chai.request(server)
            .get("/api/brands")
            .end((err, res) => {
                assert.exists(res, 'res is neither `null` nor `undefined`')
                res.should.have.status(200)
                // assert("Content-Type", "application/json");
                // expect(res.body).to.be.an("array");
                done();
            });
    });
})