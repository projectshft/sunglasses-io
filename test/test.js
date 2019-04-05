let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../app/server')

let should = chai.should()

chai.use(chaiHttp)

describe('Brands', () => {
  describe('/GET brands', () => {
    it('it should GET all the brands', done => {
      chai
        .request(server)
        .get('/brands')
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.an('array')
          response.body.length.should.be.eq(5)
          done()
        })
    })
  })
})
