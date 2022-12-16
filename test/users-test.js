let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server.js');

let should = chai.should();

chai.use(chaiHttp);

describe('/POST login', () => {
    it('should log a user into the shopping cart', async function () {
      chai
        .request(server)
        .post('/login')
        .send('username', 'password')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.LOGIN.should.have.property('login');
          res.body.LOGIN.should.have.property('username');
          res.body.LOGIN.should.have.property('password');
          done();
      });
});
});
  
  