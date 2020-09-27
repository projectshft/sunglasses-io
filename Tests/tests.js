const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;
let ShoppingCart = require('../app/models/shopping-cart')

chai.use(chaiHttp);
chai.use(require("chai-sorted"));

beforeEach(() => {
    ShoppingCart.clearCart();
})

//GET Products
describe("/GET products", () => {
    it.only("should GET all products", done => {
        chai
        .request(server)
        .get('/api/products')
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
            .get("/api/products?query=BesT")
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
            .get("/api/products?query=SupEr")
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
    it.only("should sort results when given sort parameter", done => {
        chai
            .request(server)
            .get("/api/products?sort=price")
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
            .get("/api/products?sort=edible")
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
            .get("/api/brands")
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
            .get("/api/brands?query=ray")
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
            .get("/api/brands?query=Apple")
            .end((err, res) => {
                expect(err).to.not.be.null;
                expect(res).to.have.status(404);
                done();
            });
    });
});

describe("/GET products by brand", () => {
    it.only("should return all products of specified brand", done => {
        chai
            .request(server)
            .get("/api/brands/1/products")
            .end((err, res) => {
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(3);
                done();
            });
    });
});

//CART TESTS:
//RETURN CART
describe("/GET cart", () => {
    it.only("should GET user cart", done => {
        chai
            .request(server)
            .get("/api/me/cart")
            .end((err, res) => {
                assert.isNotNull(res.body);
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(0);
                done();
            });
    });
});

//ADD ITEM
describe("/POST add to cart", () => {
    it.only("should POST added item to cart", done => {
        chai
            .request(server)
            .post("/api/me/cart?productId=1")
            .end((err, res) => {
                assert.isNotNull(res.body);
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array")
                expect(res.body).to.have.lengthOf(1);
                done();
            });
    });
    it.only("should not let user add product that doesnt exist", done => {
        chai
            .request(server)
            .post("/api/me/cart?productId=50")
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });
});

//DELETE ITEM
describe("/DELETE item from cart", () => {
    it.only("should DELETE item from cart", done => {
        chai
            .request(server)
            .delete("/api/me/cart/1")
            .end((err, res) => {
                assert.isNotNull(res.body);
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                expect("Content-Type", "application/json");
                expect(res.body).to.be.an("array");
                expect(res.body).to.have.lengthOf(0);
                done();
            });
    });
    it.only("should not let user delete item that doesnt exist", done => {
        chai
            .request(server)
            .delete("/api/me/cart/50")
            .end((err, res) => {
                expect(res).to.have.status(404);
                done();
            });
    });
});

//CHANGE PRODUCT QUANTITY
describe("/POST change item quantity", () => {
    it.only("should POST item difference to cart", done => {
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
});

