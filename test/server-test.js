const chai = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

chai.use(chaiHTTP);

//Brands test
describe("/GET brands", () =>{
    it("should go get all of the brands", () =>{
        chai.request(server)
        chai.get("/api/brands")
        chai.end((error, response)=>{
           chai.expect(response).to.have.status(200);
           chai.expect("Content-Type", "application/json");
           chai.expect(response.body).to.be.an("array");
           chai.expect(response.body).to.have.lengthOf(5);
           done();
        });
    });
});
