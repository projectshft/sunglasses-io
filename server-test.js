const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('./app/server');

let should = chai.should();
chai.use(chaiHttp);