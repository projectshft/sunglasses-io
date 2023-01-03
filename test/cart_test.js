var should = require('chai').should;
const server = require('../app/server.js')
const chaiHttp = require('chai-http')
const chai = require('chai')
const brands = require('../initial-data/brands.json')

should = chai.should();
chai.use(chaiHttp)  

// Add item to cart
describe('Add item', () => {
  it('Should add an item to user cart', done => {
    chai 
      .request(server)
      .post('/cart/2')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('array');
        res.body[0].should.have.keys('id', 'name', 'categoryId', 'description',
        'price', 'imageUrls')
        done();
      })
    })
  })

  describe('Delete item from cart', () => {
    it('Should delete an item from cart if it has an id', (done) => {      
      chai
        .request(server)
        .delete(`/cart/${item.id}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('array');
          expect(res.body).to.have.lengthOf(1);
          done();
        })
      }) 
    })