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
                    res.body.should.be.an("object");
                    res.body.should.have.property("username");
                    res.body.should.have.property("lastUpdated");
                    res.body.should.have.property("token");
                    done();
                });
        });
    });
});