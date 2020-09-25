// products[i].categoryId = brands[i].id

let Sunglasses = require('../app/models/sunglasses');


let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
const { expect } = require('chai');

let should = chai.should();

// chai.use(chaiHttp);
// beforeEach(() => {
//   Sunglasses.removeAll();
// });