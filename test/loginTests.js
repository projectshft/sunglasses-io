const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server');

chai.should();
chai.use(chaiHttp);

describe('Login', () => {
  describe('/POST login', () => {
    it('should login the user and return a valid access token', (done) => {
      const testUser = { username: 'lazywolf342', password: 'tucker' };

      chai
        .request(server)
        .post('/login')
        .send(testUser)
        .end((error, response) => {
          response.should.have.status(200);
          response.body.should.be.an('object');
          response.body.username.should.eql(testUser.username);
          done();
        });
    });
  });
});
