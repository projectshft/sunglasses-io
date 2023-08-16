const chai = require('chai')
let chaiHttp = require('chai-http')
chai.use(chaiHttp)
let server = require('./server')
let should = chai.should()

// Tests for Brands

describe('Brands', () => {
    describe('/GET brands', () => {
        it('it should GET all the brands', (done) => {
            chai.request(server)
        })
    })
})
