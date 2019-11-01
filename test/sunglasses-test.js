let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');

let should = chai.should();

chai.use(chaiHttp);

// GET / api / brands
// GET / api / brands /: id / products
// GET / api / products
// POST / api / login
// GET / api / me / cart
// POST / api / me / cart
// DELETE / api / me / cart /: productId
// POST / api / me / cart /: productId

chai.request(app)
  .get(brands)
  ("/api/brands")

  // what errors to expect

  // test first
