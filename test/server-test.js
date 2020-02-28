let chai = require('chai');
let chaiHttp = require('chai-http');
const server = require("../app/server");

let should = chai.should();

chai.use(chaiHttp);

describe("/GET brands", () => {
    it("should GET all brands", done => {
      chai
        .request(server)
        .get("/api/brands")
        .end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
});