let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Login", () => {
    describe("/POST login", () => {
        it("it should create an access token for a valid user", (done) => {
            chai
                .request(server)
                .get("/login")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("string");
                    res.body.should.have.lengthOf(16);
                    done();
                });
        });
    });
});