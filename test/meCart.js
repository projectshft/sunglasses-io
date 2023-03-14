let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

let should = chai.should();
var agent = chai.request.agent(server)

chai.use(chaiHttp);

describe('Me/cart', () => {
  it("it should GET all of the items in users cart", done => {

    let user = {
      "username": "lazywolf342",
      "password": "tucker"
    }
    agent
    .post('/login')
    .send(user).then((response) => {
      console.log(response.data)
      agent
      .get('/me/cart')
      // .send(response.currentAccessToken)
    })
    .end((err, res) => {
      res.should.have.status(200);
      done();
    });
  });
});

