const chai = require('chai');
const chaiHTTP = require('chai-http');
const server = require('../app/server');
const expect = chai.expect;
const assert = chai.assert;


chai.use(chaiHTTP);
chai.use(require('chai-sorted'));

//GET BRANDS
describe('/GET brands', () => {
  it.only('should GET all brands', done => {
    
  })
})
