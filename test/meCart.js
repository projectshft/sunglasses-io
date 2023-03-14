let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server");

let should = chai.should();


chai.use(chaiHttp);

describe('Me/cart', () => {
  it("it should GET all of the items in users cart", done => {

    let user = {
      "username": "lazywolf342",
      "password": "tucker"
    }
    chai
    .request(server)
    .post('/login')
    .send(user).then((response) => {
      console.log(response.data)
      chai
      .get('/me/cart')
      .send(currentAccessToken)
    })
    .end((err, res) => {
      res.should.have.status(200);
      done();
    });
  });
});

