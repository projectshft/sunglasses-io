let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

let should = chai.should();

chai.use(chaiHttp);

describe("Brands", () => {
    describe("/GET brands", () => {
        it("it should GET all of the brands", (done) => {
            chai
                .request(server)
                .get("/brands")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.should.have.lengthOf(5);
                    res.body[0].should.be.an("object");
                    res.body[0].should.have.property("id");
                    res.body[0].should.have.property("name");
                    res.body[0].name.should.equal("Oakley");
                    done();
                });
        });
    });
});