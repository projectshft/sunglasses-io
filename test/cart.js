
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../server.js");

let should = chai.should();
chai.use(chaiHttp);

describe('/GET cart', () => {
  it("should get items in user cart", (done) => {
    let login_info = {
      "username": "yellowleopard753",
      "password": "jonjon"
    }
    var agent = chai.request.agent(server)
    agent
    .post('/login')
    .send(login_info)
    done()
    .then(function(res) {
      const token = res.body[0].token;
      expect(res).to.have.cookie(token)
      return agent.get('/me/cart')
      .then(function(res) {
        expect(res).to.have.status(200);
        agent.close();
      });
    });
  })
});

describe('/DELETE Cart/productId', () => {
  it("should delete an item in user cart", (done) => {
    let login_info = {
      "username": "yellowleopard753",
      "password": "jonjon"
    }
    var agent = chai.request.agent(server)
    agent
    .post('./login')
    .send(login_info)
    done()
    .then(function(res) {
      const token = res.body[0].token;
      expect(res).to.have.cookie(token)
      return agent.delete('/me/cart/:productid')
      .then(function(res) {
        expect(res).to.be.an('array');
        agent.close();
      });
    });
  })
});

describe('/POST Cart', () => {
  it(" should post an item in users cart", done => {
    let login_info = {
      "username": "yellowleopard753",
      "password": "jonjon"
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
        expect(res).to.be.an('array');
        agent.close();
      });
    });
  })
  });

  describe('/POST Cart/productId', () => {
    it(" should Update the quantity of an item in cart", done => {
      let login_info = {
        "username": "yellowleopard753",
        "password": "jonjon"
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
          expect(res).to.be.an('array');
          agent.close();
          done();
       });
   });
 })
 });