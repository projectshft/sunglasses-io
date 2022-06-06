let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Products", () => {
    describe("/GET products", () => {
        it("it should GET all of the products", (done) => {
            chai
                .request(server)
                .get("/products")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.should.have.lengthOf(11);
                    res.body[0].should.be.an("object");
                    res.body[0].should.have.property('imageUrls');
                    done();
                });
        });
    });
});