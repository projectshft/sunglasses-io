const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../app/server.js');

const expect = chai.expect();
const should = chai.should();

chai.use(chaiHttp);

describe('Sunglasses', () => {
  describe('/GET sunglasses', () => {
    it('it should GET all the sunglasses', done => {
      chai
        .request(server)
        .get('/sunglasses')
        .end((err, res) => {
          
        })
    })
  })
})