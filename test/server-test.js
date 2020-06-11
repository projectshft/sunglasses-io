let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app/server')
let should = chai.should();

chai.use(chaiHttp);

