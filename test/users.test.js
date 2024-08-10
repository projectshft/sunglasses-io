const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app/server'); // Adjust this path as needed
const expect = chai.expect;

chai.use(chaiHttp);

describe('Users API', () => {
  it('should POST user login', (done) => {
    chai.request(app)
      .post('/users/login')
      .send({ email: 'test@example.com', password: 'password' }) // Adjust based on your login requirements
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        done();
      });
  });

  it('should return 401 for invalid login', (done) => {
    chai.request(app)
      .post('/users/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' }) // Adjust based on your login requirements
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(401);
        expect(res.body).to.have.property('message').that.equals('Invalid credentials');
        done();
      });
  });
});
