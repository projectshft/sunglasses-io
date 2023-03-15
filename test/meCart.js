
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server.js");

let should = chai.should();
chai.use(chaiHttp);

//These tests posts delete and edit users items after they Login
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
});

describe('/POST Cart', () => {
  it("it should POST an item in users cart", done => {
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
      return agent.post('/me/cart')
      .then(function (res) {
         expect(res).to.have.status(201);
         expect(res).to.be.an('array');
         agent.close();
      });
  });
})
});

describe('/DELETE Cart/productId', () => {
  it("it should DELETE an item in users cart", done => {
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
      return agent.delete('/me/cart/:productid')
      .then(function (res) {
         expect(res).to.have.status(201);
         expect(res).to.be.an('array');
         agent.close();
      });
  });
})
});

describe('/POST Cart/productId', () => {
  it("it should Update the quantity of an item in users cart", done => {
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
      return agent.post('/me/cart/:productid')
      .then(function (res) {
         expect(res).to.have.status(201);
         expect(res).to.be.an('array');
         agent.close();
         done();
      });
  });
})
});
