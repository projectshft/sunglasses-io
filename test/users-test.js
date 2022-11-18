let User = require('../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server');

let should = chai.should();

chai.use(chaiHttp);

describe('/POST user', () => {
  it('should POST a user into the database', async function () {
    chai
      .request(server)
      .post('/user')
      .send(User)
      .end((err, res) => {
        res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('cart');
          res.body.should.have.property('name');
          res.body.should.have.property('login');
          res.body.LOGIN.should.have.property('username')
          res.body.LOGIN.should.have.property('password');
          done();
        });
    });
  });

  