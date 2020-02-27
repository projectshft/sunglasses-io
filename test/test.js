
let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app/server')

let should = chai.should()
let expect = chai.expect

chai.use(chaiHttp);

// ********  testing /api/brands  
describe('Brands', () => {
    describe('/GET brands', () => {
      it('it should GET all the brands', done => {
        chai
          .request(server)
          .get('/brands')
          .end((error, response) => {
            response.should.have.status(200)
            response.body.should.be.an('array')
            done()
          })
      })
    })
})