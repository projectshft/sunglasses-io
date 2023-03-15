
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server.js");

let should = chai.should();
chai.use(chaiHttp);

//This test posts users data and gives them access to their cart
describe('/GET Cart', () => {
  it("it should GET items in users cart", done => {
    let login_details = {
      "username": "lazywolf342",
      "password": "tucker"
    }
    var agent = chai.request.agent(server)
    agent
    .post('/login')
    .send(login_details)
    done()
    .then(function (res) {
      const token = res.body[0].token;
      expect(res).to.have.cookie(token)
      return agent.get('/me/cart')
      .then(function (res) {
         expect(res).to.have.status(200);
         agent.close();
      });
  });
})
})