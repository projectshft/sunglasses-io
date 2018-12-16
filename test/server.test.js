const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should();
const Products = require("../initial-data/products.json");

chai.use(chaiHTTP);

//GET Brands
describe("/GET brands", () => {
    it("should return an array of all brands", done => {
        chai.request(server)
            .get("/api/brands")
            .end((err, res) => {
                expect(res).to.have.status(200)
                assert.exists(res, 'res is neither `null` nor `undefined`')
                expect(res.body).to.be.an("array")
                res.body.should.have.lengthOf(5)
                assert("Content-Type", "application/json")
                done();
            });
    });
});

//GET Products by Brand id
describe("/GET products by brandId", () => {
    it('should return a list of sunglasses by brand id', (done) => {
        //act
        chai.request(server)
            .get("/api/brands/1/products")
        //assert
            .end((err, res) => {
                expect(res).to.have.status(200)
                expect(res.body).to.be.an("array")
                assert("Content-Type", "application/json")
                done();
            })
    })
});