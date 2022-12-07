const http = require('http');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');
const cors = require('cors');
const url = require('url');

const checkValidParams = require('../helpers/checkValidParams.js');

const PORT = 3001;
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept, X-Authentication',
};

let users = [];
let brands = [];
let products = [];

const router = Router();
router.use(bodyParser.json());
router.use(cors());

const server = http
  .createServer((request, response) => {
    if (request.method === 'OPTIONS') {
      response.writeHead(200, CORS_HEADERS);
      return response.end();
    }

    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, (error) => {
    if (error) {
      console.log('Error on server startup: ', error);
    } else {
      console.log(`Server is listening at http://localhost:${PORT}`);
    }

    fs.readFile('initial-data/users.json', 'utf-8', (err, data) => {
      if (err) {
        throw err;
      }
      users = JSON.parse(data);
      console.log('User data loaded');
    });

    fs.readFile('initial-data/brands.json', 'utf-8', (err, data) => {
      if (err) {
        throw err;
      }
      brands = JSON.parse(data);
      console.log('Brand data loaded');
    });

    fs.readFile('initial-data/products.json', 'utf-8', (err, data) => {
      if (err) {
        throw err;
      }
      products = JSON.parse(data);
      console.log('Product data loaded');
    });
  });

router.get('/api/brands', (request, response) => {
  const params = queryString.parse(url.parse(request.url).query);
  let brandsRequested = [...brands];

  if (!checkValidParams(params, ['query', 'alphabetical'])) {
    response.writeHead(400);
    return response.end(
      'this endpoint only accepts "query" and "alphabetical" as parameters'
    );
  }

  if (params.query !== undefined) {
    brandsRequested = brands.filter((brand) =>
      brand.name.toLowerCase().includes(params.query)
    );
  }

  if (params.alphabetical !== undefined) {
    // if (params.alphabetical !== 'za' || params.alphabetical !== 'az') {
    //   response.writeHead(400);
    //   return response.end(
    //     'alphabetical paramter only accepts "za" and "az" and values'
    //   );
    // }
    if (params.alphabetical === 'za' || params.alphabetical === 'az') {
      brandsRequested.sort((a, b) => {
        const brand1 = a.name.toLowerCase();
        const brand2 = b.name.toLowerCase();

        if (params.alphabetical === 'az') {
          if (brand1 > brand2) {
            return 1;
          }

          if (brand1 < brand2) {
            return -1;
          }
        }

        if (params.alphabetical === 'za') {
          if (brand1 > brand2) {
            return -1;
          }

          if (brand1 < brand2) {
            return 1;
          }
        }
        return 0;
      });
    } else {
      response.writeHead(400);
      return response.end(
        'alphabetical paramter only accepts "za" and "az" and values'
      );
    }
  }
  response.writeHead(200, { 'Content-Type': 'application/json' });
  return response.end(JSON.stringify(brandsRequested));
});

module.exports = server;
