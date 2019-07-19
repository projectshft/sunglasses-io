let { expect } = require("chai");
const chaiHTTP = require("chai-http");
const server = require("../app/server");

chai.use(chaiHTTP);