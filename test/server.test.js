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
    it('should return a list of sunglasses by brand id', done => {
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

//GET Product list from search bar
describe("/GET products by query", () => {
    it("should GET all products", done => {
        chai.request(server)
            .get("/api/products")
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(11);
                done();
            });
    });
    it("should limit results to those with a query string", done => {
        chai.request(server)
            .get("/api/products?query='brown'")
            .end((err, res) => {
                assert.isNotNull(res.body);
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                done();
            });
    });
    it("should return all products if query is missing", done => {
        chai.request(server)
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
})

//POST login
describe("/POST login", () => {
    it("should send username and password to /path", done => {
        chai.request(server)
            .post("/api/login")
            .send({
                'username': 'greenlion235',
                'password': 'waters'
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect("Content-Type", "text/plain");
                done();

            })
    })
    it("return error for incorrect username or password", done => {
        chai.request(server)
            .post("/api/login")
            .send({
                'username': 'greenlion235',
                'password': 'water'
            })
            .end((err, res) => {
                expect(res).to.have.status(401);
                done();
            })

    })
    it("should return an access token", done => {
        chai.request(server)
            .post("/api/login")
            .send({
                'username': 'greenlion235',
                'password': 'waters'
            })
            .end((err, res) => {
                expect(res).to.have.status(200);
                done();
            })
    })
})

//GET cart
describe("/GET current cart of a user", () => {
    it("should check that user has access token", done => {
        chai.request(server)
            .get("/api/me/cart")
            .end((err, res) => {
                expect(res).to.have.status(200);
            })
    } )
})
