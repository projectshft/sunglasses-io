let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("Cart", () => {
    describe("/Get cart", () => {
        it("it should get the item in a validated user's cart", (done) => {
            let user = {
                username: "yellowleopard753",
                password: "jonjon"
            }
            let token;
            chai
                .request(server)
                .post("/login")
                .send(user)
                .end((err, res) => {
                    token = res.body;
                    done();
                });
            chai
                .request(server)
                .get(`me/cart?access-token=${token}`)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    res.body.should.have.lengthOf(0);
                    done();
                });

        });
    });
});