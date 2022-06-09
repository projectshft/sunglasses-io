let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Login", () => {
    describe("/POST login", () => {
        it("it should create an access token for a valid user", (done) => {
            let user = {
                username: "yellowleopard753",
                password: "jonjon"
            }
            chai
                .request(server)
                .post("/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("string");
                    res.body.should.have.lengthOf(16);
                    done();
                });
        });
        it("it should not create an access token for an invalid user", (done) => {
            let user = {
                username: "parrothead99",
                password: "margaritaville"
            }
            chai
                .request(server)
                .post("/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
        it("it should not create an access token if username is missing", (done) => {
            let user = {
                username: "yellowleopard753",
            }
            chai
                .request(server)
                .post("/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
        it("it should not create an access token if password is missing", (done) => {
            let user = {
                password: "jonjon"
            }
            chai
                .request(server)
                .post("/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });
});