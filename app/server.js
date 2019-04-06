const http = require('http');
const url = require('url');
const fs = require('fs');
const finalHandler = require('finalhandler');
const queryString = require('querystring');
const Router = require('router');
const bodyParser = require('body-parser');
const { uid } = require('rand-token');

const PORT = 3001;
const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'Origin, X-Requested-With, Content-Type, Accept, X-Authentication',
  'Content-Type': 'application/json'
};
const myURL = 'https://www.sunglasses.io/products?test=true&another_test=false';
const parsedURL = url.parse(myURL).query;
console.log(queryString.parse(parsedURL));

let users = [];
let brands = [];
let products = [];

// Setup router
const router = Router();
router.use(bodyParser.json());

const server = http
  .createServer((request, response) => {
    // Handle CORS Preflight request
    if (request.method === 'OPTIONS') {
      response.writeHead(200, HEADERS);
      response.end();
    }
    router(request, response, finalHandler(request, response));
  })
  .listen(PORT, error => {
    if (error) {
      return console.log('Error on Server Startup: ', error);
    }
    users = JSON.parse(fs.readFileSync('./initial-data/users.json', 'utf8'));
    console.log(`Server setup: ${users.length} users loaded`);

    brands = JSON.parse(fs.readFileSync('./initial-data/brands.json', 'utf8'));
    console.log(`Server setup: ${brands.length} brands loaded`);

    products = JSON.parse(fs.readFileSync('./initial-data/products.json', 'utf8'));
    console.log(`Server setup: ${products.length} products loaded`);

    console.log(`Server is listening on port ${PORT}...`);
  });

router.get('/api/brands', (request, response) => {
  if (!brands) {
    response.writeHead(404, 'Not found.', HEADERS);
    return response.end();
  }

  const URL = request.url;
  let { query } = url.parse(URL);
  query = queryString.parse(query);
  const { limit } = query;

  if (!limit && limit !== undefined) {
    response.writeHead(400, 'Incorrectly formatted request', HEADERS);
    return response.end();
  }

  if (limit && !Number.isInteger(Number(limit))) {
    response.writeHead(400, 'Incorrectly formatted request', HEADERS);
    return response.end();
  }

  if (limit && Number.isInteger(Number(limit))) {
    const brandsRequested = brands.filter(brand => brands.indexOf(brand) < Number(limit));

    response.writeHead(200, HEADERS);
    return response.end(JSON.stringify(brandsRequested));
  }

  response.writeHead(200, HEADERS);
  response.end(JSON.stringify(brands));
});

router.get('/api/brands/:brandId/products', (request, response) => {
  const { brandId } = request.params;

  if (!brandId) {
    response.writeHead(400, 'Invalid request.', HEADERS);
    return response.end();
  }

  const result = products.filter(product => product.brandId === brandId);

  if (result.length === 0) {
    response.writeHead(404, 'No products with that brand ID found.', HEADERS);
    return response.end();
  }

  response.writeHead(200, HEADERS);
  response.end(JSON.stringify(result));
});

router.get('/api/products', (request, response) => {
  const URL = request.url;
  let { query } = url.parse(URL);
  query = queryString.parse(query);
  const { search } = query;

  if (search) {
    // check to see if search term is a brand name
    const brand = brands.find(b => b.name.toLowerCase() === search.toLowerCase());

    if (brand) {
      const result = products.filter(product => product.brandId === brand.id);

      response.writeHead(200, HEADERS);
      return response.end(JSON.stringify(result));
    }
  }

  response.writeHead(200, HEADERS);
  response.end(JSON.stringify(products));
});

module.exports = server;

// const shoppingCarts = {
//   userId: [
//     {
//       quantity: 1,
//       product: {
//         id: '2',
//         brandId: '1',
//         name: 'Black Sunglasses',
//         description: 'The best glasses in the world',
//         price: 100,
//         imageUrls: [
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
//         ]
//       }
//     },
//     {
//       quantity: 1,
//       product: {
//         id: '1',
//         brandId: '1',
//         name: 'Superglasses',
//         description: 'The best glasses in the world',
//         price: 150,
//         imageUrls: [
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg',
//           'https://image.shutterstock.com/z/stock-photo-yellow-sunglasses-white-backgound-600820286.jpg'
//         ]
//       }
//     }
//   ]
// };
